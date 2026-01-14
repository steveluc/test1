# GitHub Pages Deployment Guide

## ✅ What's Been Set Up

Your project is now configured for automatic deployment to GitHub Pages using the Vite build system.

### Files Created:
- `.github/workflows/deploy.yml` - GitHub Actions workflow for CI/CD
- `vite.config.ts` - Updated with `base: './'` for relative paths
- `dist/` - Production-ready build files

## 🚀 Enable GitHub Pages (One-Time Setup)

Follow these steps to enable GitHub Pages for your repository:

### Step 1: Go to Repository Settings

1. Navigate to https://github.com/steveluc/test1
2. Click on **Settings** tab (top right)
3. In the left sidebar, click **Pages** (under "Code and automation")

### Step 2: Configure Source

1. Under **"Build and deployment"**, find the **"Source"** dropdown
2. Change from "Deploy from a branch" to **"GitHub Actions"**
3. That's it! No need to click save - it auto-saves

### Step 3: Trigger Deployment

The deployment was already triggered when you pushed! You can:

1. Go to the **Actions** tab in your repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Click on it to watch the build and deployment progress
4. Once complete (green checkmark), your site will be live at:

   **https://steveluc.github.io/test1/**

## 📦 How It Works

### Automatic Deployment

Every time you push to the `main` branch:

1. **Build Step**
   - GitHub Actions runner installs Node.js 20
   - Runs `npm ci` to install dependencies
   - Runs `npm run build` to create production build
   - Uploads the `dist/` folder

2. **Deploy Step**
   - Takes the uploaded artifact
   - Deploys it to GitHub Pages
   - Updates your live site

### Build Time
- Typical build + deploy: **1-2 minutes**
- You'll get a notification when complete

## 🔄 Development Workflow

### Local Development
```bash
# Start dev server with hot reload
npm run dev

# Opens at http://localhost:5173
# Edit quilt.ts, styles.css, or index-new.html
# Changes appear instantly
```

### Deploy Changes
```bash
# Just commit and push!
git add .
git commit -m "Your changes"
git push

# GitHub Actions handles the rest automatically
```

## 🧪 Testing Before Deploy

Preview the production build locally:

```bash
# Build for production
npm run build

# Preview the build
npm run preview

# Opens at http://localhost:4173
# Test exactly what will be deployed
```

## 📁 File Structure

```
test1/
├── quilt.ts              # Your TypeScript source
├── styles.css            # Your styles
├── index-new.html        # HTML template
├── vite.config.ts        # Vite configuration
├── .github/
│   └── workflows/
│       └── deploy.yml    # Auto-deployment workflow
└── dist/                 # Built files (auto-generated)
    ├── index.html        # Entry point
    └── assets/
        ├── *.js          # Bundled JavaScript
        └── *.css         # Bundled CSS
```

## 🎯 What's Different Now

### Before (Old index.html):
- ❌ 1100+ lines in one file
- ❌ No type safety
- ❌ No build optimization
- ❌ Manual deployment

### After (Vite + TypeScript):
- ✅ Modular, organized code
- ✅ TypeScript type checking
- ✅ Optimized bundles (11.5KB gzipped)
- ✅ Automatic deployment
- ✅ Hot module replacement in dev
- ✅ Source maps for debugging

## 🐛 Troubleshooting

### Deployment Fails
- Check the Actions tab for error logs
- Ensure you selected "GitHub Actions" as source in Pages settings
- Verify `package.json` and `package-lock.json` are committed

### Site Not Loading
- Wait 1-2 minutes after deployment completes
- Check that `base: './'` is in `vite.config.ts`
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Changes Not Appearing
- Check if Actions workflow completed successfully
- Verify you pushed to the `main` branch
- GitHub Pages may cache for a few minutes

## 📝 Next Steps

1. **Enable GitHub Pages** (follow Step 1-2 above)
2. **Wait for first deployment** to complete
3. **Visit your site** at https://steveluc.github.io/test1/
4. **Start developing** with `npm run dev`

Your production site will now automatically update every time you push to main! 🎉

## 🔗 Useful Links

- Your GitHub repo: https://github.com/steveluc/test1
- GitHub Pages docs: https://docs.github.com/en/pages
- Vite docs: https://vitejs.dev/
- TypeScript docs: https://www.typescriptlang.org/
