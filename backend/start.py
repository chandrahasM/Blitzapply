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
from datetime import datetime

# In-memory storage
applications_history = []
user_profiles = {}
user_custom_fields = {}

# Simple field mapper
class SimpleFieldMapper:
    def __init__(self):
        self.field_mappings = {
            "full_name": ["full name", "name", "fullname", "candidate name", "applicant name"],
            "email": ["email", "email address", "e-mail", "contact email"],
            "phone": ["phone", "phone number", "telephone", "mobile", "cell"],
            "location": ["location", "city", "state", "country", "address"],
            "experience": ["experience", "years of experience", "work experience"],
            "salary": ["salary", "salary expectation", "expected salary", "compensation"],
            "linkedin": ["linkedin", "linkedin profile", "linkedin url"],
            "github": ["github", "github profile", "github url"],
            "portfolio": ["portfolio", "portfolio url", "website", "personal website"],
            "resume": ["resume", "cv", "resume file", "cv file"]
        }
    
    def find_matching_field(self, label: str, profile_data: dict, custom_fields: list) -> dict:
        label_lower = label.lower().strip()
        
        # Check profile fields
        for field_name, possible_labels in self.field_mappings.items():
            for possible_label in possible_labels:
                if possible_label in label_lower or label_lower in possible_label:
                    profile_value = profile_data.get(field_name)
                    if profile_value:
                        return {
                            "value": profile_value,
                            "source": "profile",
                            "field_type": "text",
                            "field_name": field_name
                        }
        
        # Check custom fields
        for custom_field in custom_fields:
            custom_label = custom_field.get("field_name", "").lower()
            if custom_label in label_lower or label_lower in custom_label:
                custom_value = custom_field.get("field_value")
                if custom_value:
                    return {
                        "value": custom_value,
                        "source": "custom",
                        "field_type": "text",
                        "field_name": custom_field.get("field_name")
                    }
        
        return None

# Mock Playwright service
class MockPlaywrightService:
    def apply_to_job(self, job_url: str, profile_data: dict, custom_fields: list) -> dict:
        """Mock implementation that simulates form filling"""
        import time
        time.sleep(2)  # Simulate processing time
        
        # Simulate finding and filling some fields
        mapper = SimpleFieldMapper()
        filled_fields = []
        
        # Simulate more realistic form field detection
        # Common job application form fields with variations
        simulated_fields = [
            "Full Name", "Name", "First Name", "Last Name", "Full Name",
            "Email", "Email Address", "E-mail", "Contact Email",
            "Phone", "Phone Number", "Telephone", "Mobile", "Cell Phone",
            "Location", "City", "State", "Country", "Address", "Current Location",
            "Experience", "Years of Experience", "Work Experience", "Professional Experience",
            "Resume", "CV", "Resume File", "CV File", "Upload Resume",
            "LinkedIn", "LinkedIn Profile", "LinkedIn URL",
            "GitHub", "GitHub Profile", "GitHub URL",
            "Portfolio", "Portfolio URL", "Website", "Personal Website"
        ]
        
        # Simulate finding and filling fields with some randomness
        import random
        found_fields = random.sample(simulated_fields, min(random.randint(5, 8), len(simulated_fields)))
        
        for field_label in found_fields:
            match = mapper.find_matching_field(field_label, profile_data, custom_fields)
            if match:
                filled_fields.append({
                    "question": field_label,
                    "answer": match["value"],
                    "source": match["source"]
                })
            else:
                # Simulate some fields that couldn't be filled
                filled_fields.append({
                    "question": field_label,
                    "answer": "[Field detected but no matching data found]",
                    "source": "unmatched"
                })
        
        # Try to extract company and job info from URL
        company_name = "Company"
        job_title = "Position"
        
        # Extract domain from URL for company name
        try:
            from urllib.parse import urlparse
            parsed_url = urlparse(job_url)
            domain = parsed_url.netloc
            if domain.startswith('www.'):
                domain = domain[4:]
            if '.' in domain:
                company_name = domain.split('.')[0].title()
        except:
            pass
        
        # Try to extract job title from URL path
        try:
            path_parts = parsed_url.path.split('/')
            for part in path_parts:
                if part and len(part) > 3 and not part.isdigit():
                    # Clean up the part to make it look like a job title
                    job_title = part.replace('-', ' ').replace('_', ' ').title()
                    break
        except:
            pass
        
        # Simulate some missing fields that couldn't be filled
        missing_fields = []
        if not profile_data.get("phone"):
            missing_fields.append("Phone Number")
        if not profile_data.get("location"):
            missing_fields.append("Location")
        if not profile_data.get("experience"):
            missing_fields.append("Experience")
        
        return {
            "status": "success",
            "company_name": company_name,
            "job_title": job_title,
            "questions_answered": len([f for f in filled_fields if f["source"] != "unmatched"]),
            "questions_and_answers": filled_fields,
            "missing_fields": missing_fields,
            "error_message": None
        }

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
                "timestamp": datetime.now().isoformat()
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
                    # Run mock Playwright automation
                    playwright_service = MockPlaywrightService()
                    result = playwright_service.apply_to_job(job_url, profile_data, custom_fields)
                    
                    # Store in history
                    applications_history.append({
                        "id": len(applications_history) + 1,
                        "user_id": user_id,
                        "job_url": job_url,
                        "company_name": result.get("company_name", "Unknown Company"),
                        "job_title": result.get("job_title", "Unknown Position"),
                        "status": result.get("status", "failed"),
                        "applied_at": datetime.now().isoformat(),
                        "questions_answered": result.get("questions_answered", 0),
                        "questions_and_answers": result.get("questions_and_answers", []),
                        "error_message": result.get("error_message"),
                        "missing_fields": result.get("missing_fields", [])
                    })
                    
                    response = {
                        "job_url": job_url,
                        "company_name": result.get("company_name", "Unknown Company"),
                        "job_title": result.get("job_title", "Unknown Position"),
                        "status": result.get("status", "failed"),
                        "timestamp": datetime.now().isoformat(),
                        "questions_answered": result.get("questions_answered", 0),
                        "questions_and_answers": result.get("questions_and_answers", []),
                        "error_message": result.get("error_message"),
                        "missing_fields": result.get("missing_fields", [])
                    }
            
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
                mapper = SimpleFieldMapper()
                profile_data = {
                    "full_name": "John Doe",
                    "email": "john.doe@example.com",
                    "phone": "123-456-7890",
                    "resume_file": "base64_encoded_resume_data",
                    "resume_filename": "John_Doe_Resume.pdf",
                    "linkedin_url": "https://linkedin.com/in/johndoe",
                    "github_url": "https://github.com/johndoe",
                    "portfolio_url": "https://johndoe.dev"
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

def run_server(port=8000):
    """Run the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, BlitzApplyHandler)
    print(f"🚀 BlitzApply Backend Server running on http://localhost:{port}")
    print("📱 Frontend should connect to: http://localhost:8000")
    print("🔧 Test endpoint: http://localhost:8000/health")
    print("Press Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.server_close()

if __name__ == "__main__":
    run_server() 