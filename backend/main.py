from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import os
import base64

app = FastAPI(title="Vaani Backend API", version="1.0")

# Enable CORS for your React/Vite frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://vaaniiii.netlify.app", # Your exact Netlify frontend URL
        "http://localhost:5173",          # Keeps local testing working too
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
TASK_MODEL_PATH = os.path.join(BASE_DIR, "hand_landmarker.task")

# Load model, scaler, and landmarker at startup if available
try:
    clf = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None
    scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
    
    base_options = python.BaseOptions(model_asset_path=TASK_MODEL_PATH)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        num_hands=1
    )
    detector = vision.HandLandmarker.create_from_options(options)
    print("[Info] FastAPI backend components initialized.")
except Exception as e:
    print(f"[Warning] Initialization warning: {e}")

class FeatureInput(BaseModel):
    features: list[float]

@app.get("/")
def read_root():
    return {
        "status": "Vaani backend is running",
        "model_loaded": os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH)
    }

@app.post("/predict/features")
def predict_from_features(data: FeatureInput):
    """Accepts a 63-element feature array computed directly on the frontend."""
    if not clf or not scaler:
        raise HTTPException(status_code=500, detail="Model or scaler not loaded.")
    
    try:
        arr = np.array(data.features, dtype=np.float32).reshape(1, -1)
        if arr.shape[1] != 63:
            raise HTTPException(status_code=400, detail=f"Expected 63 features, got {arr.shape[1]}.")
        
        scaled = scaler.transform(arr)
        prediction = str(clf.predict(scaled)[0])
        print(f"🎯 MODEL PREDICTION (/predict/features): '{prediction}'")
        
        return {
            "prediction": prediction,
            "result": prediction,
            "text": prediction,
            "label": prediction,
            "sign": prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/image")
async def predict_from_image(request: Request):
    """Handles client-side JSON landmarks and raw image fallback with prediction logging."""
    if not clf or not scaler:
        raise HTTPException(status_code=500, detail="Model or scaler not loaded.")
    
    try:
        content_type = request.headers.get("content-type", "")
        
        # 1. If frontend sends JSON containing landmarks (Client-side MediaPipe)
        if "application/json" in content_type:
            body_json = await request.json()
            
            if "landmarks" in body_json:
                raw_landmarks = body_json["landmarks"]
                features = []
                
                for lm in raw_landmarks:
                    if isinstance(lm, dict):
                        features.extend([
                            float(lm.get("x", 0)), 
                            float(lm.get("y", 0)), 
                            float(lm.get("z", 0))
                        ])
                
                if len(features) != 63:
                    raise HTTPException(status_code=400, detail=f"Expected 63 values, got {len(features)}")
                
                arr = np.array([features], dtype=np.float32)
                scaled = scaler.transform(arr)
                prediction = str(clf.predict(scaled)[0])
                
                print(f"🎯 MODEL PREDICTION (JSON landmarks): '{prediction}'")
                
                return {
                    "prediction": prediction,
                    "result": prediction,
                    "text": prediction,
                    "label": prediction,
                    "sign": prediction
                }

        # 2. Fallback: Raw image bytes / form-data
        contents = await request.body()
        if not contents:
            raise HTTPException(status_code=400, detail="No valid payload received.")

        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format.")
        
        rgb_image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
        
        result = detector.detect(mp_image)
        if not result.hand_landmarks:
            print("⚠️ Server-side MediaPipe: No hand detected in frame.")
            return {"prediction": None, "result": None, "text": "", "label": "", "sign": "", "message": "No hand detected."}
        
        landmarks = result.hand_landmarks[0]
        features = []
        for lm in landmarks:
            features.extend([lm.x, lm.y, lm.z])
            
        arr = np.array([features], dtype=np.float32)
        scaled = scaler.transform(arr)
        prediction = str(clf.predict(scaled)[0])
        
        print(f"🎯 MODEL PREDICTION (Server image): '{prediction}'")
        
        return {
            "prediction": prediction,
            "result": prediction,
            "text": prediction,
            "label": prediction,
            "sign": prediction
        }
        
    except Exception as e:
        print(f"[Error] /predict/image exception: {e}")
        raise HTTPException(status_code=500, detail=str(e))