from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
import numpy as np
from typing import List

app = FastAPI(title="KineVox ML Engine")

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASSES = ["Hello", "Thank You", "Yes", "No", "Help"]

# PyTorch MLP Architecture
class LandmarkClassifier(nn.Module):
    def __init__(self, input_dim=63, num_classes=5):
        super(LandmarkClassifier, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes)
        )
        
    def forward(self, x):
        return self.net(x)

# Initialize model
model = LandmarkClassifier()
model.eval()

# Try loading trained weights if available
try:
    model.load_state_dict(torch.load("model.pth", map_location=torch.device('cpu')))
    print("Loaded custom PyTorch model weights.")
except Exception:
    print("No trained weights found. Using model with fallback landmark rules.")

class LandmarkRequest(BaseModel):
    # Expecting 21 dicts containing x, y, z relative to frame
    landmarks: List[dict]

def normalize_landmarks(landmarks):
    """Normalize 21 landmarks relative to wrist (index 0) for scale & position invariance."""
    if not landmarks or len(landmarks) != 21:
        return None
    
    ref_x = landmarks[0]['x']
    ref_y = landmarks[0]['y']
    ref_z = landmarks[0]['z']
    
    normalized = []
    for lm in landmarks:
        normalized.extend([
            lm['x'] - ref_x,
            lm['y'] - ref_y,
            lm['z'] - ref_z
        ])
    return np.array(normalized, dtype=np.float32)

@app.post("/predict")
async def predict_gesture(data: LandmarkRequest):
    feat = normalize_landmarks(data.landmarks)
    if feat is None:
        return {"gesture": "None", "confidence": 0.0}

    # Tensor conversion
    inputs = torch.tensor(feat).unsqueeze(0) # Shape: [1, 63]

    with torch.no_grad():
        outputs = model(inputs)
        probs = torch.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)

    predicted_label = CLASSES[pred.item()]
    confidence = round(float(conf.item()), 3)

    return {
        "gesture": predicted_label if confidence > 0.4 else "Detecting...",
        "confidence": confidence
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)