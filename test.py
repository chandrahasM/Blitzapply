
from langchain_openai import ChatOpenAI
from browser_use import Agent
import asyncio
import os


model = ChatOpenAI(
        model="gpt-4",  # or "gpt-4"
        openai_api_key="YOUR-OPENAI-API-KEY"
    )# Change this variable to test with different identities
person_name = "scarlett johansson"  
# Updated task prompt includes the person_name variable
task = f"Try filling this form with some genuine looking fake data for {person_name}. https://jobs.ashbyhq.com/haydenai/15ccdb3b-630f-40ef-8253-f6c7372f3e3e/application"
async def main():
    agent = Agent(
        task=task,
        llm=model,
    )
    result = await agent.run()
    print(result.final_result())
asyncio.run(main())