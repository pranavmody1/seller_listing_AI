# Seller Listing AI

An AI-powered image analysis tool that automatically generates detailed product descriptions and metadata for e-commerce listings using OpenAI's GPT-4 Vision API.

## Overview

This application allows sellers to upload product images and receive AI-generated descriptions, tags, categories, and other metadata perfect for e-commerce platforms. Simply upload an image, and the API returns structured JSON with comprehensive listing information.

## Features

- 🖼️ **Image Analysis**: Upload product images and get detailed descriptions
- 🏷️ **Smart Tagging**: Automatically generates relevant tags for better discoverability
- 📁 **Category Detection**: Identifies appropriate product categories
- 🎨 **Color & Style Recognition**: Extracts visual attributes like colors and styles
- 🔄 **RESTful API**: Easy-to-integrate FastAPI backend
- 🌐 **React Frontend**: User-friendly interface for testing (holiday-describer)

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework for building APIs
- **OpenAI GPT-4 Vision**: Advanced image understanding and description generation
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for running the application

### Frontend
- **React**: Interactive user interface
- **Axios**: HTTP client for API communication

## Project Structure

```
seller_listing_AI/
├── main.py                    # Main FastAPI application
├── requirements.txt           # Python dependencies
├── PROJECT_DOCUMENTATION.txt  # Detailed technical documentation
├── deploy/                    # Deployment bundle with dependencies
│   └── main.py               # Production-ready deployment script
└── holiday-describer/        # React frontend application
    ├── src/
    ├── public/
    └── package.json
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+ (for frontend)
- OpenAI API key

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/pranavmody1/seller_listing_AI.git
cd seller_listing_AI
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the application:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd holiday-describer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Usage

### Endpoint: `/describe`

**Method:** POST

**Request:**
- Multipart form data with an image file

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/describe" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@product_image.jpg"
```

**Response:**
```json
{
  "description": "A modern wireless Bluetooth speaker with sleek matte black finish...",
  "tags": ["bluetooth", "speaker", "wireless", "portable", "audio"],
  "category": "Electronics > Audio > Speakers",
  "color": "black",
  "style": "modern"
}
```

## API Documentation

Once the application is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Deployment

### AWS Lambda Deployment

This application is designed to run on AWS Lambda using Mangum as the ASGI adapter. Follow these steps to deploy:

#### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI configured (`aws configure`)
- OpenAI API key

#### Step 1: Prepare Deployment Package

1. Navigate to the deployment directory:
```bash
cd deploy/
```

2. The `deploy/` directory already contains all required dependencies bundled. If you need to update dependencies:
```bash
pip install -r ../requirements.txt -t .
```

#### Step 2: Create Deployment ZIP

Create a ZIP file with all dependencies and the main application:
```bash
cd deploy/
zip -r ../lambda_deployment.zip . -x ".*" -x "__pycache__/*"
```

Or if deploying from the root directory:
```bash
zip -r lambda_deployment.zip main.py deploy/ -x "deploy/__pycache__/*" -x ".*"
```

#### Step 3: Create Lambda Function

1. Go to AWS Lambda Console
2. Click **Create function**
3. Choose **Author from scratch**
4. Configure:
   - **Function name**: `seller-listing-ai`
   - **Runtime**: Python 3.9 or higher
   - **Architecture**: x86_64 or arm64
5. Click **Create function**

#### Step 4: Upload Code

1. In the Lambda function page, go to **Code** tab
2. Click **Upload from** → **.zip file**
3. Upload the `lambda_deployment.zip` file
4. Click **Save**

#### Step 5: Configure Handler

1. Go to **Runtime settings**
2. Click **Edit**
3. Set **Handler** to: `main.handler`
4. Click **Save**

#### Step 6: Set Environment Variables

1. Go to **Configuration** → **Environment variables**
2. Click **Edit** → **Add environment variable**
3. Add:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
4. Click **Save**

#### Step 7: Adjust Memory and Timeout

1. Go to **Configuration** → **General configuration**
2. Click **Edit**
3. Set:
   - **Memory**: 512 MB (or higher for better performance)
   - **Timeout**: 30 seconds (or more for image processing)
4. Click **Save**

#### Step 8: Create Function URL

1. Go to **Configuration** → **Function URL**
2. Click **Create function URL**
3. Configure:
   - **Auth type**: NONE (for public access) or AWS_IAM (for authenticated access)
   - **Configure cross-origin resource sharing (CORS)**: Enable
   - Add allowed origins (e.g., `*` for testing or your frontend domain)
   - Allow methods: POST, OPTIONS
   - Allow headers: content-type
4. Click **Save**
5. Copy the **Function URL** - this is your API endpoint

#### Step 9: Update Frontend

Update the API endpoint in your React frontend (`holiday-describer/src/App.js`):
```javascript
const res = await axios.post(
  "YOUR_LAMBDA_FUNCTION_URL/describe",  // Replace with your Function URL
  formData,
  { headers: { "Content-Type": "multipart/form-data" } }
);
```

#### Step 10: Test the Deployment

Test your Lambda function:
```bash
curl -X POST "YOUR_LAMBDA_FUNCTION_URL/describe" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

### Alternative: Using AWS SAM or Serverless Framework

You can also deploy using infrastructure-as-code tools:

**AWS SAM template.yaml example:**
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  SellerListingFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: deploy/
      Handler: main.handler
      Runtime: python3.9
      MemorySize: 512
      Timeout: 30
      Environment:
        Variables:
          OPENAI_API_KEY: !Ref OpenAIApiKey
      FunctionUrlConfig:
        AuthType: NONE
        Cors:
          AllowOrigins:
            - "*"
          AllowMethods:
            - POST
            - OPTIONS
```

Deploy with:
```bash
sam build
sam deploy --guided
```

### Docker Deployment (Alternative)

If you prefer Docker instead of Lambda:
```bash
docker build -t seller-listing-ai .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key seller-listing-ai
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-4 Vision access | Yes |

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
```

### Linting
```bash
flake8 .
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the GPT-4 Vision API
- FastAPI for the excellent web framework
- The open-source community for the amazing tools and libraries

## Contact

Pranav Mody - [@pranavmody1](https://github.com/pranavmody1)

Project Link: [https://github.com/pranavmody1/seller_listing_AI](https://github.com/pranavmody1/seller_listing_AI)
