# Model Loading Optimization

## Problem
Model loading is taking too long or hanging. With 2 workers, each worker tries to load the model independently, which:
- Doubles memory usage (32MB × 2 = 64MB+)
- Takes longer to start
- Can cause memory issues on free tier

## Solution Applied

1. **Reduced workers to 1**: Only one worker loads the model
2. **Added --preload flag**: Model loads once before workers start
3. **Increased timeout to 300s**: Gives more time for model loading
4. **Added compile=False**: Faster loading (we don't need optimizer state)
5. **Better timing logs**: See exactly how long loading takes

## Changes Made

- `render.yaml`: `--workers 1 --timeout 300 --preload`
- `Procfile`: Same changes
- `backend/app.py`: Added `compile=False` and timing logs

## Benefits

- ✅ Faster startup (model loads once, not per worker)
- ✅ Lower memory usage (one model instance)
- ✅ More reliable on free tier
- ✅ Better logging to diagnose issues

## Expected Behavior

With `--preload`:
1. Gunicorn loads the app (including model) once
2. Then forks workers (model already in memory)
3. Much faster and more memory efficient

## Monitor

Watch logs for:
```
Model loaded from file successfully in XX.XX seconds
```

If it takes > 2 minutes, there might be an issue with the model file or memory.

