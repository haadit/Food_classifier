# Fix Render Port Detection Issue

## Problem
Render can't detect an open port even though Gunicorn is running. This happens because:
1. Model loading takes time (30+ seconds)
2. Render times out before the app is ready
3. Health check doesn't respond quickly enough

## Solution Applied

1. **Non-blocking model loading**: Model now loads in a background thread so the app starts immediately
2. **Root route added**: `/` endpoint responds immediately for health checks
3. **Extended health check grace period**: Render will wait up to 5 minutes for the app to be ready

## What Changed

- `backend/app.py`: Model loads in background thread
- `render.yaml`: Added health check grace period
- Added root `/` route for quick health checks

## If Still Not Working

### Option 1: Check Render Environment Variables
Make sure `PORT` is set (Render sets this automatically, but verify in dashboard)

### Option 2: Manual Port Check
1. Go to Render dashboard → Your service → Logs
2. Look for: `Listening at: http://0.0.0.0:XXXX`
3. Verify the port number

### Option 3: Increase Timeout
In Render dashboard:
- Settings → Health Check Path: `/`
- Health Check Grace Period: `300` (5 minutes)

### Option 4: Check Model File
If model file is missing or corrupted:
- Verify `models/food_classifier.keras` exists in repo
- Check Git LFS is working: `git lfs ls-files`

## Test Your Deployment

Once deployed, test:
```bash
# Health check
curl https://your-app.onrender.com/

# Full health
curl https://your-app.onrender.com/health

# Should return:
# {"status":"ok","model_loaded":true,"num_classes":16}
```

