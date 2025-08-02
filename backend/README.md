# BlitzApply Backend

A powerful FastAPI backend for AI-powered job application automation using Playwright browser automation.

## 🚀 Features

- **Smart Field Mapping**: Uses regex and fuzzy matching to intelligently map form fields
- **Playwright Automation**: Automated browser interaction for job applications
- **Multiple Field Types**: Handles text inputs, dropdowns, radio buttons, checkboxes, and file uploads
- **Custom Fields**: Support for user-defined custom fields
- **Application History**: Track all applications with detailed results
- **Batch Processing**: Apply to multiple jobs simultaneously
- **Error Handling**: Comprehensive error reporting and missing field detection

## 🛠️ Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation using Python type annotations
- **Playwright**: Reliable browser automation
- **Python 3.8+**: Modern Python features

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Windows/macOS/Linux

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Playwright Browsers

```bash
python -m playwright install chromium
```

### 3. Start the Server

```bash
python start.py
```

Or manually:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, visit:
- **Interactive API Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

## 🔧 API Endpoints

### Core Endpoints

#### `POST /api/apply`
Submit a job application using Playwright automation.

**Request:**
```json
{
  "job_url": "https://example.com/job-posting",
  "user_id": 1
}
```

**Response:**
```json
{
  "job_url": "https://example.com/job-posting",
  "company_name": "Example Corp",
  "job_title": "Software Engineer",
  "status": "success",
  "timestamp": "2024-01-15T10:30:00Z",
  "questions_answered": 5,
  "questions_and_answers": [
    {
      "question": "Full Name",
      "answer": "John Doe",
      "source": "profile",
      "field_type": "text"
    }
  ],
  "error_message": null,
  "missing_fields": []
}
```

#### `POST /api/apply-batch`
Apply to multiple jobs in batch.

#### `GET /api/history/{user_id}`
Get application history for a user.

#### `POST /api/profile`
Save user profile information.

#### `GET /api/profile/{user_id}`
Get user profile information.

#### `POST /api/custom-fields/{user_id}`
Save custom fields for a user.

#### `GET /api/custom-fields/{user_id}`
Get custom fields for a user.

#### `GET /api/stats/{user_id}`
Get user application statistics.

#### `DELETE /api/history/{application_id}`
Delete an application from history.

### Testing Endpoints

#### `POST /api/test-field-mapping`
Test the smart field mapping system.

## 🧠 Smart Field Mapping

The system uses intelligent field mapping to match form labels with profile data:

### Supported Field Types

1. **Text Fields**: Name, email, phone, location, experience
2. **URL Fields**: LinkedIn, GitHub, portfolio, resume
3. **File Uploads**: Resume/CV uploads
4. **Dropdowns**: Experience level, location preferences
5. **Radio Buttons**: Yes/No questions, preferences
6. **Checkboxes**: Multiple choice, agreements

### Field Mapping Examples

| Form Label | Profile Field | Match Type |
|------------|---------------|------------|
| "Full Name" | `full_name` | Exact match |
| "Email Address" | `email` | Contains match |
| "Phone Number" | `phone` | Word-based match |
| "Location" | `location` | Fuzzy match |
| "City" | `location` | Synonym match |

### Custom Fields

Users can add custom fields for specific job requirements:

```json
{
  "field_name": "Salary Expectations",
  "field_value": "$80,000 - $100,000"
}
```

## 🔍 Playwright Automation

The system automatically:

1. **Navigates** to job URLs
2. **Detects** form fields using various selectors
3. **Maps** fields to profile data using smart matching
4. **Fills** fields based on their type (text, dropdown, radio, etc.)
5. **Submits** the application form
6. **Reports** results and any missing fields

### Supported Form Elements

- `<input>` (text, email, phone, file)
- `<textarea>`
- `<select>` (dropdowns)
- `<input type="radio">`
- `<input type="checkbox">`
- Custom form elements with data attributes

## 📊 Error Handling

The system provides detailed error reporting:

- **Missing Fields**: Lists fields that couldn't be filled
- **Submission Errors**: Reports form submission failures
- **Network Errors**: Handles connection issues
- **Validation Errors**: Reports invalid data

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Playwright Configuration
PLAYWRIGHT_HEADLESS=false
PLAYWRIGHT_TIMEOUT=30000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

### Development vs Production

**Development:**
- `headless=false` - Browser visible for debugging
- `--reload` - Auto-reload on code changes
- Detailed logging

**Production:**
- `headless=true` - Browser runs in background
- No auto-reload
- Minimal logging

## 🧪 Testing

### Test Field Mapping

```bash
curl -X POST http://localhost:8000/api/test-field-mapping
```

### Test Job Application

```bash
curl -X POST http://localhost:8000/api/apply \
  -H "Content-Type: application/json" \
  -d '{
    "job_url": "https://example.com/job",
    "user_id": 1
  }'
```

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application
├── models.py              # Pydantic models and field mapping
├── playwright_service.py  # Playwright automation service
├── requirements.txt       # Python dependencies
├── start.py              # Startup script
└── README.md             # This file
```

## 🚨 Troubleshooting

### Common Issues

1. **Playwright Installation**
   ```bash
   python -m playwright install --force
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 8000
   lsof -ti:8000 | xargs kill -9
   ```

3. **CORS Issues**
   - Ensure frontend URL is in `ALLOWED_ORIGINS`
   - Check browser console for CORS errors

4. **Browser Launch Issues**
   - Set `headless=false` for debugging
   - Check system requirements for Playwright

### Debug Mode

Run with detailed logging:

```bash
python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
import uvicorn
uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
"
```

## 🔒 Security Considerations

- **Input Validation**: All inputs are validated using Pydantic
- **CORS Protection**: Configured to allow only specific origins
- **Error Handling**: No sensitive information in error messages
- **Rate Limiting**: Consider adding rate limiting for production

## 📈 Performance

- **Async Operations**: All I/O operations are asynchronous
- **Connection Pooling**: Efficient database connections (when added)
- **Caching**: Consider Redis for caching in production
- **Load Balancing**: Scale horizontally with multiple instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue on GitHub
4. Contact the development team 