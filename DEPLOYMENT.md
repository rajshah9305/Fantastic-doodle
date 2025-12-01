# Deployment Guide

## Vercel Deployment Configuration

This project is configured to deploy on Vercel with serverless functions.

### Required Environment Variables

Set these in your Vercel project settings:

```bash
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=production
JWT_SECRET=your_secure_random_string
```

### API Endpoints

The tRPC API is available at `/api/trpc` and is handled by the serverless function at `api/trpc/[trpc].ts`.

### Database Configuration (Optional)

The application works without a database in production, but for persistence, you can add:

#### Option 1: Vercel Postgres
1. Go to Vercel Dashboard → Storage → Create Database → Postgres
2. Connect to your project
3. The `POSTGRES_URL` environment variable will be auto-configured

#### Option 2: Turso (SQLite in Cloud)
1. Sign up at https://turso.tech
2. Create a database
3. Add environment variables:
```bash
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=your_auth_token
```

### Deployment Steps

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables (see above)
4. Deploy!

The application will automatically build and deploy. The API endpoints will be available at `/api/trpc`.

### Testing Deployment

After deployment:
1. Visit your deployed URL
2. Enter a prompt like "A simple calculator"
3. Click "Initialize"
4. You should see the app being generated

### Troubleshooting

- **404 on API calls**: Check that environment variables are set
- **500 errors**: Check Vercel logs with `vercel logs <deployment-url>`
- **GROQ_API_KEY errors**: Verify your API key is valid and has credits

### Local Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`
