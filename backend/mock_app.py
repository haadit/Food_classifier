import os
import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS

APP = Flask(__name__)
CORS(APP)

# Load class names
CLASS_NAMES_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "class_names.json")
with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    CLASS_NAMES = json.load(f)["class_names"]

def generate_realistic_predictions():
    """Generate realistic prediction probabilities"""
    # Create a more realistic distribution
    predictions = [random.uniform(0.001, 0.1) for _ in range(len(CLASS_NAMES))]
    
    # Pick a random class to be the winner
    winner_idx = random.randint(0, len(CLASS_NAMES) - 1)
    predictions[winner_idx] = random.uniform(0.6, 0.95)
    
    # Normalize to sum to 1
    total = sum(predictions)
    predictions = [p / total for p in predictions]
    
    return predictions

@APP.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok", 
        "model_loaded": True, 
        "num_classes": len(CLASS_NAMES)
    })

@APP.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded under key 'file'"}), 400
    
    # Generate realistic predictions
    predictions = generate_realistic_predictions()
    idx = predictions.index(max(predictions))
    
    result = {
        "class": CLASS_NAMES[idx],
        "confidence": float(predictions[idx]),
        "all_confidences": {CLASS_NAMES[i]: float(predictions[i]) for i in range(len(CLASS_NAMES))},
    }
    
    print(f"Mock prediction result: {result}")
    return jsonify(result)

if __name__ == "__main__":
    print(f"Starting mock server with {len(CLASS_NAMES)} classes: {CLASS_NAMES}")
    APP.run(host="0.0.0.0", port=5000, debug=True)
