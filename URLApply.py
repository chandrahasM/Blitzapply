import csv
import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain_openai import ChatOpenAI  # LLM for filling forms
from pydantic import BaseModel

from browser_use import ActionResult, Agent, Controller
from browser_use.browser.context import BrowserContext
from browser_use.browser.browser import Browser, BrowserConfig

# Load environment variables
# load_dotenv()

# # Validate OpenAI API Key
# if not os.getenv("OPENAI_API_KEY"):
#     raise ValueError("OPENAI_API_KEY is not set. Please add it to your .env file.")

logger = logging.getLogger(__name__)
controller = Controller()

# CV Path
CV = Path(__file__).parent / 'resume' / 'Chandrahas_Fullstack_A.pdf'
if not CV.exists():
    raise FileNotFoundError(f'CV file not found at {CV}')

# Job details model
class Job(BaseModel):
    title: str
    link: str
    company: str
    fit_score: float
    location: Optional[str] = None
    salary: Optional[str] = None

@controller.action('Read my CV for form filling')
def read_cv():
    pdf = PdfReader(CV)
    text = ''.join(page.extract_text() or '' for page in pdf.pages)
    logger.info(f'Read CV with {len(text)} characters')
    return ActionResult(extracted_content=text, include_in_memory=True)

async def get_form_fields(browser: BrowserContext, llm: ChatOpenAI):
    elements = await browser.get_all_form_fields()
    field_labels = [element.label for element in elements if element.label]
    prompt = f"Match these form labels to the correct standardized fields: {field_labels}"
    response = llm.predict(prompt)
    return dict(zip(field_labels, response.split(',')))

@controller.action('Navigate to job application URL and fill form')
async def apply_to_job(url: str, browser: BrowserContext, llm: ChatOpenAI):
    await browser.navigate(url)
    cv_text = read_cv().extracted_content  # Extracted CV text

    form_template = {
        "full_name": "Chandrahas XYZ",
        "email": "chandrahas@example.com",
        "phone": "+1234567890",
        "linkedin": "https://linkedin.com/in/chandrahas",
        "github": "https://github.com/chandrahas",
        "resume": cv_text,
        "cover_letter": "I am a Fullstack Engineer specializing in AI-driven products. My experience includes..."
    }
    
    field_mappings = await get_form_fields(browser, llm)
    
    for label, mapped_field in field_mappings.items():
        if mapped_field in form_template:
            element = await browser.get_element_by_label(label)
            if element:
                await element.fill(form_template[mapped_field])
                logger.info(f'Filled field: {label} with {mapped_field}')
            else:
                logger.warning(f'Field {label} not found on the page')

    # Submit the form
    submit_button = await browser.get_element_by_text("Submit")
    if submit_button:
        await submit_button.click()
        logger.info("Application submitted successfully!")
    else:
        logger.warning("Submit button not found!")

# Browser setup
browser = Browser(
    config=BrowserConfig(
        chrome_instance_path="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", 
        headless=False
    )
)

model = ChatOpenAI(
        model="gpt-4",  # or "gpt-4"
        openai_api_key="YOUR-OPENAI-API-KEY"
    )

async def main():
    job_application_url = "https://jobs.ashbyhq.com/haydenai/15ccdb3b-630f-40ef-8253-f6c7372f3e3e/application"
    await apply_to_job(job_application_url, browser, model)

if __name__ == "__main__":
    asyncio.run(main())
