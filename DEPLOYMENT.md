# Free Deployment Guide for Food Classifier App

This guide will help you deploy your food classifier application for free using:
- **Backend**: Render (free tier) or Railway (free tier)
- **Frontend**: Vercel (free tier) or Netlify (free tier)

## Prerequisites

1. GitHub account (free)
2. Render account (free) - https://render.com
3. Vercel account (free) - https://vercel.com
4. Your Supabase credentials (already in `creds.md`)

---

## Part 1: Deploy Backend (Flask API)

### Option A: Deploy to Render (Recommended)

1. **Prepare your backend:**
   - Make sure `backend/app.py` exists
   - Make sure `backend/requirements.txt` exists
   - Make sure `models/` folder with your model files exists

2. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Deploy on Render:**
   - Go to https://render.com and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `food-classifier-api`
     - **Environment**: `Python 3`
     - **Python Version**: `3.11.9` (IMPORTANT: TensorFlow requires Python 3.8-3.11)
     - **Build Command**: `pip install --upgrade pip && pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && gunicorn app:APP --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
     - **Root Directory**: Leave empty (or set to project root)
   - Add Environment Variables:
     - `PORT`: `10000` (Render will override this)
     - `PYTHON_VERSION`: `3.11.9` (ensures correct Python version)
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your service URL (e.g., `https://food-classifier-api.onrender.com`)
   
   **Note:** If you see Python version errors, make sure `PYTHON_VERSION=3.11.9` is set in environment variables. The `runtime.txt` file should also specify `python-3.11.9`.

### Option B: Deploy to Railway

1. **Install Railway CLI** (optional, or use web interface):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy:**
   - Go to https://railway.app and sign up/login
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Python
   - Add `Procfile` (already created in this repo)
   - Set Root Directory to project root
   - Railway will automatically deploy
   - Copy your service URL

---

## Part 2: Deploy Frontend (React/Vite)

### Option A: Deploy to Vercel (Recommended)

1. **Prepare environment variables:**
   - Create `.env.production` in `frontend/food_classifier/`:
     ```
     VITE_API_BASE_URL=https://your-backend-url.onrender.com
     VITE_SUPABASE_URL=https://fhdcostlqegpqxoyyrik.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZGNvc3RscWVncHF4b3l5cmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODgyNDQsImV4cCI6MjA3NzA2NDI0NH0.owHbmbqJr_pRMIv9GSs5JqYA6KiTKBfRS1qfRodE8gM
     ```

2. **Deploy:**
   - Go to https://vercel.com and sign up/login
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend/food_classifier`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variables:
     - `VITE_API_BASE_URL`: Your backend URL from Part 1
     - `VITE_SUPABASE_URL`: From your `creds.md`
     - `VITE_SUPABASE_ANON_KEY`: From your `creds.md`
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Your app will be live at `https://your-app.vercel.app`

### Option B: Deploy to Netlify

1. **Create `netlify.toml`** (already created in this repo)

2. **Deploy:**
   - Go to https://netlify.com and sign up/login
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure:
     - **Base directory**: `frontend/food_classifier`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/food_classifier/dist`
   - Add Environment Variables (Site settings → Environment variables):
     - `VITE_API_BASE_URL`: Your backend URL
     - `VITE_SUPABASE_URL`: From your `creds.md`
     - `VITE_SUPABASE_ANON_KEY`: From your `creds.md`
   - Click "Deploy site"
   - Your app will be live at `https://your-app.netlify.app`

---

## Part 3: Update CORS Settings

After deploying your backend, you need to allow your frontend domain:

**Current CORS setting** in `backend/app.py` allows all origins (`CORS(APP)`), which works but is less secure.

**For production (recommended):**
1. Edit `backend/app.py` line 13:
   ```python
   # Replace: CORS(APP)
   # With:
   CORS(APP, origins=[
       "https://your-app.vercel.app",
       "https://your-app.netlify.app",
       "http://localhost:5173",  # For local development
       "http://localhost:3000"   # Alternative local port
   ])
   ```
2. Replace `your-app.vercel.app` and `your-app.netlify.app` with your actual frontend URLs
3. Commit and push to trigger redeployment

**Note:** The current `CORS(APP)` setting will work for now, but it's better to restrict it to your specific domains for security.

---

## Part 4: Important Notes

### Model File Size
- Your model file (`food_classifier.keras`) might be large
- If deployment fails due to size:
  1. Use Git LFS: `git lfs track "*.keras"` and `git lfs track "*.h5"`
  2. Or upload model to cloud storage (AWS S3, Google Cloud Storage) and download on startup
  3. Or use a smaller model format

### Free Tier Limitations

**Render:**
- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

**Railway:**
- $5 free credit monthly
- Services may sleep after inactivity

**Vercel:**
- Unlimited deployments
- 100GB bandwidth/month
- No sleep/spin-down

**Netlify:**
- 100GB bandwidth/month
- 300 build minutes/month
- No sleep/spin-down

### Recommended Setup
- **Backend**: Render (for simplicity) or Railway (if you have credits)
- **Frontend**: Vercel (fastest, no spin-down)

---

## Troubleshooting

### Backend not responding
- Check Render/Railway logs
- Verify model files are included in deployment
- Check if service is sleeping (Render free tier)

### CORS errors
- Update CORS settings in `backend/app.py`
- Include your frontend URL in allowed origins

### Model not loading
- Verify model files are in `models/` directory
- Check file paths are correct
- Ensure model files are committed to Git (or use Git LFS)

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend is deployed and running
- Test backend health endpoint: `https://your-backend-url.onrender.com/health`

---

## Quick Start Commands

```bash
# Test backend locally
cd backend
python app.py

# Test frontend locally
cd frontend/food_classifier
npm install
npm run dev

# Build frontend for production
npm run build
```

---

## Next Steps

1. ✅ Deploy backend to Render/Railway
2. ✅ Deploy frontend to Vercel/Netlify
3. ✅ Update CORS settings
4. ✅ Test the deployed application
5. ✅ Share your live app URL!

Good luck with your deployment! 🚀

