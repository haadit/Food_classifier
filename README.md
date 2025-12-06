# Fresh vs. Stale Food Classifier

## Quickstart

1) Create venv and install requirements
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

2) Ensure dataset exists at `data/train` and `data/test` (already in your workspace).

3) Train the model
```bash
python src\train.py
```
The best model is saved to `models/food_classifier.h5` and `models/class_names.json`.

4) Run the API
```bash
python backend\app.py
```

5) Test prediction (PowerShell)
```bash
Invoke-WebRequest -Uri http://localhost:5000/health

Invoke-RestMethod -Uri http://localhost:5000/predict -Method Post -InFile .\sample.jpg -ContentType 'multipart/form-data'
```

## Notes
- Input size: 224x224, RGB, rescaled 1/255.
- Transfer learning: EfficientNetB0 then fine-tune top ~40 layers.
- Returns predicted class, confidence, and per-class confidences.
