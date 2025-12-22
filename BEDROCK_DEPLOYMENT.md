# AWS Bedrock Deployment Guide

## Overview
This guide covers deploying the Seller Listing AI application using AWS Bedrock (Claude models) instead of OpenAI GPT-4.

## Why AWS Bedrock?

### Benefits:
- ✅ **No API Keys** - Uses IAM authentication (more secure)
- ✅ **Auto-enabled** - Models automatically enabled on first use
- ✅ **Lower Latency** - Stays within AWS network
- ✅ **90% Cheaper** - Claude 3 Haiku costs ~$0.0005 per image vs GPT-4o's ~$0.005
- ✅ **Better Security** - Data doesn't leave AWS infrastructure
- ✅ **Built-in Monitoring** - CloudWatch integration

### Pricing Comparison:

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Est. Cost/Image |
|-------|----------------------|------------------------|-----------------|
| GPT-4o Vision | $2.50 | $10.00 | ~$0.005 |
| Claude 3.5 Sonnet | $3.00 | $15.00 | ~$0.006 |
| Claude 3 Haiku | $0.25 | $1.25 | ~$0.0005 |

**Recommendation:** Start with Claude 3 Haiku for 90% cost savings!

## Prerequisites

1. AWS Account with Lambda access
2. AWS CLI configured (`aws configure`)
3. No OpenAI API key needed! ✨

## Deployment Steps

### Step 1: Model Access (Automatic!)

**Good News:** Bedrock models are now **automatically enabled** when first invoked!

- No manual activation required through AWS Console
- Simply deploy and invoke - models activate automatically
- **Note:** Some first-time Anthropic model users may need to submit use case details on first invocation

### Step 2: Prepare Deployment Package

```bash
cd deploy/

# Install Bedrock requirements (boto3 instead of openai)
pip install -r ../requirements_bedrock.txt -t .

# Copy Bedrock version as main.py
cp ../main_bedrock.py ./main.py
```

### Step 3: Create Deployment ZIP

```bash
# From the deploy directory
zip -r ../lambda_bedrock_deployment.zip . -x ".*" -x "__pycache__/*"
```

### Step 4: Create Lambda Function

1. Go to **AWS Lambda Console**
2. Click **Create function**
3. Choose **Author from scratch**
4. Configure:
   - **Function name**: `seller-listing-ai-bedrock`
   - **Runtime**: Python 3.9 or higher
   - **Architecture**: x86_64 (or arm64)
5. Click **Create function**

### Step 5: Upload Code

1. In the Lambda function page, go to **Code** tab
2. Click **Upload from** → **.zip file**
3. Upload `lambda_bedrock_deployment.zip`
4. Click **Save**

### Step 6: Configure Handler

1. Go to **Runtime settings**
2. Click **Edit**
3. Set **Handler** to: `main.handler`
4. Click **Save**

### Step 7: Configure Lambda Settings

1. Go to **Configuration** → **General configuration**
2. Click **Edit**
3. Set:
   - **Memory**: 512 MB (recommended) or 1024 MB for better performance
   - **Timeout**: 60 seconds (Bedrock can take 10-30 seconds for image analysis)
   - **Ephemeral storage**: 512 MB (default is fine)
4. Click **Save**

### Step 8: Set Up IAM Permissions

Your Lambda execution role needs Bedrock permissions:

1. Go to **Configuration** → **Permissions**
2. Click on the **Execution role** name (opens IAM)
3. Click **Add permissions** → **Create inline policy**
4. Switch to **JSON** tab and paste:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
                "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
                "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-opus-20240229-v1:0"
            ]
        }
    ]
}
```

5. Name it `BedrockInvokePolicy`
6. Click **Create policy**

### Step 9: Create Function URL

1. Go to **Configuration** → **Function URL**
2. Click **Create function URL**
3. Configure:
   - **Auth type**: NONE (for public access)
   - **Configure CORS**: ✅ Enable
   - **Allow origin**: `*` (or your specific domain like `https://yourdomain.com`)
   - **Allow methods**: `POST`, `OPTIONS`
   - **Allow headers**: `content-type`
   - **Expose headers**: Leave empty
   - **Max age**: 86400
4. Click **Save**
5. **Copy the Function URL** - this is your API endpoint!

### Step 10: First Invocation (Model Activation)

On the first invocation, Bedrock will automatically enable the model:

```bash
# Test your Lambda function
curl -X POST "YOUR_FUNCTION_URL/describe" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

**Note:** If you're a first-time Anthropic model user, you may see a message asking you to submit use case details. Follow the provided link to complete this one-time step.

### Step 11: Update Frontend

Update your React app (`holiday-describer/src/App.js`):

```javascript
// Find this line (around line 40)
const res = await axios.post(
  "YOUR_NEW_BEDROCK_FUNCTION_URL/describe",  // Replace with your new Function URL
  formData,
  { headers: { "Content-Type": "multipart/form-data" } }
);
```

## Switching Between Models

Edit `main_bedrock.py` line 32 to switch models:

```python
# For best quality (similar to GPT-4o)
MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"

# For 90% cost savings (recommended!)
MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"

# For absolute best quality
MODEL_ID = "anthropic.claude-3-opus-20240229-v1:0"
```

Then re-deploy the ZIP file.

## Monitoring & Debugging

### CloudWatch Logs
View logs in **CloudWatch** → **Log groups** → `/aws/lambda/seller-listing-ai-bedrock`

### Common Issues

**Issue 1: "AccessDeniedException"**
- **Solution:** Check IAM permissions in Step 8 are correctly applied

**Issue 2: "Use case details required"**
- **Solution:** First-time Anthropic users need to submit use case details (one-time only)
- Follow the link in the error message

**Issue 3: "Timeout"**
- **Solution:** Increase Lambda timeout to 60-90 seconds (Step 7)

**Issue 4: "Model not found"**
- **Solution:** Check region - ensure `us-east-1` or another Bedrock-supported region

## Cost Optimization Tips

1. **Start with Haiku** - 90% cheaper, excellent for structured e-commerce data
2. **Increase timeout** - Don't let requests fail and retry (wastes money)
3. **Monitor usage** - Use CloudWatch to track invocations
4. **Consider caching** - Cache results for identical images

## Comparison: OpenAI vs Bedrock

| Feature | OpenAI (main.py) | Bedrock (main_bedrock.py) |
|---------|------------------|---------------------------|
| Authentication | API Key | IAM Role |
| Setup Complexity | Simple | Moderate |
| Cost (Haiku) | ~$0.005/image | ~$0.0005/image |
| Latency | 2-5s | 1-3s |
| Security | External API | AWS Internal |
| Compliance | OpenAI ToS | AWS Standards |

## Next Steps

1. Deploy and test with a few images
2. Compare quality between models
3. Monitor costs in AWS Cost Explorer
4. Optimize Lambda memory based on CloudWatch metrics
5. Consider adding caching layer (DynamoDB or S3)

## Support

- **Bedrock Documentation**: https://docs.aws.amazon.com/bedrock/
- **Claude Model Docs**: https://docs.anthropic.com/
- **Lambda Best Practices**: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
