import os
import cv2
import joblib
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# --- 1. CONFIGURATION & PATHS ---
DATASET_DIR = "dataset/indian-sign-language-isl/Indian"  # Folder containing class subfolders of hand images
MODEL_OUTPUT = "model.pkl"
SCALER_OUTPUT = "scaler.pkl"
MODEL_PATH = "hand_landmarker.task"  # Must be in the same directory


def initialize_detector():
  """Initializes the MediaPipe HandLandmarker Tasks API."""
  base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
  options = vision.HandLandmarkerOptions(
      base_options=base_options,
      num_hands=1,  # Change to 2 if your project requires dual-hand tracking
      min_hand_detection_confidence=0.5,
      min_hand_presence_confidence=0.5,
      min_tracking_confidence=0.5,
  )
  return vision.HandLandmarker.create_from_options(options)


def extract_landmarks_from_image(detector, image_path):
  """Loads an image, runs HandLandmarker, and returns normalized 3D coordinates (63 features)."""
  image = cv2.imread(image_path)
  if image is None:
    return None

  # Convert BGR to RGB and wrap into mp.Image
  rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
  mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

  # Run detection
  result = detector.detect(mp_image)

  if not result.hand_landmarks:
    return None  # No hands detected

  # Extract 21 landmarks (x, y, z for each -> 21 * 3 = 63 features)
  landmarks = result.hand_landmarks[0]
  feature_vector = []
  for lm in landmarks:
    feature_vector.extend([lm.x, lm.y, lm.z])

  return np.array(feature_vector, dtype=np.float32)


def load_dataset(detector):
  """Loops through dataset subdirectories to collect features and labels."""
  data = []
  labels = []

  if not os.path.exists(DATASET_DIR):
    print(
        f"[Error] Dataset directory '{DATASET_DIR}' not found. Please create"
        " it."
    )
    return np.array([]), np.array([])

  print("[Info] Extracting features from dataset using MediaPipe Tasks API...")
  for label_name in os.listdir(DATASET_DIR):
    class_dir = os.path.join(DATASET_DIR, label_name)
    if not os.path.isdir(class_dir):
      continue

    print(f" -> Processing class: {label_name}")
    for file_name in os.listdir(class_dir):
      file_path = os.path.join(class_dir, file_name)
      if file_path.lower().endswith((".png", ".jpg", ".jpeg")):
        features = extract_landmarks_from_image(detector, file_path)
        if features is not None:
          data.append(features)
          labels.append(label_name)

  return np.array(data), np.array(labels)


def main():
  # Initialize detector
  detector = initialize_detector()

  # 1. Load data & extract features
  X, y = load_dataset(detector)
  if len(X) == 0:
    print("[Error] No training data could be processed. Check your dataset path.")
    return

  print(f"[Info] Successfully extracted features from {len(X)} samples.")

  # 2. Preprocess data (Scale features)
  scaler = StandardScaler()
  X_scaled = scaler.fit_transform(X)

  # 3. Train/Test Split
  X_train, X_test, y_train, y_test = train_test_split(
      X_scaled, y, test_size=0.2, random_state=42
  )

  # 4. Train Model (Example: Random Forest)
  print("[Info] Training classifier model...")
  clf = RandomForestClassifier(n_estimators=100, random_state=42)
  clf.fit(X_train, y_train)

  # Evaluate
  accuracy = clf.score(X_test, y_test)
  print(f"[Success] Model training complete! Test Accuracy: {accuracy * 100:.2f}%")

  # 5. Save Model and Scaler
  joblib.dump(clf, MODEL_OUTPUT)
  joblib.dump(scaler, SCALER_OUTPUT)
  print(f"[Info] Saved model to {MODEL_OUTPUT} and scaler to {SCALER_OUTPUT}")


if __name__ == "__main__":
  main()