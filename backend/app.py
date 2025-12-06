import os
import json
import sys
import traceback
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
	# Check if model files exist
	print(f"MODELS_DIR: {MODELS_DIR}")
	print(f"Checking for KERAS_MODEL: {KERAS_MODEL} - Exists: {os.path.exists(KERAS_MODEL)}")
	print(f"Checking for H5_MODEL: {H5_MODEL} - Exists: {os.path.exists(H5_MODEL)}")
	print(f"Checking for CLASS_NAMES_PATH: {CLASS_NAMES_PATH} - Exists: {os.path.exists(CLASS_NAMES_PATH)}")
	
	# List all files in models directory
	if os.path.exists(MODELS_DIR):
		print(f"Files in models directory: {os.listdir(MODELS_DIR)}")
	else:
		print(f"ERROR: Models directory does not exist: {MODELS_DIR}")
		raise FileNotFoundError(f"Models directory not found: {MODELS_DIR}")
	
	model_path = KERAS_MODEL if os.path.exists(KERAS_MODEL) else H5_MODEL
	if not os.path.exists(model_path):
		raise FileNotFoundError(f"Model file not found. Checked: {KERAS_MODEL} and {H5_MODEL}")
	
	if not os.path.exists(CLASS_NAMES_PATH):
		raise FileNotFoundError(f"Class names file not found: {CLASS_NAMES_PATH}")
	
	print(f"Loading model from: {model_path}", file=sys.stderr)
	print(f"Model file size: {os.path.getsize(model_path) / (1024*1024):.2f} MB", file=sys.stderr)
	print("Calling tf.keras.models.load_model()... This may take 30-60 seconds...", file=sys.stderr)
	print("Starting model load at:", file=sys.stderr)
	import time
	start_time = time.time()
	try:
		model = tf.keras.models.load_model(model_path, compile=False)
		load_time = time.time() - start_time
		print(f"Model loaded from file successfully in {load_time:.2f} seconds", file=sys.stderr)
	except Exception as load_error:
		print(f"ERROR during tf.keras.models.load_model(): {load_error}", file=sys.stderr)
		print(traceback.format_exc(), file=sys.stderr)
		raise
	
	with open(os.path.abspath(CLASS_NAMES_PATH), "r", encoding="utf-8") as f:
		class_names = json.load(f)["class_names"]
	print(f"Loaded {len(class_names)} class names")
	return model, class_names

MODEL, CLASS_NAMES = None, None
PREPROCESS_FN = None
MODEL_LOADING_STARTED = False
MODEL_LOADING_ERROR = None

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
	global MODEL, CLASS_NAMES, PREPROCESS_FN, MODEL_LOADING_STARTED, MODEL_LOADING_ERROR
	MODEL_LOADING_STARTED = True
	MODEL_LOADING_ERROR = None
	try:
		print("=" * 50, file=sys.stderr)
		print("Loading model...", file=sys.stderr)
		print("=" * 50, file=sys.stderr)
		MODEL, CLASS_NAMES = _load_model()
		PREPROCESS_FN = _select_preprocess_fn(MODEL)
		print("=" * 50, file=sys.stderr)
		print(f"Model loaded successfully! Classes: {len(CLASS_NAMES)}", file=sys.stderr)
		print("=" * 50, file=sys.stderr)
	except Exception as e:
		MODEL_LOADING_ERROR = str(e)
		print("=" * 50, file=sys.stderr)
		print(f"ERROR loading model: {e}", file=sys.stderr)
		print(traceback.format_exc(), file=sys.stderr)
		print("=" * 50, file=sys.stderr)
		MODEL, CLASS_NAMES, PREPROCESS_FN = None, None, None

# Initialize model on startup
# Check if we're running with Gunicorn (production) or directly (development)
# With --preload, we need to load synchronously before workers fork
# Without preload, we can load in background for faster startup
import os
is_gunicorn = "gunicorn" in os.environ.get("SERVER_SOFTWARE", "").lower() or os.environ.get("GUNICORN_CMD_ARGS") is not None

if is_gunicorn:
	# Production: Load synchronously (works with --preload)
	print("Running with Gunicorn, loading model synchronously...", file=sys.stderr)
	init_model()
else:
	# Development: Load in background for faster startup
	print("Running in development mode, loading model in background...", file=sys.stderr)
	import threading
	model_loading_thread = threading.Thread(target=init_model, daemon=True)
	model_loading_thread.start()


def preprocess_image(file_storage) -> np.ndarray:
	if PREPROCESS_FN is None:
		raise ValueError("Preprocess function not initialized. Model may not be loaded.")
	img = Image.open(file_storage.stream).convert("RGB").resize(IMAGE_SIZE)
	arr = np.array(img).astype("float32")
	# Apply backbone-specific preprocessing
	arr = PREPROCESS_FN(arr)
	arr = np.expand_dims(arr, axis=0)
	return arr


@APP.route("/", methods=["GET"])
def root():
	return jsonify({"status": "ok", "service": "food-classifier-api"})

@APP.route("/health", methods=["GET"])
def health():
	if MODEL is not None:
		model_status = "loaded"
	elif MODEL_LOADING_STARTED:
		# Check if thread exists and is alive (development mode)
		if 'model_loading_thread' in globals() and hasattr(model_loading_thread, 'is_alive'):
			if model_loading_thread.is_alive():
				model_status = "loading"
			else:
				model_status = "failed" if MODEL_LOADING_ERROR else "unknown"
		else:
			# Gunicorn mode - loading happens synchronously
			model_status = "loading" if MODEL is None else "loaded"
	elif MODEL_LOADING_ERROR:
		model_status = f"failed: {MODEL_LOADING_ERROR[:100]}"
	else:
		model_status = "not_started"
	
	return jsonify({
		"status": "ok", 
		"model_loaded": MODEL is not None,
		"model_status": model_status,
		"num_classes": len(CLASS_NAMES) if CLASS_NAMES else 0,
		"models_dir": MODELS_DIR,
		"keras_model_exists": os.path.exists(KERAS_MODEL),
		"h5_model_exists": os.path.exists(H5_MODEL),
		"class_names_exists": os.path.exists(CLASS_NAMES_PATH),
		"model_loading_started": MODEL_LOADING_STARTED,
		"is_gunicorn": is_gunicorn if 'is_gunicorn' in globals() else False
	})


@APP.route("/predict", methods=["POST"])
def predict():
	try:
		if MODEL is None:
			print("ERROR: MODEL is None", file=sys.stderr)
			return jsonify({"error": "Model not loaded"}), 500
		if PREPROCESS_FN is None:
			print("ERROR: PREPROCESS_FN is None", file=sys.stderr)
			return jsonify({"error": "Preprocess function not initialized"}), 500
		if "file" not in request.files:
			return jsonify({"error": "No file uploaded under key 'file'"}), 400
		file = request.files["file"]
		if file.filename == '':
			return jsonify({"error": "No file selected"}), 400
		
		print(f"Received prediction request for file: {file.filename}", file=sys.stderr)
		img_arr = preprocess_image(file)
		print(f"Image preprocessed, shape: {img_arr.shape}", file=sys.stderr)
		print("Starting MODEL.predict()... This may take 5-15 seconds on CPU...", file=sys.stderr)
		import time
		predict_start = time.time()
		try:
			preds = MODEL.predict(img_arr, verbose=1)
			predict_time = time.time() - predict_start
			print(f"MODEL.predict() completed in {predict_time:.2f} seconds", file=sys.stderr)
			pred = preds[0]
			print(f"Prediction completed, shape: {pred.shape}", file=sys.stderr)
		except Exception as predict_error:
			predict_time = time.time() - predict_start
			print(f"ERROR in MODEL.predict() after {predict_time:.2f} seconds: {predict_error}", file=sys.stderr)
			print(traceback.format_exc(), file=sys.stderr)
			raise

		# Ensure outputs are calibrated probabilities (apply softmax if needed)
		try:
			# If the model already has softmax, this will be a no-op (sum ~ 1.0)
			probs = pred
			total = float(np.sum(probs))
			if not np.isfinite(total) or total <= 0.0 or abs(total - 1.0) > 1e-3:
				probs = tf.nn.softmax(pred).numpy()
		except Exception as softmax_error:
			print(f"Softmax error, using numpy fallback: {softmax_error}", file=sys.stderr)
			# Fallback to numpy softmax
			exp = np.exp(pred - np.max(pred))
			probs = exp / np.sum(exp)
		
		idx = int(np.argmax(probs))
		result = {
			"class": CLASS_NAMES[idx],
			"confidence": float(probs[idx]),
			"all_confidences": {CLASS_NAMES[i]: float(probs[i]) for i in range(len(CLASS_NAMES))},
		}
		print(f"Prediction result: {result['class']} ({result['confidence']:.4f})", file=sys.stderr)
		return jsonify(result)
	except Exception as e:
		print("=" * 50, file=sys.stderr)
		print(f"ERROR in /predict endpoint: {e}", file=sys.stderr)
		print(traceback.format_exc(), file=sys.stderr)
		print("=" * 50, file=sys.stderr)
		return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


if __name__ == "__main__":
	APP.run(host="0.0.0.0", port=5000, debug=True)
