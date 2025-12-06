import os
import json
from typing import Tuple, List

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
import argparse

# Resolve project root based on this file location
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
TRAIN_DIR = os.path.join(DATA_DIR, "train")
TEST_DIR = os.path.join(DATA_DIR, "test")
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42
MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "food_classifier.keras")
CLASS_NAMES_PATH = os.path.join(PROJECT_ROOT, "models", "class_names.json")


def build_datasets() -> Tuple[tf.data.Dataset, tf.data.Dataset, List[str]]:
	if not os.path.isdir(TRAIN_DIR):
		raise FileNotFoundError(f"TRAIN_DIR not found: {TRAIN_DIR}")
	train_ds = tf.keras.preprocessing.image_dataset_from_directory(
		TRAIN_DIR,
		labels="inferred",
		label_mode="categorical",
		image_size=IMAGE_SIZE,
		batch_size=BATCH_SIZE,
		seed=SEED,
		shuffle=True,
		validation_split=0.15,
		subset="training",
	)
	val_ds = tf.keras.preprocessing.image_dataset_from_directory(
		TRAIN_DIR,
		labels="inferred",
		label_mode="categorical",
		image_size=IMAGE_SIZE,
		batch_size=BATCH_SIZE,
		seed=SEED,
		shuffle=True,
		validation_split=0.15,
		subset="validation",
	)

	class_names = train_ds.class_names

	# Prefetch
	autotune = tf.data.AUTOTUNE
	train_ds = train_ds.prefetch(buffer_size=autotune)
	val_ds = val_ds.prefetch(buffer_size=autotune)
	return train_ds, val_ds, class_names


def get_augmentation_layer() -> tf.keras.Sequential:
	return tf.keras.Sequential([
		layers.RandomFlip("horizontal"),
		layers.RandomRotation(0.1),
		layers.RandomZoom(0.1),
	], name="augmentation")


def build_model(num_classes: int) -> tf.keras.Model:
	base_model = tf.keras.applications.EfficientNetB0(
		include_top=False,
		input_shape=(*IMAGE_SIZE, 3),
		weights="imagenet",
	)
	base_model.trainable = False

	inputs = layers.Input(shape=(*IMAGE_SIZE, 3))
	x = get_augmentation_layer()(inputs)
	x = tf.keras.applications.efficientnet.preprocess_input(x)
	x = base_model(x, training=False)
	x = layers.GlobalAveragePooling2D()(x)
	x = layers.Dropout(0.4)(x)
	outputs = layers.Dense(num_classes, activation="softmax")(x)
	model = models.Model(inputs, outputs)
	model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
	return model, base_model


def train_and_finetune(dry_run: bool = False):
	os.makedirs(os.path.join(PROJECT_ROOT, "models"), exist_ok=True)
	train_ds, val_ds, class_names = build_datasets()

	# DRY RUN: only validate datasets and write class names
	if dry_run:
		print("[INFO] DRY_RUN active. Validating dataset and saving class names only.")
		with open(CLASS_NAMES_PATH, "w", encoding="utf-8") as f:
			json.dump({"class_names": class_names}, f, ensure_ascii=False, indent=2)
		print("[INFO] Classes:", class_names)
		# Peek one batch
		for images, labels in train_ds.take(1):
			print("[INFO] Batch images:", images.shape, "labels:", labels.shape)
		return

	model, base_model = build_model(num_classes=len(class_names))

	callbacks = [
		# Keep only EarlyStopping to avoid deepcopy/pickling issues on some environments
		tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=5, restore_best_weights=True),
	]

	print("[INFO] Training base model...")
	_ = model.fit(train_ds, validation_data=val_ds, epochs=15, callbacks=callbacks)

	# Fine-tune
	print("[INFO] Fine-tuning top layers...")
	base_model.trainable = True
	fine_tune_at = max(0, len(base_model.layers) - 40)
	for layer in base_model.layers[:fine_tune_at]:
		layer.trainable = False

	model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), loss="categorical_crossentropy", metrics=["accuracy"])
	_ = model.fit(train_ds, validation_data=val_ds, epochs=10, callbacks=callbacks)

	# Save final model
	model.save(MODEL_PATH)

	with open(CLASS_NAMES_PATH, "w", encoding="utf-8") as f:
		json.dump({"class_names": class_names}, f, ensure_ascii=False, indent=2)

	print("[INFO] Training complete. Model saved to:", MODEL_PATH)
	print("[INFO] Classes:", class_names)


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(description="Train food freshness classifier")
	group = parser.add_mutually_exclusive_group()
	group.add_argument("--dry-run", action="store_true", help="Validate dataset and exit")
	group.add_argument("--train", action="store_true", help="Force training (ignore DRY_RUN env)")
	return parser.parse_args()


if __name__ == "__main__":
	args = parse_args()
	# Determine dry_run: CLI overrides env; if neither provided, respect env variable
	if args.train:
		dry_run_flag = False
	elif args.dry_run:
		dry_run_flag = True
	else:
		dry_run_flag = os.environ.get("DRY_RUN", "0") == "1"
	print(f"[INFO] PROJECT_ROOT={PROJECT_ROOT}")
	print(f"[INFO] TRAIN_DIR={TRAIN_DIR}")
	print(f"[INFO] DRY_RUN={'1' if dry_run_flag else '0'} (CLI overrides env)")
	train_and_finetune(dry_run=dry_run_flag)
