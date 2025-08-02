from pydantic import BaseModel, HttpUrl, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import re

class ApplicationStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"

class ProfileModel(BaseModel):
    user_id: int
    full_name: str
    email: str  # Changed from EmailStr for Pydantic v1 compatibility
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class CustomFieldModel(BaseModel):
    id: int
    user_id: int
    field_name: str
    field_value: str
    created_at: datetime
    updated_at: datetime

class JobApplicationRequest(BaseModel):
    job_url: str  # Changed from HttpUrl for Pydantic v1 compatibility
    user_id: int

class JobApplicationResponse(BaseModel):
    job_url: str
    company_name: str
    job_title: str
    status: ApplicationStatus
    timestamp: datetime
    questions_answered: int
    questions_and_answers: List[Dict[str, str]]
    error_message: Optional[str] = None
    missing_fields: Optional[List[str]] = None

class ApplicationHistoryResponse(BaseModel):
    applications: List[JobApplicationResponse]

class FieldMapping(BaseModel):
    profile_field: str
    possible_labels: List[str]
    field_type: str  # text, email, phone, url, file, dropdown, radio, checkbox

class SmartFieldMapper:
    """Smart field mapping system using regex and fuzzy matching"""
    
    def __init__(self):
        self.field_mappings = {
            "full_name": FieldMapping(
                profile_field="full_name",
                possible_labels=[
                    "full name", "name", "fullname", "full_name", "candidate name",
                    "applicant name", "your name", "first and last name",
                    "full legal name", "complete name"
                ],
                field_type="text"
            ),
            "email": FieldMapping(
                profile_field="email",
                possible_labels=[
                    "email", "email address", "e-mail", "email address",
                    "contact email", "work email", "personal email",
                    "email id", "email address", "e-mail address"
                ],
                field_type="email"
            ),
            "phone": FieldMapping(
                profile_field="phone",
                possible_labels=[
                    "phone", "phone number", "telephone", "mobile", "cell",
                    "contact number", "phone no", "telephone number",
                    "mobile number", "cell phone", "contact phone"
                ],
                field_type="phone"
            ),
            "location": FieldMapping(
                profile_field="location",
                possible_labels=[
                    "location", "city", "state", "address", "residence",
                    "current location", "work location", "job location",
                    "preferred location", "relocation", "remote"
                ],
                field_type="text"
            ),
            "experience": FieldMapping(
                profile_field="experience",
                possible_labels=[
                    "experience", "years of experience", "work experience",
                    "professional experience", "relevant experience",
                    "total experience", "experience level"
                ],
                field_type="text"
            ),
            "salary": FieldMapping(
                profile_field="salary",
                possible_labels=[
                    "salary", "salary expectation", "expected salary",
                    "salary range", "compensation", "pay", "wage",
                    "salary requirements", "desired salary"
                ],
                field_type="text"
            ),
            "linkedin": FieldMapping(
                profile_field="linkedin_url",
                possible_labels=[
                    "linkedin", "linkedin profile", "linkedin url",
                    "linkedin link", "linkedin page", "linkedin account"
                ],
                field_type="url"
            ),
            "github": FieldMapping(
                profile_field="github_url",
                possible_labels=[
                    "github", "github profile", "github url",
                    "github link", "github account", "github username"
                ],
                field_type="url"
            ),
            "portfolio": FieldMapping(
                profile_field="portfolio_url",
                possible_labels=[
                    "portfolio", "portfolio url", "portfolio link",
                    "website", "personal website", "portfolio site"
                ],
                field_type="url"
            ),
            "resume": FieldMapping(
                profile_field="resume_url",
                possible_labels=[
                    "resume", "cv", "resume file", "cv file",
                    "resume upload", "cv upload", "resume attachment",
                    "cv attachment", "resume document"
                ],
                field_type="file"
            )
        }
    
    def find_matching_field(self, label: str, profile_data: Dict[str, Any], custom_fields: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Find the best matching field for a given label
        Returns: Dict with 'value', 'source', and 'field_type'
        """
        label_lower = label.lower().strip()
        
        # Check profile fields first
        for field_name, mapping in self.field_mappings.items():
            for possible_label in mapping.possible_labels:
                if self._fuzzy_match(label_lower, possible_label):
                    profile_value = profile_data.get(field_name)
                    if profile_value:
                        return {
                            "value": profile_value,
                            "source": "profile",
                            "field_type": mapping.field_type,
                            "field_name": field_name
                        }
        
        # Check custom fields
        for custom_field in custom_fields:
            custom_label = custom_field.get("field_name", "").lower()
            if self._fuzzy_match(label_lower, custom_label):
                custom_value = custom_field.get("field_value")
                if custom_value:
                    return {
                        "value": custom_value,
                        "source": "custom",
                        "field_type": "text",
                        "field_name": custom_field.get("field_name")
                    }
        
        return None
    
    def _fuzzy_match(self, label: str, possible_label: str) -> bool:
        """Fuzzy matching using various techniques"""
        
        # Exact match
        if label == possible_label:
            return True
        
        # Contains match
        if possible_label in label or label in possible_label:
            return True
        
        # Word-based matching
        label_words = set(re.findall(r'\w+', label))
        possible_words = set(re.findall(r'\w+', possible_label))
        
        if label_words & possible_words:  # Intersection
            return True
        
        # Common variations
        variations = {
            "email": ["e-mail", "email address"],
            "phone": ["telephone", "mobile", "cell"],
            "name": ["full name", "fullname"],
            "location": ["city", "state", "address"],
            "experience": ["years", "work experience"],
            "salary": ["compensation", "pay", "wage"],
            "linkedin": ["linkedin profile", "linkedin url"],
            "github": ["github profile", "github url"],
            "portfolio": ["website", "personal website"],
            "resume": ["cv", "resume file", "cv file"]
        }
        
        for base_word, var_list in variations.items():
            if label in var_list or possible_label in var_list:
                return True
        
        return False
    
    def get_missing_fields(self, form_fields: List[Dict[str, Any]], profile_data: Dict[str, Any], custom_fields: List[Dict[str, Any]]) -> List[str]:
        """Get list of fields that couldn't be filled"""
        missing_fields = []
        
        for field in form_fields:
            label = field.get("label", "")
            if not self.find_matching_field(label, profile_data, custom_fields):
                missing_fields.append(label)
        
        return missing_fields 