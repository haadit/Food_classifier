# Fix Model Loading Issue

## Problem
The model is not loading, causing 500 errors on `/predict` endpoint. This is likely because:
1. Git LFS files (model.keras) are not being pulled during deployment
2. Model file path might be incorrect
3. Error messages are not visible in logs

## Solution Applied

1. **Added Git LFS pull to build command**: `git lfs pull` now runs during build
2. **Enhanced error logging**: All errors now print to stderr with full traceback
3. **Better diagnostics**: Health endpoint now shows file existence status
4. **Improved error handling**: Better error messages for missing files

## What Changed

- `backend/app.py`: Added detailed logging and file existence checks
- `render.yaml`: Added `git lfs pull` to build command
- Health endpoint now shows diagnostic information

## Verify the Fix

After deployment, check the health endpoint:
```bash
curl https://food-classifier-tdei.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_status": "loaded",
  "num_classes": 18,
  "keras_model_exists": true,
  "h5_model_exists": false,
  "class_names_exists": true
}
```

## If Model Still Doesn't Load

### Check Render Logs
Look for:
- "Loading model..."
- "Model loaded successfully!"
- Or error messages with full traceback

### Manual Git LFS Check
If Git LFS pull fails, you might need to:
1. Ensure Git LFS is installed on Render (it should be by default)
2. Check if the model file is actually tracked by LFS: `git lfs ls-files`
3. Consider uploading model to cloud storage and downloading during build

### Alternative: Download Model from External Source
If Git LFS continues to be problematic, you could:
1. Upload model to Google Drive/Dropbox
2. Download it during build with wget/curl
3. Store download URL as environment variable

## Expected Log Output

You should see in Render logs:
```
==================================================
Loading model...
==================================================
MODELS_DIR: /opt/render/project/src/models
Checking for KERAS_MODEL: /opt/render/project/src/models/food_classifier.keras - Exists: True
Files in models directory: ['food_classifier.keras', 'class_names.json']
Loading model from: /opt/render/project/src/models/food_classifier.keras
Model loaded from file successfully
Loaded 18 class names
==================================================
Model loaded successfully! Classes: 18
==================================================
```

