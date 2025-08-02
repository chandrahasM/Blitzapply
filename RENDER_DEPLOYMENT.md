# 🚀 Render Deployment Guide for BlitzApply

This guide will help you deploy BlitzApply to Render using GitHub integration.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Integration**: Connect your GitHub account to Render

## 🎯 Deployment Steps

### Step 1: Connect GitHub Repository

1. Log in to your Render dashboard
2. Click "New +" and select "Static Site" for frontend
3. Connect your GitHub repository
4. Select the repository containing your BlitzApply code

### Step 2: Configure Frontend Deployment

**For the Frontend (Static Site):**

- **Name**: `blitzapply-frontend`
- **Build Command**: `cd Frontend && npm install && npm run build`
- **Publish Directory**: `Frontend/build`
- **Environment Variables**:
  - `REACT_APP_API_URL`: `https://your-backend-url.onrender.com/api`

### Step 3: Configure Backend Deployment

**For the Backend (Web Service):**

1. Create another service by clicking "New +" and select "Web Service"
2. Connect the same GitHub repository
3. Configure as follows:

- **Name**: `blitzapply-backend`
- **Environment**: `Python`
- **Build Command**: `cd backend && pip install -r requirements.txt && playwright install chromium`
- **Start Command**: `cd backend && python simple_server.py`
- **Environment Variables**:
  - `API_HOST`: `0.0.0.0`
  - `API_PORT`: `8000`
  - `DEBUG`: `false`

### Step 4: Update Frontend API URL

After your backend is deployed:

1. Go to your frontend service settings
2. Update the `REACT_APP_API_URL` environment variable to point to your backend URL
3. Redeploy the frontend

## 🔧 Alternative: Using render.yaml (Recommended)

If you have the `render.yaml` file in your repository:

1. Push the `render.yaml` file to your GitHub repository
2. In Render dashboard, click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect and use the `render.yaml` configuration

## 🌐 Access Your Application

After deployment:

- **Frontend**: `https://blitzapply-frontend.onrender.com`
- **Backend API**: `https://blitzapply-backend.onrender.com`
- **API Documentation**: `https://blitzapply-backend.onrender.com/docs`

## 🔄 Automatic Deployments

Render will automatically:
- Deploy when you push to the main branch
- Rebuild when you update dependencies
- Provide preview deployments for pull requests

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify the build command is correct

2. **Frontend Can't Connect to Backend**:
   - Update `REACT_APP_API_URL` to the correct backend URL
   - Ensure CORS is configured in backend
   - Check that backend is running

3. **Playwright Issues**:
   - Ensure `playwright install chromium` is in build command
   - Check that all Python dependencies are in `requirements.txt`

### Environment Variables:

Make sure these are set in your Render services:

**Frontend:**
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

**Backend:**
```
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false
```

## 📊 Monitoring

- **Logs**: Available in Render dashboard for each service
- **Health Checks**: Render automatically monitors your services
- **Metrics**: View performance metrics in the dashboard

## 🔐 Security

- **HTTPS**: Automatically enabled by Render
- **Environment Variables**: Securely stored in Render dashboard
- **CORS**: Configure in your backend for production

---

**Happy Deploying! 🚀**

Your BlitzApply application will be live at the URLs provided by Render after successful deployment. 