#!/bin/bash

# BlitzApply Render Deployment Script
echo "🚀 Preparing BlitzApply for Render deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root directory of BlitzApply"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd Frontend
npm install
cd ..

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Build frontend for production
echo "🔨 Building frontend for production..."
cd Frontend
npm run build
cd ..

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps for Render deployment:"
echo "1. Push your code to GitHub"
echo "2. Go to render.com and create a new Static Site"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Build Command: cd Frontend && npm install && npm run build"
echo "   - Publish Directory: Frontend/build"
echo "   - Environment Variable: REACT_APP_API_URL=https://your-backend-url.onrender.com/api"
echo ""
echo "5. Create a Web Service for the backend with:"
echo "   - Build Command: cd backend && pip install -r requirements.txt && playwright install chromium"
echo "   - Start Command: cd backend && python simple_server.py"
echo ""
echo "🎯 Or use the render.yaml file for automatic configuration!" 