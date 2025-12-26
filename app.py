from api import app

# This file serves as the entrypoint for Vercel deployment
# It imports the FastAPI app from api.py

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app", host="0.0.0.0", port=8000, reload=True)