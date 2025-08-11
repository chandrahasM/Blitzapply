# BlitzApply Implementation Guide

## Overview

This guide explains the implementation of local storage for user profiles and the enhanced Playwright automation system for job applications.

## 🚀 New Features

### 1. Local Storage for User Profiles
- **Resume File Upload**: Replace Resume URL with actual file upload
- **Base64 Storage**: Resume files are stored as base64 strings in localStorage
- **Offline Access**: Profile data persists locally for offline use
- **File Validation**: Supports PDF, DOC, DOCX files up to 5MB

### 2. Enhanced Field Mapping
- **Smart Detection**: Uses regex and fuzzy matching for form fields
- **Location Fields**: Enhanced recognition of city, state, country, zip, etc.
- **Field Types**: Support for text, dropdown, radio, checkbox, textarea, file
- **Custom Fields**: Dynamic addition of application-specific fields

### 3. Playwright Automation
- **Browser Control**: Opens job URLs in visible browser window
- **Form Detection**: Automatically identifies form fields
- **Smart Filling**: Maps profile data to form fields using intelligent matching
- **Real-time Progress**: Shows application progress and browser automation

## 📁 File Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── ProfileForm.js          # Updated with file upload
│   │   └── JobApplicationForm.js   # Enhanced with Playwright API
│   └── services/
│       └── apiService.js           # API communication
Backend/
├── main.py                         # FastAPI endpoints
├── models.py                       # Data models and field mapping
├── playwright_service.py           # Browser automation logic
└── requirements.txt                # Python dependencies
```

## 🔧 Setup Instructions

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd Frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

### Backend Setup

1. **Install Python Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Install Playwright Browsers**
   ```bash
   playwright install chromium
   ```

3. **Start Backend Server**
   ```bash
   python main.py
   ```

## 📝 Usage Guide

### 1. Creating User Profile

1. **Navigate to Profile Form**
   - Go to the Profile section in the app
   - Fill in personal information (name, email, phone)

2. **Upload Resume**
   - Click "Upload Resume" button
   - Select PDF, DOC, or DOCX file (max 5MB)
   - File is automatically converted to base64 and stored

3. **Add Custom Fields**
   - Add application-specific fields like:
     - Availability Date
     - Salary Expectations
     - Preferred Location
     - Years of Experience

4. **Save Profile**
   - Click "Save Profile" to store in localStorage
   - Data is also sent to backend for future use

### 2. Applying to Jobs

1. **Enter Job URLs**
   - Add one or more job posting URLs
   - Each URL will be processed individually

2. **Start Applications**
   - Click "Start Applications" button
   - This triggers the Playwright automation

3. **Watch Automation**
   - Browser window opens automatically
   - Forms are detected and filled automatically
   - Progress is shown in real-time

4. **Review Results**
   - See which fields were filled successfully
   - Check for any missing or failed fields
   - View application status and company information

## 🔍 Field Mapping System

### How It Works

The system uses intelligent pattern matching to map form fields to profile data:

1. **Label Analysis**: Analyzes field labels, names, IDs, and placeholders
2. **Fuzzy Matching**: Uses regex and word-based matching
3. **Field Type Detection**: Identifies input types (text, dropdown, radio, etc.)
4. **Data Mapping**: Maps profile data to appropriate form fields

### Supported Field Types

| Field Type | Examples | Profile Source |
|------------|----------|----------------|
| **Text** | Full Name, Email, Phone | Profile fields |
| **Dropdown** | State, Country, Experience | Profile + Custom fields |
| **Radio** | Remote Work, Relocation | Profile + Custom fields |
| **Checkbox** | Available Immediately | Profile + Custom fields |
| **Textarea** | Cover Letter, Bio | Profile + Custom fields |
| **File** | Resume, CV | Profile resume file |

### Location Field Recognition

The system specifically recognizes location-related fields:

- **City**: `city`, `town`, `village`
- **State**: `state`, `province`, `region`
- **Country**: `country`, `nation`
- **Zip/Postal**: `zip`, `postal`, `postcode`
- **Address**: `address`, `street`, `location`

## 🧪 Testing

### Run Test Suite

```bash
cd backend
python test_implementation.py
```

This will test:
- Local storage simulation
- Field mapping accuracy
- Location field detection
- Form field type recognition

### Manual Testing

1. **Profile Creation**
   - Create a profile with various field types
   - Upload a resume file
   - Add custom fields

2. **Job Application**
   - Use a test job URL
   - Watch the automation process
   - Verify form filling accuracy

## 🔧 API Endpoints

### Profile Management
- `POST /api/profile` - Save user profile
- `GET /api/profile/{user_id}` - Get user profile
- `POST /api/custom-fields/{user_id}` - Save custom fields

### Job Applications
- `POST /api/apply` - Apply to single job
- `POST /api/apply-batch` - Apply to multiple jobs
- `GET /api/history/{user_id}` - Get application history

### Testing
- `POST /api/test-field-mapping` - Test field mapping system

## 🚨 Troubleshooting

### Common Issues

1. **Resume Upload Fails**
   - Check file size (max 5MB)
   - Ensure file type is PDF, DOC, or DOCX
   - Clear browser cache if needed

2. **Field Mapping Issues**
   - Verify profile has required fields
   - Check custom field names and values
   - Use the test endpoint to debug mapping

3. **Playwright Errors**
   - Ensure Chromium browser is installed
   - Check if job URL is accessible
   - Verify form fields are present on the page

### Debug Mode

Enable detailed logging in the backend:
```python
logging.basicConfig(level=logging.DEBUG)
```

## 🔮 Future Enhancements

### Planned Features
- **Supabase Integration**: Replace local storage with database
- **Resume Parsing**: Extract information from resume files
- **AI Field Detection**: Use ML for better field recognition
- **Multi-language Support**: Handle forms in different languages
- **Application Templates**: Save successful application patterns

### Customization
- **Field Mapping Rules**: Add custom field mapping logic
- **Form Templates**: Create templates for specific job sites
- **Validation Rules**: Add custom validation for form fields

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Run the test suite to verify functionality
3. Review the browser automation logs
4. Check the API response for error details

## 📄 License

This implementation is part of the BlitzApply project and follows the same licensing terms. 