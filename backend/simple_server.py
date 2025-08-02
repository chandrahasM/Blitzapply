#!/usr/bin/env python3
"""
Simple HTTP server for BlitzApply Backend
Uses Python's built-in http.server to avoid dependency issues
"""

import json
import asyncio
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sys
import os

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import SmartFieldMapper, ApplicationStatus
from playwright_service import PlaywrightJobApplicationService

# In-memory storage
applications_history = []
user_profiles = {}
user_custom_fields = {}

class BlitzApplyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if path == '/health':
            response = {
                "status": "healthy",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        elif path.startswith('/api/history/'):
            user_id = int(path.split('/')[-1])
            user_applications = [app for app in applications_history if app.get("user_id") == user_id]
            response = {
                "applications": user_applications,
                "total": len(user_applications),
                "successful": len([app for app in user_applications if app.get("status") == "success"]),
                "failed": len([app for app in user_applications if app.get("status") == "failed"])
            }
        elif path.startswith('/api/profile/'):
            user_id = int(path.split('/')[-1])
            profile = user_profiles.get(user_id)
            if profile:
                response = profile
            else:
                self.send_response(404)
                self.end_headers()
                return
        elif path.startswith('/api/custom-fields/'):
            user_id = int(path.split('/')[-1])
            custom_fields = user_custom_fields.get(user_id, [])
            response = {"custom_fields": custom_fields}
        elif path.startswith('/api/stats/'):
            user_id = int(path.split('/')[-1])
            user_applications = [app for app in applications_history if app.get("user_id") == user_id]
            total = len(user_applications)
            successful = len([app for app in user_applications if app.get("status") == "success"])
            failed = len([app for app in user_applications if app.get("status") == "failed"])
            response = {
                "total": total,
                "successful": successful,
                "failed": failed,
                "success_rate": (successful / total * 100) if total > 0 else 0
            }
        else:
            response = {"message": "BlitzApply Backend API", "status": "running"}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            if path == '/api/apply':
                # Handle job application
                job_url = data.get('job_url')
                user_id = data.get('user_id', 1)
                
                # Get user profile and custom fields
                profile_data = user_profiles.get(user_id, {})
                custom_fields = user_custom_fields.get(user_id, [])
                
                if not profile_data:
                    response = {
                        "status": "failed",
                        "error_message": "User profile not found"
                    }
                else:
                    # Run Playwright automation
                    response = asyncio.run(self._apply_to_job(job_url, profile_data, custom_fields))
                    
                    # Store in history
                    applications_history.append({
                        "id": len(applications_history) + 1,
                        "user_id": user_id,
                        "job_url": job_url,
                        "company_name": response.get("company_name", "Unknown Company"),
                        "job_title": response.get("job_title", "Unknown Position"),
                        "status": response.get("status", "failed"),
                        "applied_at": "2024-01-15T10:30:00Z",
                        "questions_answered": response.get("questions_answered", 0),
                        "questions_and_answers": response.get("questions_and_answers", []),
                        "error_message": response.get("error_message"),
                        "missing_fields": response.get("missing_fields", [])
                    })
            
            elif path == '/api/profile':
                # Save user profile
                user_id = data.get('user_id', 1)
                user_profiles[user_id] = data
                response = {"message": "Profile saved successfully", "user_id": user_id}
            
            elif path.startswith('/api/custom-fields/'):
                # Save custom fields
                user_id = int(path.split('/')[-1])
                user_custom_fields[user_id] = data
                response = {"message": "Custom fields saved successfully", "user_id": user_id}
            
            elif path == '/api/test-field-mapping':
                # Test field mapping
                mapper = SmartFieldMapper()
                profile_data = {
                    "full_name": "John Doe",
                    "email": "john.doe@example.com",
                    "phone": "123-456-7890",
                    "location": "New York, NY",
                    "salary": "$80,000",
                    "linkedin_url": "https://linkedin.com/in/johndoe",
                    "github_url": "https://github.com/johndoe",
                    "portfolio_url": "https://johndoe.dev",
                    "resume_url": "https://drive.google.com/resume.pdf"
                }
                custom_fields = [
                    {"field_name": "Availability Date", "field_value": "2024-01-15"},
                    {"field_name": "Salary Expectations", "field_value": "$80,000 - $100,000"},
                    {"field_name": "Preferred Location", "field_value": "Remote or New York"}
                ]
                test_labels = [
                    "Full Name", "Email Address", "Phone Number", "Location", "City",
                    "Salary", "LinkedIn Profile", "GitHub", "Portfolio", "Resume",
                    "Availability Date", "Salary Expectations", "Preferred Location"
                ]
                results = {}
                for label in test_labels:
                    match = mapper.find_matching_field(label, profile_data, custom_fields)
                    results[label] = match
                response = {
                    "test_results": results,
                    "profile_data": profile_data,
                    "custom_fields": custom_fields
                }
            
            else:
                response = {"error": "Unknown endpoint"}
                
        except Exception as e:
            response = {"error": str(e)}
        
        self.wfile.write(json.dumps(response).encode())
    
    async def _apply_to_job(self, job_url, profile_data, custom_fields):
        """Apply to job using Playwright"""
        try:
            playwright_service = PlaywrightJobApplicationService()
            result = await playwright_service.apply_to_job(job_url, profile_data, custom_fields)
            return result
        except Exception as e:
            return {
                "status": "failed",
                "company_name": "Unknown Company",
                "job_title": "Unknown Position",
                "questions_answered": 0,
                "questions_and_answers": [],
                "error_message": str(e),
                "missing_fields": []
            }

def run_server(port=8000):
    """Run the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, BlitzApplyHandler)
    print(f"🚀 BlitzApply Backend Server running on http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.server_close()

if __name__ == "__main__":
    run_server() 