import asyncio
import re
from typing import List, Dict, Any, Optional
from playwright.async_api import async_playwright, Page, ElementHandle
from models import SmartFieldMapper, ApplicationStatus
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlaywrightJobApplicationService:
    def __init__(self):
        self.field_mapper = SmartFieldMapper()
        self.browser = None
        self.page = None
    
    async def apply_to_job(self, job_url: str, profile_data: Dict[str, Any], custom_fields: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Main method to apply to a job using Playwright automation
        """
        try:
            async with async_playwright() as p:
                # Launch browser with visible window
                self.browser = await p.chromium.launch(
                    headless=False,  # Show browser window
                    args=[
                        '--no-sandbox', 
                        '--disable-dev-shm-usage',
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor'
                    ]
                )
                
                # Create a new page with larger window
                self.page = await self.browser.new_page()
                await self.page.set_viewport_size({"width": 1280, "height": 720})
                
                # Navigate to job URL
                logger.info(f"Navigating to: {job_url}")
                await self.page.goto(job_url, wait_until="networkidle", timeout=30000)
                
                # Wait a bit for page to load completely
                await asyncio.sleep(2)
                
                # Extract company and job title
                company_name, job_title = await self._extract_job_info()
                
                # Find and fill form fields
                form_fields = await self._detect_form_fields()
                filled_fields = await self._fill_form_fields(form_fields, profile_data, custom_fields)
                
                # Check for missing required fields
                missing_fields = self.field_mapper.get_missing_fields(form_fields, profile_data, custom_fields)
                
                if missing_fields:
                    logger.warning(f"Missing required fields: {missing_fields}")
                    return {
                        "status": ApplicationStatus.FAILED,
                        "company_name": company_name,
                        "job_title": job_title,
                        "questions_answered": len(filled_fields),
                        "questions_and_answers": filled_fields,
                        "missing_fields": missing_fields,
                        "error_message": f"Missing required fields: {', '.join(missing_fields)}"
                    }
                
                # Try to submit the form
                submission_success = await self._submit_form()
                
                if submission_success:
                    logger.info("Application submitted successfully")
                    return {
                        "status": ApplicationStatus.SUCCESS,
                        "company_name": company_name,
                        "job_title": job_title,
                        "questions_answered": len(filled_fields),
                        "questions_and_answers": filled_fields,
                        "missing_fields": [],
                        "error_message": None
                    }
                else:
                    logger.warning("Failed to submit application form")
                    return {
                        "status": ApplicationStatus.FAILED,
                        "company_name": company_name,
                        "job_title": job_title,
                        "questions_answered": len(filled_fields),
                        "questions_and_answers": filled_fields,
                        "missing_fields": missing_fields,
                        "error_message": "Failed to submit application form"
                    }
                
        except Exception as e:
            logger.error(f"Error applying to job: {str(e)}")
            return {
                "status": ApplicationStatus.FAILED,
                "company_name": "Unknown Company",
                "job_title": "Unknown Position",
                "questions_answered": 0,
                "questions_and_answers": [],
                "missing_fields": [],
                "error_message": str(e)
            }
        finally:
            # Keep browser open for a few seconds so user can see the result
            if self.browser:
                await asyncio.sleep(3)
                await self.browser.close()
    
    async def _extract_job_info(self) -> tuple[str, str]:
        """Extract company name and job title from the page"""
        try:
            # Try to find job title
            job_title_selectors = [
                "h1",
                "[data-testid='job-title']",
                ".job-title",
                ".position-title",
                "title"
            ]
            
            job_title = "Unknown Position"
            for selector in job_title_selectors:
                try:
                    element = await self.page.query_selector(selector)
                    if element:
                        text = await element.text_content()
                        if text and len(text.strip()) > 0:
                            job_title = text.strip()
                            break
                except:
                    continue
            
            # Try to find company name
            company_selectors = [
                "[data-testid='company-name']",
                ".company-name",
                ".employer-name",
                ".company",
                "a[href*='company']"
            ]
            
            company_name = "Unknown Company"
            for selector in company_selectors:
                try:
                    element = await self.page.query_selector(selector)
                    if element:
                        text = await element.text_content()
                        if text and len(text.strip()) > 0:
                            company_name = text.strip()
                            break
                except:
                    continue
            
            return company_name, job_title
            
        except Exception as e:
            logger.error(f"Error extracting job info: {str(e)}")
            return "Unknown Company", "Unknown Position"
    
    async def _detect_form_fields(self) -> List[Dict[str, Any]]:
        """Detect all form fields on the page"""
        form_fields = []
        
        try:
            # Find all input elements
            inputs = await self.page.query_selector_all("input, textarea, select")
            
            for input_element in inputs:
                try:
                    field_info = await self._analyze_field(input_element)
                    if field_info:
                        form_fields.append(field_info)
                except Exception as e:
                    logger.warning(f"Error analyzing field: {str(e)}")
                    continue
            
            # Also look for custom form elements
            custom_fields = await self.page.query_selector_all("[data-testid*='input'], [class*='input'], [class*='field']")
            
            for field in custom_fields:
                try:
                    field_info = await self._analyze_custom_field(field)
                    if field_info:
                        form_fields.append(field_info)
                except Exception as e:
                    logger.warning(f"Error analyzing custom field: {str(e)}")
                    continue
            
        except Exception as e:
            logger.error(f"Error detecting form fields: {str(e)}")
        
        return form_fields
    
    async def _analyze_field(self, element: ElementHandle) -> Optional[Dict[str, Any]]:
        """Analyze a form field element"""
        try:
            tag_name = await element.get_attribute("tagName")
            field_type = await element.get_attribute("type")
            name = await element.get_attribute("name")
            id_attr = await element.get_attribute("id")
            placeholder = await element.get_attribute("placeholder")
            label_text = await self._find_label_for_field(element)
            
            # Determine field type
            if tag_name == "SELECT":
                field_type = "dropdown"
            elif tag_name == "TEXTAREA":
                field_type = "textarea"
            elif field_type in ["radio", "checkbox"]:
                field_type = field_type
            elif field_type == "file":
                field_type = "file"
            else:
                field_type = "text"
            
            # Create field label
            label = label_text or placeholder or name or id_attr or "Unknown Field"
            
            return {
                "element": element,
                "label": label,
                "type": field_type,
                "name": name,
                "id": id_attr,
                "placeholder": placeholder
            }
            
        except Exception as e:
            logger.warning(f"Error analyzing field: {str(e)}")
            return None
    
    async def _analyze_custom_field(self, element: ElementHandle) -> Optional[Dict[str, Any]]:
        """Analyze custom form field elements"""
        try:
            text_content = await element.text_content()
            aria_label = await element.get_attribute("aria-label")
            data_testid = await element.get_attribute("data-testid")
            
            label = aria_label or data_testid or text_content or "Custom Field"
            
            # Check if it's clickable (dropdown/radio/checkbox)
            is_clickable = await element.is_visible() and await element.is_enabled()
            
            field_type = "text"  # Default
            if is_clickable:
                # Try to determine if it's a dropdown or radio
                try:
                    await element.click()
                    await asyncio.sleep(0.5)
                    # Check if dropdown options appeared
                    options = await self.page.query_selector_all("option, [role='option']")
                    if options:
                        field_type = "dropdown"
                    else:
                        field_type = "radio"
                except:
                    field_type = "text"
            
            return {
                "element": element,
                "label": label,
                "type": field_type,
                "name": data_testid,
                "id": None,
                "placeholder": None
            }
            
        except Exception as e:
            logger.warning(f"Error analyzing custom field: {str(e)}")
            return None
    
    async def _find_label_for_field(self, element: ElementHandle) -> Optional[str]:
        """Find the label text for a form field"""
        try:
            # Try to find label by for attribute
            id_attr = await element.get_attribute("id")
            if id_attr:
                label = await self.page.query_selector(f"label[for='{id_attr}']")
                if label:
                    return await label.text_content()
            
            # Try to find label by name attribute
            name_attr = await element.get_attribute("name")
            if name_attr:
                label = await self.page.query_selector(f"label[for='{name_attr}']")
                if label:
                    return await label.text_content()
            
            # Look for nearby label text
            parent = await element.query_selector("..")
            if parent:
                label = await parent.query_selector("label")
                if label:
                    return await label.text_content()
            
            return None
            
        except Exception as e:
            logger.warning(f"Error finding label: {str(e)}")
            return None
    
    async def _fill_form_fields(self, form_fields: List[Dict[str, Any]], profile_data: Dict[str, Any], custom_fields: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Fill form fields with profile data"""
        filled_fields = []
        
        for field in form_fields:
            try:
                label = field.get("label", "")
                field_type = field.get("type", "text")
                element = field.get("element")
                
                # Find matching data
                matching_data = self.field_mapper.find_matching_field(label, profile_data, custom_fields)
                
                if matching_data and element:
                    value = matching_data["value"]
                    source = matching_data["source"]
                    
                    # Fill the field based on its type
                    success = await self._fill_field_by_type(element, field_type, value)
                    
                    if success:
                        filled_fields.append({
                            "question": label,
                            "answer": value,
                            "source": source,
                            "field_type": field_type
                        })
                        logger.info(f"Filled field '{label}' with value '{value}' from {source}")
                
            except Exception as e:
                logger.warning(f"Error filling field {field.get('label', 'unknown')}: {str(e)}")
                continue
        
        return filled_fields
    
    async def _fill_field_by_type(self, element: ElementHandle, field_type: str, value: str) -> bool:
        """Fill a field based on its type"""
        try:
            if field_type == "text" or field_type == "email" or field_type == "phone":
                await element.fill(value)
                return True
            
            elif field_type == "textarea":
                await element.fill(value)
                return True
            
            elif field_type == "dropdown":
                # Try to select by text
                try:
                    await element.select_option(label=value)
                    return True
                except:
                    # Try to select by value
                    try:
                        await element.select_option(value=value)
                        return True
                    except:
                        # Try to select first option
                        try:
                            await element.select_option(index=0)
                            return True
                        except:
                            return False
            
            elif field_type == "radio":
                # Find radio button with matching value
                radio_buttons = await self.page.query_selector_all("input[type='radio']")
                for radio in radio_buttons:
                    try:
                        radio_value = await radio.get_attribute("value")
                        if radio_value and value.lower() in radio_value.lower():
                            await radio.check()
                            return True
                    except:
                        continue
                
                # If no match, check the first radio button
                if radio_buttons:
                    await radio_buttons[0].check()
                    return True
                
                return False
            
            elif field_type == "checkbox":
                # Check if the checkbox should be checked based on value
                if value.lower() in ["yes", "true", "1", "checked"]:
                    await element.check()
                else:
                    await element.uncheck()
                return True
            
            elif field_type == "file":
                # Handle file upload (resume)
                if "resume" in value.lower() or "cv" in value.lower():
                    # For now, we'll skip file uploads as they require actual files
                    logger.info("Skipping file upload - requires actual file")
                    return False
                return False
            
            else:
                # Default to text input
                await element.fill(value)
                return True
                
        except Exception as e:
            logger.warning(f"Error filling field of type {field_type}: {str(e)}")
            return False
    
    async def _submit_form(self) -> bool:
        """Attempt to submit the form"""
        try:
            # Look for submit buttons
            submit_selectors = [
                "button[type='submit']",
                "input[type='submit']",
                "button:contains('Submit')",
                "button:contains('Apply')",
                "button:contains('Send')",
                "[data-testid='submit']",
                ".submit-button",
                ".apply-button"
            ]
            
            for selector in submit_selectors:
                try:
                    submit_button = await self.page.query_selector(selector)
                    if submit_button and await submit_button.is_visible():
                        await submit_button.click()
                        await asyncio.sleep(2)  # Wait for submission
                        return True
                except:
                    continue
            
            # If no submit button found, try pressing Enter
            await self.page.keyboard.press("Enter")
            await asyncio.sleep(2)
            
            return True  # Assume success if no error
            
        except Exception as e:
            logger.error(f"Error submitting form: {str(e)}")
            return False 