# Quick Deployment Checklist

Follow these steps in order:

## ✅ Step 1: Prepare Repository
- [ ] Push your code to GitHub
- [ ] Ensure `models/` folder is committed (or use Git LFS for large files)

## ✅ Step 2: Deploy Backend (Choose one)

### Render (Easiest)
1. Go to https://render.com → Sign up/Login
2. New + → Web Service → Connect GitHub repo
3. Settings:
   - Name: `food-classifier-api`
   - Build: `pip install -r backend/requirements.txt && pip install gunicorn`
   - Start: `cd backend && gunicorn app:APP --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
4. Add env var: `PORT=10000`
5. Deploy → Copy URL (e.g., `https://food-classifier-api.onrender.com`)

### Railway
1. Go to https://railway.app → Sign up/Login
2. New Project → Deploy from GitHub
3. Select repo → Auto-deploys
4. Copy URL

## ✅ Step 3: Deploy Frontend (Choose one)

### Vercel (Recommended)
1. Go to https://vercel.com → Sign up/Login
2. Add New → Project → Import GitHub repo
3. Settings:
   - Framework: Vite
   - Root Directory: `frontend/food_classifier`
   - Build: `npm run build`
   - Output: `dist`
4. Environment Variables:
   - `VITE_API_BASE_URL` = Your backend URL from Step 2
   - `VITE_SUPABASE_URL` = `https://fhdcostlqegpqxoyyrik.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (from creds.md)
5. Deploy → Copy URL

### Netlify
1. Go to https://netlify.com → Sign up/Login
2. Add new site → Import project → GitHub
3. Settings:
   - Base: `frontend/food_classifier`
   - Build: `npm run build`
   - Publish: `frontend/food_classifier/dist`
4. Add same environment variables as Vercel
5. Deploy → Copy URL

## ✅ Step 4: Update CORS
- [ ] Update `backend/app.py` line 13 with your frontend URL
- [ ] Commit and push (triggers auto-redeploy)

## ✅ Step 5: Test
- [ ] Visit your frontend URL
- [ ] Test image upload
- [ ] Check backend health: `https://your-backend-url/health`

## 🎉 Done!
Your app is live!

**Backend URL:** `https://your-backend-url.onrender.com`  
**Frontend URL:** `https://your-app.vercel.app`

---

## Common Issues

**Backend spins down (Render free tier):**
- First request after 15min inactivity takes ~30s
- Consider upgrading or using Railway

**CORS errors:**
- Update CORS in `backend/app.py` with your frontend URL
- Redeploy backend

**Model not found:**
- Ensure `models/` folder is in repo
- Check file paths in `backend/app.py`

