import os
import json
from io import BytesIO

import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.applications import efficientnet, resnet50, mobilenet_v2

APP = Flask(__name__)
CORS(APP)

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
KERAS_MODEL = os.path.join(MODELS_DIR, "food_classifier.keras")
H5_MODEL = os.path.join(MODELS_DIR, "food_classifier.h5")
CLASS_NAMES_PATH = os.path.join(MODELS_DIR, "class_names.json")
IMAGE_SIZE = (224, 224)

# Load model and classes
def _load_model():
	model_path = KERAS_MODEL if os.path.exists(KERAS_MODEL) else H5_MODEL
	model = tf.keras.models.load_model(model_path)
	with open(os.path.abspath(CLASS_NAMES_PATH), "r", encoding="utf-8") as f:
		class_names = json.load(f)["class_names"]
	return model, class_names

MODEL, CLASS_NAMES = None, None
PREPROCESS_FN = None

def _select_preprocess_fn(model):
	"""Select a suitable preprocess_input based on backbone present in the model."""
	model_signature = (getattr(model, "name", "") + " " + " ".join([l.name for l in model.layers])).lower()
	if "efficientnet" in model_signature:
		return efficientnet.preprocess_input
	if "resnet" in model_signature or "resnet50" in model_signature:
		return resnet50.preprocess_input
	if "mobilenet" in model_signature:
		return mobilenet_v2.preprocess_input
	# Default: inputs are 0-1 scaled
	return lambda x: x / 255.0


def init_model():
	global MODEL, CLASS_NAMES, PREPROCESS_FN
	MODEL, CLASS_NAMES = _load_model()
	PREPROCESS_FN = _select_preprocess_fn(MODEL)

# Initialize model on startup
init_model()


def preprocess_image(file_storage) -> np.ndarray:
	img = Image.open(file_storage.stream).convert("RGB").resize(IMAGE_SIZE)
	arr = np.array(img).astype("float32")
	# Apply backbone-specific preprocessing
	arr = PREPROCESS_FN(arr)
	arr = np.expand_dims(arr, axis=0)
	return arr


@APP.route("/health", methods=["GET"])
def health():
	return jsonify({"status": "ok", "model_loaded": MODEL is not None, "num_classes": len(CLASS_NAMES) if CLASS_NAMES else 0})


@APP.route("/predict", methods=["POST"])
def predict():
	if MODEL is None:
		return jsonify({"error": "Model not loaded"}), 500
	if "file" not in request.files:
		return jsonify({"error": "No file uploaded under key 'file'"}), 400
	file = request.files["file"]
	img_arr = preprocess_image(file)
	preds = MODEL.predict(img_arr, verbose=0)
	pred = preds[0]

	# Ensure outputs are calibrated probabilities (apply softmax if needed)
	try:
		# If the model already has softmax, this will be a no-op (sum ~ 1.0)
		probs = pred
		total = float(np.sum(probs))
		if not np.isfinite(total) or total <= 0.0 or abs(total - 1.0) > 1e-3:
			probs = tf.nn.softmax(pred).numpy()
	except Exception:
		# Fallback to numpy softmax
		exp = np.exp(pred - np.max(pred))
		probs = exp / np.sum(exp)
	
	idx = int(np.argmax(probs))
	result = {
		"class": CLASS_NAMES[idx],
		"confidence": float(probs[idx]),
		"all_confidences": {CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))},
	}
	return jsonify(result)


if __name__ == "__main__":
	APP.run(host="0.0.0.0", port=5000, debug=True)
