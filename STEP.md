\\# Fresh vs. Stale Food Classifier (AI/ML Project)

This project builds an AI model to classify food images as **fresh** or **stale** across multiple food categories (apples, bananas, cucumber, tomato, potato, oranges, okra, capsicum, bitter gourd, etc.) using the "Fresh and Stale Classification" dataset from Kaggle.

The workflow:
- **Model Training**: Train locally with TensorFlow/Keras for maximum accuracy using transfer learning and fine-tuning.
- **Backend**: Flask API loads the trained model and provides prediction endpoint.
- **Frontend**: React UI allows image upload, sends request to backend, and displays a detailed result with a clean interface.

---

## 1. Project Setup

- **Dataset**:
  - Source: "Fresh and Stale Classification" ([Kaggle link](https://www.kaggle.com/datasets/swoyam2609/fresh-and-stale-classification?utm_source=chatgpt.com)).
  - Directory structure:
    ```
    data/
    ├── train/
    │   ├── freshapples
    │   ├── freshbanana
    │   ├── freshbittergroud
    │   ├── freshcapsicum
    │   ├── freshcucumber
    │   ├── freshokra
    │   ├── freshoranges
    │   ├── freshpotato
    │   ├── freshtomato
    │   ├── rottenapples
    │   ├── rottenbanana
    │   ├── rottenbittergroud
    │   └── ...
    ├── test/
        ├── freshapples
        ├── freshbanana
        ├── freshcucumber
        ├── freshokra
        ├── freshoranges
        ├── freshpotato
        ├── freshtamto
        ├── rottenapples
        ├── rottenbanana
        ├── rottencucumber
        ├── rottenokra
        ├── rottenoranges
        ├── rottenpotato
        └── rottentamto
    ```

- **Project structure**:
  ```
  project-root/
  ├── data/
  │   ├── train/
  │   └── test/
  ├── src/           # model training scripts
  ├── models/        # saved trained models (.h5/.pb)
  ├── backend/       # Flask API
  ├── frontend/      # React UI
  ├── outputs/
  ├── STEP.md
  ├── requirements.txt
  └── README.md
  ```

- **Environment**:
  - Python 3.8+
  - Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # or venv\Scripts\activate on Windows
    ```

- **Install dependencies**:
  ```bash
  pip install numpy pandas matplotlib seaborn scikit-learn tensorflow keras opencv-python flask flask-cors
  ```

- **Frontend setup**:
  ```bash
  cd frontend
  npx create-react-app food-classifier-ui
  cd food-classifier-ui
  npm install axios recharts
  ```

---

## 2. Data Preprocessing

- Resize images to **224×224 pixels**.
- Normalize pixel values (`rescale=1./255`).
- Apply **data augmentation**: rotation, flips, zoom, brightness.
- Balance the dataset across fresh/rotten categories.

---

## 3. Model Training (High Accuracy)

- Use **transfer learning** with **fine-tuning**:
  - Base model: `EfficientNetB0` or `ResNet50` with ImageNet weights.
  - Unfreeze top layers for fine-tuning after initial training.

- Example pipeline:
  ```python
  base_model = tf.keras.applications.EfficientNetB0(
      include_top=False,
      input_shape=(224,224,3),
      weights='imagenet'
  )
  base_model.trainable = False

  model = tf.keras.Sequential([
      base_model,
      tf.keras.layers.GlobalAveragePooling2D(),
      tf.keras.layers.Dense(512, activation='relu'),
      tf.keras.layers.Dropout(0.5),
      tf.keras.layers.Dense(num_classes, activation='softmax')
  ])

  model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
  ```

- **Training**:
  ```python
  history = model.fit(train_ds, validation_data=val_ds, epochs=20)

  # Fine-tune by unfreezing some layers
  base_model.trainable = True
  model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), loss='categorical_crossentropy', metrics=['accuracy'])
  history_ft = model.fit(train_ds, validation_data=val_ds, epochs=10)
  ```

- Save the model:
  ```python
  model.save("models/food_classifier.h5")
  ```

---

## 4. Backend (Flask API)

- Loads trained model at startup.
- Provides `/predict` endpoint for image upload.
- Returns:
  - Predicted class (e.g., "freshbanana").
  - Confidence scores for each class.

**Sample Flask route:**
```python
@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']
    img = Image.open(file).resize((224,224))
    img_array = np.expand_dims(np.array(img)/255.0, axis=0)
    predictions = model.predict(img_array)
    result = {
        "class": class_names[np.argmax(predictions)],
        "confidence": float(np.max(predictions)),
        "all_confidences": predictions.tolist()
    }
    return jsonify(result)
```

---

## 5. Frontend (React UI)

- Upload image via file input.
- Send image to Flask API using `axios`.
- Display results in a **detailed card UI**:
  - Predicted label (e.g., "Fresh Tomato").
  - Confidence percentage.
  - Bar chart showing probabilities for all classes (`recharts` recommended).

---

## 6. Results & Visualization

- Track training/validation accuracy & loss.
- Show confusion matrix.
- In UI, show confidence distribution to help user understand results.

---

## 7. Next Steps & Improvements

- Add more fruits/vegetables.
- Detect spoiled **regions** with object detection.
- Deploy backend + frontend with Docker or cloud service.

---

Happy coding! 🚀
