# Deployment Guide

## Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rajshah9305/Fantastic-doodle)

### Option 2: Manual Deployment via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import your GitHub repository:**
   - Click "Add New" → "Project"
   - Select "Import Git Repository"
   - Choose `rajshah9305/Fantastic-doodle`

3. **Configure Environment Variables:**
   
   Add the following environment variable in Vercel:
   
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```
   
   Get your Groq API key from: https://console.groq.com

4. **Deploy Settings (Auto-detected):**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

5. **Click "Deploy"**

### Option 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variable
vercel env add GROQ_API_KEY
```

## Important Notes

### Environment Variables

**Required:**
- `GROQ_API_KEY` - Your Groq API key (get from https://console.groq.com)

**Optional:**
- `DATABASE_URL` - SQLite database URL (defaults to `sqlite://data.db`)
- `NODE_ENV` - Environment (automatically set to `production` by Vercel)

### Automatic Deployments

Once connected to Vercel:
- ✅ Every push to `main` branch automatically deploys to production
- ✅ Pull requests create preview deployments
- ✅ No GitHub Actions configuration needed

### Vercel Configuration

The `vercel.json` file is already configured with:
- ✅ Serverless function for tRPC API (`api/trpc.js`)
- ✅ Proper routing and rewrites
- ✅ CORS headers
- ✅ Security headers
- ✅ Build optimization

## Troubleshooting

### Build Fails

1. Check that all dependencies are installed:
   ```bash
   npm install
   npm run build
   ```

2. Verify TypeScript has no errors:
   ```bash
   npm run check
   ```

### API Not Working

1. Verify `GROQ_API_KEY` is set in Vercel environment variables
2. Check Vercel function logs in the dashboard
3. Ensure the API endpoint is `/api/trpc`

### Database Issues

The app works without a database in serverless mode. Sessions are stored in browser localStorage on Vercel deployments.

## GitHub Actions

The repository includes a CI workflow (`.github/workflows/deploy.yml`) that:
- ✅ Runs type checking on every push
- ✅ Tests the build process
- ✅ Validates code quality

Vercel handles the actual deployment automatically - no GitHub Actions deployment needed!

## Support

For issues or questions:
- Check [README.md](./README.md) for general documentation
- Review [Vercel Documentation](https://vercel.com/docs)
- Check [Groq API Documentation](https://console.groq.com/docs)
