# Fix Git Push Issue - Large Model Files

Your push is failing because the model file (`food_classifier.keras`) is ~32MB, which is causing SSL/network issues.

## Solution 1: Use Git LFS (Recommended for Large Files)

Git LFS (Large File Storage) handles large files better:

```bash
# Install Git LFS (if not installed)
# Download from: https://git-lfs.github.com/

# Initialize Git LFS in your repo
git lfs install

# Track large model files
git lfs track "*.keras"
git lfs track "*.h5"

# Add the .gitattributes file
git add .gitattributes

# Remove the model from Git cache and re-add with LFS
git rm --cached models/food_classifier.keras
git add models/food_classifier.keras

# Commit the changes
git commit -m "Use Git LFS for model files"

# Try pushing again
git push -u origin main
```

## Solution 2: Increase Buffer and Retry (Quick Fix)

I've already increased your Git buffer. Try pushing again:

```bash
git push -u origin main
```

If it still fails, try:
```bash
# Push with compression disabled
git config http.postBuffer 524288000
git config http.version HTTP/1.1
git push -u origin main
```

## Solution 3: Exclude Model from Git (For Deployment)

If you want to exclude the model from Git entirely and handle it differently:

```bash
# Remove model from Git tracking
git rm --cached models/food_classifier.keras

# Add to .gitignore (already done)
# models/*.keras

# Commit
git commit -m "Remove large model file from Git"

# Push
git push -u origin main
```

Then for deployment, you'll need to:
- Upload model to cloud storage (Google Drive, Dropbox, etc.)
- Download it during deployment
- Or include it manually in your deployment platform

## Recommended: Use Git LFS

Git LFS is the best solution because:
- ✅ Handles large files efficiently
- ✅ Works with GitHub, Render, Railway, etc.
- ✅ Keeps your model in version control
- ✅ Free for public repos

Try Solution 1 first!

