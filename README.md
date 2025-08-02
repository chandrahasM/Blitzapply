# 🚀 BlitzApply - AI-Powered Job Application Automation

**BlitzApply** is an intelligent job application automation system that uses AI and browser automation to streamline the job application process. Built with React frontend and Python backend, it features smart field mapping, real-time browser automation, and comprehensive application tracking.

## ✨ Features

### 🤖 **Smart Automation**
- **Playwright Browser Automation**: Real-time browser control with visible automation
- **Smart Field Mapping**: Intelligent form field detection and filling
- **Custom Field Support**: User-defined fields for specific job requirements
- **Multi-Form Support**: Handles various form types (text, dropdown, radio, checkbox, file uploads)

### 🎨 **Modern UI/UX**
- **Material UI Design**: Professional, Vercel-inspired interface
- **Real-time Progress**: Live application tracking with browser viewer
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Clean, modern aesthetic

### 📊 **Application Management**
- **Profile Management**: Save and reuse personal information
- **Application History**: Track all applications with detailed results
- **Statistics Dashboard**: Success rates and application analytics
- **Error Reporting**: Detailed feedback on failed applications

### 🔧 **Technical Features**
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Smart Field Mapping**: Regex and fuzzy matching for form fields
- **Browser Automation**: Visible Playwright automation
- **Real-time Logging**: Live browser automation logs

## 🏗️ Architecture

```
BlitzApply/
├── Frontend/                 # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── services/          # API services
│   │   └── App.js            # Main application
├── backend/                   # Python backend
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── playwright_service.py # Browser automation
│   └── simple_server.py     # Alternative HTTP server
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AIApply
```

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm start
```
The frontend will be available at `http://localhost:3000`

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m playwright install chromium
python simple_server.py
```
The backend will be available at `http://localhost:8000`

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Usage Guide

### 1. **Setup Your Profile**
- Navigate to the "Profile" tab
- Fill in your personal information
- Add custom fields for specific job requirements
- Save your profile

### 2. **Add Job URLs**
- Go to the "Job Applications" tab
- Add job posting URLs you want to apply to
- You can add multiple URLs at once

### 3. **Start Applications**
- Click "Start Applications"
- Watch the browser automation in real-time
- Monitor progress and results

### 4. **View Results**
- Check application history for detailed results
- View success/failure statistics
- See which fields were filled and which were missing

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/apply` - Submit job application
- `POST /api/profile` - Save user profile
- `POST /api/custom-fields/{user_id}` - Save custom fields
- `GET /api/history/{user_id}` - Get application history
- `GET /api/stats/{user_id}` - Get user statistics

### Health & Testing
- `GET /health` - Health check
- `POST /api/test-field-mapping` - Test field mapping

## 🛠️ Development

### Frontend Development
```bash
cd Frontend
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
```

### Backend Development
```bash
cd backend
python simple_server.py    # Start simple HTTP server
python -m uvicorn main:app --reload  # Start FastAPI server
```

### Testing
```bash
# Test backend
cd backend
python test_backend.py

# Test frontend
cd Frontend
npm test

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd Frontend
npm run build
# Deploy the build folder
```

### Backend Deployment (Railway/Render)
```bash
cd backend
# Deploy with requirements.txt
# Set environment variables
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables
```bash
# Backend
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true

# Frontend
REACT_APP_API_URL=http://localhost:8000/api
```

### Browser Automation Settings
- **Headless Mode**: Set `headless=False` for visible automation
- **Browser Type**: Chromium (configurable)
- **Viewport**: 1280x720 (configurable)

## 📊 Features in Detail

### Smart Field Mapping
The system uses intelligent field mapping to match form labels with profile data:

| Job Form Field | Profile Field | Match Type |
|----------------|---------------|------------|
| "Full Name" | `full_name` | Exact match |
| "Email Address" | `email` | Contains match |
| "Phone Number" | `phone` | Word-based match |
| "Location" | `location` | Fuzzy match |
| "City" | `location` | Synonym match |

### Browser Automation
- **Visible Automation**: Browser window opens and shows the automation process
- **Real-time Logging**: Live logs of what the automation is doing
- **Error Handling**: Graceful handling of form submission failures
- **Multi-step Process**: Navigate, fill forms, submit applications

### Application Tracking
- **Success/Failure Tracking**: Detailed results for each application
- **Missing Fields**: Reports fields that couldn't be filled
- **Questions & Answers**: Shows what was filled in each form
- **Error Messages**: Detailed error reporting

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Check the API docs at `/docs`
- **Community**: Join our discussions

## 🎯 Roadmap

- [ ] **Database Integration**: PostgreSQL/MongoDB support
- [ ] **Multi-browser Support**: Firefox, Safari automation
- [ ] **AI Enhancement**: Better field mapping with ML
- [ ] **Mobile App**: React Native version
- [ ] **Enterprise Features**: Team collaboration, analytics
- [ ] **Integration APIs**: LinkedIn, Indeed, Glassdoor

---

**Made with ❤️ by the BlitzApply Team**

*Automate your job search, focus on what matters.* 