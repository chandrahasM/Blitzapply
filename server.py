from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import Dict, Optional
import asyncio
from URLApply2 import fill_and_submit_form

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only. In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobApplication(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    url: str
    user_info: Dict[str, str]

async def process_application(url: str, user_info: Dict[str, str]):
    try:
        # Create a new event loop for the playwright process
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Run the form filling function
        print("BEfore fill and submit")
        await fill_and_submit_form(url, user_info)
    except Exception as e:
        print(f"Error processing application: {e}")
        raise

@app.post("/api/apply")
async def apply_to_job(application: JobApplication, background_tasks: BackgroundTasks):
    try:
        # Add the task to background tasks
        print("Before process application")
        background_tasks.add_task(process_application, application.url, application.user_info)
        return {"status": "success", "message": "Application processing started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
