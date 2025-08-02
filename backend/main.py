from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import os
from datetime import datetime
import asyncio

from models import (
    JobApplicationRequest,
    JobApplicationResponse,
    ApplicationStatus,
    ProfileModel,
    CustomFieldModel
)
from playwright_service import PlaywrightJobApplicationService

app = FastAPI(
    title="BlitzApply Backend",
    description="AI-powered job application automation service",
    version="1.0.0"
)

# In-memory storage (replace with database in production)
applications_history = []
user_profiles = {}
user_custom_fields = {}

@app.get("/")
async def root():
    return {"message": "BlitzApply Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/apply", response_model=JobApplicationResponse)
async def apply_to_job(request: JobApplicationRequest):
    """
    Apply to a job using Playwright automation
    """
    try:
        # Get user profile and custom fields
        profile_data = user_profiles.get(request.user_id, {})
        custom_fields = user_custom_fields.get(request.user_id, [])

        if not profile_data:
            raise HTTPException(status_code=400, detail="User profile not found")

        # Initialize Playwright service
        playwright_service = PlaywrightJobApplicationService()

        # Apply to job
        result = await playwright_service.apply_to_job(
            str(request.job_url),
            profile_data,
            custom_fields
        )

        # Create response
        response = JobApplicationResponse(
            job_url=str(request.job_url),
            company_name=result.get("company_name", "Unknown Company"),
            job_title=result.get("job_title", "Unknown Position"),
            status=result.get("status", ApplicationStatus.FAILED),
            timestamp=datetime.now(),
            questions_answered=result.get("questions_answered", 0),
            questions_and_answers=result.get("questions_and_answers", []),
            error_message=result.get("error_message"),
            missing_fields=result.get("missing_fields", [])
        )

        # Store in history
        applications_history.append({
            "id": len(applications_history) + 1,
            "user_id": request.user_id,
            "job_url": str(request.job_url),
            "company_name": response.company_name,
            "job_title": response.job_title,
            "status": response.status.value,
            "applied_at": response.timestamp.isoformat(),
            "questions_answered": response.questions_answered,
            "questions_and_answers": response.questions_and_answers,
            "error_message": response.error_message,
            "missing_fields": response.missing_fields
        })

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application failed: {str(e)}")

@app.post("/api/apply-batch")
async def apply_to_multiple_jobs(requests: List[JobApplicationRequest]):
    """
    Apply to multiple jobs in batch
    """
    results = []

    for request in requests:
        try:
            result = await apply_to_job(request)
            results.append(result)
        except Exception as e:
            # Create failed response
            failed_result = JobApplicationResponse(
                job_url=str(request.job_url),
                company_name="Unknown Company",
                job_title="Unknown Position",
                status=ApplicationStatus.FAILED,
                timestamp=datetime.now(),
                questions_answered=0,
                questions_and_answers=[],
                error_message=str(e),
                missing_fields=[]
            )
            results.append(failed_result)

    return {"results": results}

@app.get("/api/history/{user_id}")
async def get_application_history(user_id: int):
    """
    Get application history for a user
    """
    user_applications = [
        app for app in applications_history
        if app["user_id"] == user_id
    ]

    return {
        "applications": user_applications,
        "total": len(user_applications),
        "successful": len([app for app in user_applications if app["status"] == "success"]),
        "failed": len([app for app in user_applications if app["status"] == "failed"])
    }

@app.post("/api/profile")
async def save_profile(profile: ProfileModel):
    """
    Save user profile
    """
    user_profiles[profile.user_id] = profile.dict()
    return {"message": "Profile saved successfully", "user_id": profile.user_id}

@app.get("/api/profile/{user_id}")
async def get_profile(user_id: int):
    """
    Get user profile
    """
    profile = user_profiles.get(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.post("/api/custom-fields/{user_id}")
async def save_custom_fields(user_id: int, custom_fields: List[CustomFieldModel]):
    """
    Save custom fields for a user
    """
    user_custom_fields[user_id] = [field.dict() for field in custom_fields]
    return {"message": "Custom fields saved successfully", "user_id": user_id}

@app.get("/api/custom-fields/{user_id}")
async def get_custom_fields(user_id: int):
    """
    Get custom fields for a user
    """
    custom_fields = user_custom_fields.get(user_id, [])
    return {"custom_fields": custom_fields}

@app.delete("/api/history/{application_id}")
async def delete_application(application_id: int):
    """
    Delete an application from history
    """
    global applications_history

    # Find and remove the application
    applications_history = [
        app for app in applications_history
        if app["id"] != application_id
    ]

    return {"message": "Application deleted successfully"}

@app.get("/api/stats/{user_id}")
async def get_user_stats(user_id: int):
    """
    Get user statistics
    """
    user_applications = [
        app for app in applications_history
        if app["user_id"] == user_id
    ]

    total = len(user_applications)
    successful = len([app for app in user_applications if app["status"] == "success"])
    failed = len([app for app in user_applications if app["status"] == "failed"])

    return {
        "total": total,
        "successful": successful,
        "failed": failed,
        "success_rate": (successful / total * 100) if total > 0 else 0
    }

@app.post("/api/test-field-mapping")
async def test_field_mapping():
    """
    Test the field mapping system
    """
    from models import SmartFieldMapper

    mapper = SmartFieldMapper()

    # Test data
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

    # Test various field labels
    test_labels = [
        "Full Name",
        "Email Address",
        "Phone Number",
        "Location",
        "City",
        "Salary",
        "LinkedIn Profile",
        "GitHub",
        "Portfolio",
        "Resume",
        "Availability Date",
        "Salary Expectations",
        "Preferred Location"
    ]

    results = {}
    for label in test_labels:
        match = mapper.find_matching_field(label, profile_data, custom_fields)
        results[label] = match

    return {
        "test_results": results,
        "profile_data": profile_data,
        "custom_fields": custom_fields
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 