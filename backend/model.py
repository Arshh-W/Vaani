import os
import joblib
import numpy as np

class SignClassifier:
    def __init__(self, model_path="model_weights.pkl"):
        self.model_path = model_path
        self.model = self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                return joblib.load(self.model_path)
            except Exception as e:
                print(f"Error loading model weights: {e}")
                return None
        else:
            print("Warning: Model weights file not found. Running in mock inference mode.")
            return None

    def predict(self, landmarks: list):
        # MediaPipe returns 21 3D landmarks (x, y, z), flattened to 63 features
        try:
            flattened = []
            for lm in landmarks:
                flattened.extend([lm.get('x', 0), lm.get('y', 0), lm.get('z', 0)])
            
            features = np.array(flattened).reshape(1, -1)

            if self.model is not None:
                prediction = self.model.predict(features)[0]
                # Get prediction probabilities if supported
                probabilities = self.model.predict_proba(features)
                confidence = float(np.max(probabilities))
                return str(prediction), confidence
            else:
                # Fallback mock response for rapid frontend testing if weights aren't added yet
                return "Hello (Mock)", 0.95
                
        except Exception as e:
            print(f"Prediction error: {e}")
            return "Error analyzing gesture", 0.0