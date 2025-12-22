# Step-by-Step AWS Bedrock Setup Guide

## Part 1: AWS Console Configuration

### Step 1: Access AWS Bedrock Console

1. Log into your AWS Console
2. In the search bar at the top, type "Bedrock"
3. Click on **Amazon Bedrock**
4. Make sure you're in a supported region (top-right corner):
   - **Recommended**: `us-east-1` (N. Virginia)
   - Other options: `us-west-2`, `eu-west-1`, `ap-southeast-1`

### Step 2: Enable Model Access (Automatic - No Action Needed!)

**Good News**: Models are now automatically enabled on first use!

1. Go to **Bedrock Console** → **Model catalog** (left sidebar)
2. You'll see all available models
3. Click on **Anthropic** category to see Claude models:
   - Claude 3.5 Sonnet v2
   - Claude 3 Haiku
   - Claude 3 Opus
4. Or click on **Amazon** category for Nova models:
   - Nova Lite
   - Nova Pro
   - Nova Micro

**Note**: No manual activation needed! Models will auto-enable when your Lambda first calls them.

### Step 3: Create IAM Policy for Bedrock Access

1. Open **IAM Console** (search "IAM" in top search bar)
2. Click **Policies** in left sidebar
3. Click **Create policy** button
4. Click **JSON** tab
5. Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BedrockInvokeAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-opus-20240229-v1:0",
                "arn:aws:bedrock:*::foundation-model/amazon.nova-lite-v1:0",
                "arn:aws:bedrock:*::foundation-model/amazon.nova-pro-v1:0"
            ]
        }
    ]
}
```

6. Click **Next**
7. Name the policy: `BedrockModelInvokePolicy`
8. Add description: "Allows Lambda to invoke Bedrock foundation models"
9. Click **Create policy**

### Step 4: Create Lambda Function

1. Go to **Lambda Console** (search "Lambda")
2. Click **Create function**
3. Select **Author from scratch**
4. Configure:
   - **Function name**: `seller-listing-ai-bedrock`
   - **Runtime**: Python 3.11 (or 3.10, 3.9)
   - **Architecture**: x86_64
5. Expand **Change default execution role**:
   - Select **Create a new role with basic Lambda permissions**
6. Click **Create function**

### Step 5: Attach Bedrock Policy to Lambda Role

1. After function is created, go to **Configuration** tab
2. Click **Permissions** in left menu
3. Under **Execution role**, click the role name (opens in new tab)
4. In IAM role page, click **Add permissions** → **Attach policies**
5. Search for `BedrockModelInvokePolicy` (the policy you created in Step 3)
6. Check the box next to it
7. Click **Attach policies**
8. You should now see both:
   - `AWSLambdaBasicExecutionRole` (default)
   - `BedrockModelInvokePolicy` (just added)

### Step 6: Configure Lambda Settings

1. Back in Lambda console, go to **Configuration** tab
2. Click **General configuration**
3. Click **Edit**
4. Set:
   - **Memory**: 1024 MB (recommended for image processing)
   - **Timeout**: 1 min 0 sec (Bedrock can take 10-30 seconds)
   - **Ephemeral storage**: 512 MB (default is fine)
5. Click **Save**

### Step 7: Create Function URL (Public API Endpoint)

1. Still in **Configuration** tab
2. Click **Function URL** in left menu
3. Click **Create function URL**
4. Configure:
   - **Auth type**: Select **NONE** (for public access)
   - Check the box: ☑️ **Configure cross-origin resource sharing (CORS)**
5. CORS settings:
   - **Allow origin**: `*` (or your specific domain like `https://yourdomain.com`)
   - **Allow methods**: Check ☑️ **POST** and ☑️ **OPTIONS**
   - **Allow headers**: `content-type`
   - **Expose headers**: (leave empty)
   - **Max age**: 86400
   - **Allow credentials**: Leave unchecked
6. Click **Save**
7. **COPY THE FUNCTION URL** - You'll need this! It looks like:
   ```
   https://abc123xyz.lambda-url.us-east-1.on.aws/
   ```

---

## Part 2: Code Changes & Deployment

### Option A: Using Claude 3.5 Sonnet (Best Quality)

Your `main_bedrock.py` is already configured for this! Just use it as-is.

**Model ID**: `anthropic.claude-3-5-sonnet-20241022-v2:0`

### Option B: Using Claude 3 Haiku (90% Cheaper)

Edit `main_bedrock.py` line 33-34:

**Change FROM:**
```python
# Option 1: Claude 3.5 Sonnet - Best quality, similar price to GPT-4o
MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"
```

**Change TO:**
```python
# Option 2: Claude 3 Haiku - 90% cheaper, still excellent quality for structured data
MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"
```

### Option C: Using Amazon Nova Lite (Cheapest - 50x cheaper!)

Edit `main_bedrock.py` - Make these changes:

**1. Change MODEL_ID (line 33):**
```python
# Amazon Nova Lite - Cheapest option (50x cheaper than GPT-4o!)
MODEL_ID = "amazon.nova-lite-v1:0"
```

**2. Update the API request format (around line 110-140):**

**Change FROM:**
```python
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
            "temperature": 0.3
        }
```

**Change TO:**
```python
        # Construct Bedrock API request (Nova format)
        import io
        request_body = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "image": {
                                "format": mime_type.split('/')[-1],  # "jpeg", "png", etc.
                                "source": {
                                    "bytes": image_bytes  # Use raw bytes for Nova
                                }
                            }
                        },
                        {
                            "text": user_text
                        }
                    ]
                }
            ],
            "inferenceConfig": {
                "max_new_tokens": 1000,
                "temperature": 0.3
            }
        }
```

**3. Update response parsing (around line 150):**

**Change FROM:**
```python
        # Parse Bedrock response
        response_body = json.loads(response['body'].read())
        content = response_body['content'][0]['text'].strip()
```

**Change TO:**
```python
        # Parse Bedrock response (Nova format)
        response_body = json.loads(response['body'].read())
        content = response_body['output']['message']['content'][0]['text'].strip()
```

---

## Part 3: Prepare & Upload Deployment Package

### Step 1: Install Dependencies

In your terminal (make sure virtual environment is activated):

```bash
cd "/Users/pranavmody/Documents/GitHub/seller_listing_AI (HC)"

# Install dependencies
pip install -r requirements_bedrock.txt -t deploy/
```

### Step 2: Copy Your Chosen Main File

```bash
# Copy the Bedrock version
cp main_bedrock.py deploy/main.py
```

### Step 3: Create Deployment ZIP

```bash
# Navigate to deploy directory
cd deploy/

# Create ZIP (excluding unnecessary files)
zip -r ../lambda_bedrock_deployment.zip . -x "*.pyc" -x "*__pycache__*" -x "*.DS_Store"

# Go back to main directory
cd ..
```

### Step 4: Upload to Lambda

**Option A: Via AWS Console (Easiest)**

1. Go to your Lambda function in AWS Console
2. Click **Code** tab
3. Click **Upload from** → **.zip file**
4. Click **Upload** and select `lambda_bedrock_deployment.zip`
5. Click **Save**
6. Wait for upload to complete (may take 1-2 minutes)

**Option B: Via AWS CLI (Faster for updates)**

```bash
aws lambda update-function-code \
    --function-name seller-listing-ai-bedrock \
    --zip-file fileb://lambda_bedrock_deployment.zip \
    --region us-east-1
```

### Step 5: Configure Handler

1. In Lambda console, go to **Code** tab
2. Scroll down to **Runtime settings**
3. Click **Edit**
4. Set **Handler** to: `main.handler`
5. Click **Save**

---

## Part 4: Testing

### Test 1: Via AWS Console

1. In Lambda console, go to **Test** tab
2. Click **Create new event**
3. Name it: `test-image`
4. This won't work perfectly for file uploads, but you can test the function runs
5. Click **Test**
6. Check CloudWatch logs for any errors

### Test 2: Via cURL (Real Test)

```bash
# Download a test image or use one you have
curl -X POST "YOUR_FUNCTION_URL/describe" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/test-image.jpg"
```

Replace `YOUR_FUNCTION_URL` with the URL from Step 7.

### Test 3: Via Frontend

Update `holiday-describer/src/App.js` line 40:

```javascript
const res = await axios.post(
  "YOUR_FUNCTION_URL/describe",  // Your new Bedrock Function URL
  formData,
  { headers: { "Content-Type": "multipart/form-data" } }
);
```

Then run your React app:
```bash
cd holiday-describer
npm start
```

Upload a test image and check the results!

---

## Part 5: Monitoring & Troubleshooting

### View Logs

1. Go to Lambda console
2. Click **Monitor** tab
3. Click **View CloudWatch logs**
4. Click the latest log stream
5. Check for errors or warnings

### Common Issues & Solutions

**Issue 1: "AccessDeniedException: User is not authorized"**
- **Solution**: Go back to Step 5, ensure Bedrock policy is attached to Lambda role
- Check the policy has the correct model ARN for your chosen model

**Issue 2: "ValidationException: The provided model identifier is invalid"**
- **Solution**: Check MODEL_ID is correct:
  - Claude: `anthropic.claude-3-haiku-20240307-v1:0`
  - Nova: `amazon.nova-lite-v1:0`

**Issue 3: "Task timed out after 3.00 seconds"**
- **Solution**: Increase timeout in Step 6 to at least 60 seconds

**Issue 4: "CORS error" in browser**
- **Solution**: Check CORS settings in Step 7, ensure POST and OPTIONS are allowed

**Issue 5: "Use case details required" (Anthropic models only)**
- **Solution**: Some first-time users need to submit use case details
- Click the link in the error message to submit (one-time only)

---

## Part 6: Cost Monitoring

### Enable Cost Tracking

1. Go to **AWS Cost Explorer**
2. Enable if not already enabled
3. Filter by:
   - Service: Bedrock
   - Region: us-east-1
4. Monitor daily costs

### Approximate Costs (per 1000 images):

| Model | Cost per 1000 images |
|-------|---------------------|
| Nova Lite | $0.10 |
| Claude Haiku | $0.50 |
| Claude Sonnet | $6.00 |
| GPT-4o (for comparison) | $5.00 |

---

## Quick Reference: Model IDs

```python
# Amazon Nova Models
MODEL_ID = "amazon.nova-lite-v1:0"      # Cheapest
MODEL_ID = "amazon.nova-pro-v1:0"       # More capable
MODEL_ID = "amazon.nova-micro-v1:0"     # Text only (no images)

# Anthropic Claude Models
MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"              # Fast & cheap
MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"           # Balanced
MODEL_ID = "anthropic.claude-3-opus-20240229-v1:0"               # Best quality
```

---

## Summary Checklist

- [ ] Choose AWS region (us-east-1 recommended)
- [ ] Create IAM policy for Bedrock (Step 3)
- [ ] Create Lambda function (Step 4)
- [ ] Attach Bedrock policy to Lambda role (Step 5)
- [ ] Configure Lambda memory (1024 MB) and timeout (60 sec) (Step 6)
- [ ] Create Function URL with CORS (Step 7)
- [ ] Choose your model (Claude Haiku recommended to start)
- [ ] Update code if using Nova Lite
- [ ] Install dependencies and create ZIP (Step 1-3)
- [ ] Upload ZIP to Lambda (Step 4)
- [ ] Set handler to `main.handler` (Step 5)
- [ ] Test with cURL or frontend
- [ ] Monitor logs in CloudWatch
- [ ] Check costs in Cost Explorer

You're all set! 🚀
