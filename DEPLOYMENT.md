# 🚀 BlitzApply Deployment Guide

This guide covers various deployment options for BlitzApply.

## 📋 Prerequisites

- **Git** installed
- **Docker** and **Docker Compose** (for containerized deployment)
- **Node.js** v16+ (for local development)
- **Python** v3.8+ (for local development)

## 🐳 Docker Deployment (Recommended)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd BlitzApply

# Deploy with Docker
./deploy.sh
```

### Manual Docker Deployment
```bash
# Build and start services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## ☁️ Cloud Deployment

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd Frontend
vercel --prod
```

### Railway (Backend)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
```

### Render
1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python simple_server.py`
5. Deploy

## 🔧 Local Development

### Prerequisites
```bash
# Install Node.js dependencies
cd Frontend
npm install

# Install Python dependencies
cd backend
pip install -r requirements.txt
python -m playwright install chromium
```

### Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

## 🌐 Production Deployment

### Environment Variables
```bash
# Backend
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false

# Frontend
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Security Considerations
- Use HTTPS in production
- Set up proper CORS configuration
- Implement authentication
- Use environment variables for secrets
- Set up monitoring and logging

### Database Setup (Optional)
```bash
# PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_DB=blitzapply \
  -e POSTGRES_USER=blitzapply \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:13
```

## 📊 Monitoring

### Health Checks
```bash
# Frontend health
curl http://localhost:3000

# Backend health
curl http://localhost:8000/health
```

### Logs
```bash
# Docker logs
docker-compose logs -f

# Individual service logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./Frontend
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Rebuild containers
docker-compose down
docker-compose up --build
```

#### Playwright Issues
```bash
# Reinstall Playwright browsers
cd backend
python -m playwright install chromium
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
python simple_server.py
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose up --scale backend=3

# Use load balancer
docker-compose up -d nginx
```

### Performance Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Monitor resource usage

## 🔐 Security

### SSL/TLS Setup
```bash
# Generate SSL certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update nginx configuration
# Add SSL configuration to nginx.conf
```

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
```

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test health endpoints
4. Check network connectivity
5. Review security configurations

---

**Happy Deploying! 🚀** 