#!/usr/bin/env python3
"""
Startup script for BlitzApply Backend
Installs Playwright browsers and starts the FastAPI server
"""

import subprocess
import sys
import os

def install_playwright_browsers():
    """Install Playwright browsers"""
    print("Installing Playwright browsers...")
    try:
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
        print("✅ Playwright browsers installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing Playwright browsers: {e}")
        sys.exit(1)

def install_dependencies():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        sys.exit(1)

def start_server():
    """Start the FastAPI server"""
    print("Starting BlitzApply Backend server...")
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 BlitzApply Backend Startup")
    print("=" * 40)
    
    # Install dependencies
    install_dependencies()
    
    # Install Playwright browsers
    install_playwright_browsers()
    
    # Start server
    start_server() 