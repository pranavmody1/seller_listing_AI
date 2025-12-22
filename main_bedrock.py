from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import base64
import json
import re
import boto3
from mangum import Mangum

# --- FastAPI app ---
app = FastAPI()

# CORS: keep permissive for testing; tighten later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # <-- set your site domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Bedrock Runtime client
# Uses IAM role from Lambda execution environment (no API keys needed!)
# Models are automatically enabled on first invocation - no manual activation required!
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1'  # Change to your preferred region
)

# Choose your model
# Models are automatically enabled across all AWS commercial regions when first invoked.
# Note: Some first-time users of Anthropic models may need to submit use case details.

# Option 1: Claude 3.5 Sonnet - Best quality, similar price to GPT-4o
MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"

# Option 2: Claude 3 Haiku - 90% cheaper, still excellent quality for structured data
# MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"

# Option 3: Claude 3 Opus - Highest quality, more expensive
# MODEL_ID = "anthropic.claude-3-opus-20240229-v1:0"

class DescriptionResponse(BaseModel):
    product_name: Optional[str] = None
    product_description: Optional[str] = None
    product_category: Optional[str] = None
    product_subcategory: Optional[str] = None
    highlights: Optional[List[str]] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    holiday: Optional[str] = None

@app.post("/describe", response_model=DescriptionResponse)
async def describe_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File is not an image.")
    image_bytes = await file.read()

    try:
        # (v1) No OCR. If you want OCR later, we'll add AWS Textract.
        ocr_text = ""

        # Encode image to base64 for Bedrock
        encoded = base64.b64encode(image_bytes).decode()
        mime_type = file.content_type

        allowed_categories = [
            "Baking Supplies","Kitchen Accessories","Holiday Costumes","Character Costumes","Costume Accessories",
            "Pet Costumes","Albums","Women","Bath & Body","Books","Movies & Music","Stuffed Animals",
            "Toys & Games","Pawlidays™ Pet Lovers","Personalized Products","Stationery","Gift Wrap",
            "Cellophane Bags","Gift Card Holders","Fillers","Ribbons & Bows","Tissue Paper","Specialty Supplies",
            "Seasonal Storage","Crafting","Costumes","Party Supplies","Home Decor","Stationery & Packaging",
            "Garden & Outdoor","Fashion","Gifts & Keepsakes","Seasonal Crafting","DIY Kits","Men","Kids",
            "Tableware","Dinnerware","Drinkware","Barware","Serveware","Party Favors","Backdrops & Signage",
            "Banners & Flags","Candles & Votives","Ceiling Décor","Centerpieces & Table Décor","Chair Covers",
            "Confetti","Decorating Fabrics","Door Banners, Curtains & Fringe","Garland","Lighting","Paper Lanterns",
            "Wall Decorations","Window Clings","Photo Booths","Apparel","Shoes","Accessories","Decorations",
            "Balloons","Crafts & DIY","Baking & Cooking"
        ]
        allowed_categories_text = "\n- " + "\n- ".join(allowed_categories)

        system_prompt = (
            "You are an assistant for online sellers. For any product image and its extracted text, return structured data in JSON. "
            "You MUST choose productCategory as EXACTLY ONE of the following allowed values (case-sensitive):\n"
            f"{allowed_categories_text}\n\n"
            "If the product fits 'Holiday Decor', also set a 'holiday' field with the specific holiday (e.g., Christmas, Halloween, Easter, Diwali). "
            "Rules:\n"
            "- productName: a concise, buyer-friendly title.\n"
            "- productDescription: a concise 1-2 sentence description.\n"
            "- productCategory: one from the allowed list above.\n"
            "- productSubcategory: a more specific subcategory if obvious (text), else null.\n"
            "- highlights: concise 1 line highlighting feature of product.\n"
            "- tags: 5-8 short keywords (array of strings).\n"
            "- holiday: string if detected (e.g., Diwali), else null.\n"
            "Respond ONLY valid minified JSON with these keys: productName, productDescription, productCategory, productSubcategory, highlights, tags, brand, holiday."
        )
        
        user_text = (
            f"{system_prompt}\n\n"
            "Using the image and the extracted text below, produce the JSON as specified. "
            f"\n\nExtracted text from image (OCR): {ocr_text.strip()}"
        )

        # Construct Bedrock API request (Claude format)
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": mime_type,
                                "data": encoded
                            }
                        },
                        {
                            "type": "text",
                            "text": user_text
                        }
                    ]
                }
            ],
            "temperature": 0.3  # Lower temperature for more consistent structured output
        }

        # Call AWS Bedrock
        response = bedrock_runtime.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps(request_body)
        )

        # Parse Bedrock response
        response_body = json.loads(response['body'].read())
        content = response_body['content'][0]['text'].strip()

        # Try JSON parse
        brand = None
        try:
            result = json.loads(content)
            product_name = result.get("productName")
            product_description = result.get("productDescription")
            product_category = result.get("productCategory")
            product_subcategory = result.get("productSubcategory")
            highlights = result.get("highlights") or []
            tags = result.get("tags") or []
            brand = result.get("brand")
            holiday = result.get("holiday")
            description = product_description or ""
            category = product_category
        except Exception:
            # Fallback regex-based parsing
            product_name = None
            product_description = None
            product_category = None
            product_subcategory = None
            highlights, tags = [], []
            holiday, category = None, None
            description = content

            name_match = re.search(r'"productName"\s*:\s*"([^"]+)"', content)
            if name_match: product_name = name_match.group(1)

            desc_match = re.search(r'"productDescription"\s*:\s*"([^"]+)"', content)
            if desc_match:
                product_description = desc_match.group(1)
                description = product_description

            cat_match = re.search(r'"productCategory"\s*:\s*"([^"]+)"', content)
            if cat_match:
                product_category = cat_match.group(1)
                category = product_category

            subcat_match = re.search(r'"productSubcategory"\s*:\s*(null|"([^"]*)")', content)
            if subcat_match and subcat_match.group(1) != 'null':
                product_subcategory = subcat_match.group(2)

            tags_match = re.search(r'"tags"\s*:\s*\[(.*?)\]', content, re.DOTALL)
            if tags_match:
                tags = re.findall(r'"([^"]+)"', tags_match.group(1))

            hl_match = re.search(r'"highlights"\s*:\s*\[(.*?)\]', content, re.DOTALL)
            if hl_match:
                highlights = re.findall(r'"([^"]+)"', hl_match.group(1))

            brand_match = re.search(r'"brand"\s*:\s*(null|"([^"]*)")', content)
            if brand_match and brand_match.group(1) != 'null':
                brand = brand_match.group(2)

            holiday_match = re.search(r'"holiday"\s*:\s*(null|"([^"]*)")', content)
            if holiday_match and holiday_match.group(1) != 'null':
                holiday = holiday_match.group(2)

        return {
            "product_name": product_name,
            "product_description": product_description or description,
            "product_category": product_category,
            "product_subcategory": product_subcategory,
            "highlights": highlights,
            "description": description,
            "tags": tags,
            "brand": brand,
            "category": category,
            "holiday": holiday,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Lambda entrypoint (via Lambda Function URL or API Gateway)
handler = Mangum(app)
