from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import SpamDetector
import uvicorn

app = FastAPI(title="Spam Detection API")
model = SpamDetector()

class Message(BaseModel):
    text: str
    phone: str | None = None

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    reason: str

@app.on_event("startup")
async def startup_event():
    # Try to load pre-trained model, if not available, train new one
    if not model.load_model():
        model.train('dataset.csv')

@app.post("/analyze", response_model=PredictionResponse)
async def analyze_message(message: Message):
    try:
        result = model.predict(message.text, message.phone)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)