# Fix Render Python Version Issue

## Problem
Render is trying to use Python 3.13.4, but TensorFlow 2.18.1 only supports Python 3.8-3.11.

## Solution

### Option 1: Set Python Version in Render Dashboard (Recommended)

1. Go to your Render service dashboard
2. Click on **Environment** tab
3. Add/Update environment variable:
   - **Key**: `PYTHON_VERSION`
   - **Value**: `3.11.9`
4. Save changes
5. Trigger a new deployment

### Option 2: Use render.yaml (If using Blueprint)

The `render.yaml` file has been updated with:
```yaml
pythonVersion: "3.11.9"
envVars:
  - key: PYTHON_VERSION
    value: "3.11.9"
```

If you're using Render Blueprint:
1. Make sure `render.yaml` is in your repo root
2. Push the changes
3. Render will automatically use the Python version specified

### Option 3: Update runtime.txt

The `runtime.txt` file specifies `python-3.11.9`. Make sure it's in your repo root.

## Verify

After deployment, check the build logs. You should see:
```
==> Installing Python version 3.11.9...
```

Instead of:
```
==> Installing Python version 3.13.4...
```

## Alternative: Update TensorFlow (Not Recommended)

If you want to use Python 3.13, you'd need to update TensorFlow to 2.20.0+, but this may break your model compatibility. Stick with Python 3.11.9 for now.

