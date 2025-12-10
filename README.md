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

The `deploy/` directory contains a production-ready version with all dependencies bundled. For deployment:

1. Configure your production environment variables
2. Use the deployment script in `deploy/main.py`
3. Deploy using your preferred platform (AWS Lambda with Mangum, Docker, etc.)

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
