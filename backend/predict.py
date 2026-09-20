import cv2
import joblib
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import time

# --- CONFIGURATION ---
MODEL_PATH = "model.pkl"
SCALER_PATH = "scaler.pkl"
TASK_MODEL_PATH = "hand_landmarker.task"

# Load trained model and scaler
try:
    clf = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("[Info] Model and scaler loaded successfully.")
except Exception as e:
    print(f"[Error] Could not load model or scaler: {e}. Train the model first using train.py")
    exit(1)

# Initialize MediaPipe HandLandmarker in VIDEO mode
base_options = python.BaseOptions(model_asset_path=TASK_MODEL_PATH)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.VIDEO,
    num_hands=1,
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5
)
detector = vision.HandLandmarker.create_from_options(options)

# Open Webcam
cap = cv2.VideoCapture(0)
print("[Info] Starting webcam stream. Press 'q' to exit.")

start_time = time.time()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("[Error] Failed to grab frame from camera.")
        break

    # Calculate timestamp in milliseconds required for VIDEO running mode
    timestamp_ms = int((time.time() - start_time) * 1000)

    # Convert frame to RGB and wrap in mp.Image
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

    # Detect landmarks
    result = detector.detect_for_video(mp_image, timestamp_ms)

    prediction_text = "No Hand Detected"
    if result.hand_landmarks:
        # Extract 21 landmarks (x, y, z -> 21 * 3 = 63 features)
        landmarks = result.hand_landmarks[0]
        features = []
        for lm in landmarks:
            features.extend([lm.x, lm.y, lm.z])
        
        # Scale and predict
        features_array = np.array([features], dtype=np.float32)
        features_scaled = scaler.transform(features_array)
        prediction = clf.predict(features_scaled)[0]
        
        prediction_text = f"Prediction: {prediction}"

        # Draw simple keypoints on hand joints
        h, w, _ = frame.shape
        for lm in landmarks:
            cx, cy = int(lm.x * w), int(lm.y * h)
            cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)

    # Overlay prediction text onto the video window
    cv2.putText(frame, prediction_text, (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
    cv2.imshow("Vaani Real-Time Inference", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()