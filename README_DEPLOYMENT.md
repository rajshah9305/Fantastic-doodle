# No-Code AI App Builder - Deployment Guide

## Project Overview

The **No-Code AI App Builder** is a full-stack web application that leverages Groq's advanced LLM API to transform natural language descriptions into fully functional web applications. Users can describe their app idea, and the AI generates complete HTML, CSS, and JavaScript code that can be previewed, edited, downloaded, and customized in real-time.

## Key Features

### Core Functionality
- **AI-Powered App Generation**: Describe your app idea in natural language and get complete, working code in seconds
- **Live Real-Time Preview**: See your generated app running instantly with live preview
- **Code Editor**: Monaco Editor integration for viewing and editing generated code
- **AI Chat Interface**: Modify and refine your app using natural language commands
- **Code Export & Download**: Export generated apps as standalone HTML files
- **App Management**: Save, view, and manage all your generated applications

### Payment & Monetization
- **Tiered Subscription Model**: Free, Basic, Pro, and Enterprise plans
- **Stripe Integration**: Secure payment processing with webhook support
- **Subscription Management**: Users can upgrade, downgrade, or cancel subscriptions
- **Usage Tracking**: Database schema for tracking app generations and usage

### Design & UX
- **Modern Enterprise Design**: Inspired by Vercel's v0.app with professional styling
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop screens
- **Dark/Light Theme Support**: Modern color palette with OKLCH color space
- **Glassmorphism Effects**: Modern UI elements with gradient backgrounds
- **Accessibility**: Semantic HTML and keyboard navigation support

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Monaco Editor** for code editing
- **shadcn/ui** components for consistent design
- **Wouter** for client-side routing
- **Sonner** for toast notifications

### Backend
- **Express.js** for HTTP server
- **tRPC** for type-safe API procedures
- **Groq API** for LLM-powered code generation
- **Stripe API** for payment processing
- **MySQL/TiDB** for database

### Development Tools
- **Vite** for fast bundling
- **TypeScript** for type safety
- **Vitest** for unit testing
- **Drizzle ORM** for database management

## Project Structure

```
no-code-ai-app-builder/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Main landing page with app generator
│   │   │   ├── Pricing.tsx         # Pricing page with subscription plans
│   │   │   └── NotFound.tsx        # 404 page
│   │   ├── components/
│   │   │   ├── AIChatBox.tsx       # AI chat interface for modifications
│   │   │   ├── DashboardLayout.tsx # Dashboard layout wrapper
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── lib/
│   │   │   └── trpc.ts            # tRPC client configuration
│   │   ├── App.tsx                # Main app routing
│   │   ├── main.tsx               # React entry point
│   │   └── index.css              # Global styles with color tokens
│   └── index.html                 # HTML template
├── server/                          # Backend Node.js application
│   ├── routers.ts                 # Main tRPC router with app generation
│   ├── routers-payment.ts         # Payment and subscription procedures
│   ├── db.ts                      # Database query helpers
│   ├── db-payment.ts              # Payment-related database functions
│   ├── groqClient.ts              # Groq API client for code generation
│   ├── products.ts                # Stripe product configuration
│   ├── webhooks/
│   │   └── stripe.ts              # Stripe webhook handlers
│   └── _core/                     # Framework core files
│       ├── index.ts               # Server entry point
│       ├── context.ts             # tRPC context with auth
│       ├── trpc.ts                # tRPC router setup
│       ├── llm.ts                 # LLM integration helpers
│       └── env.ts                 # Environment variables
├── drizzle/
│   └── schema.ts                  # Database schema (users, generatedApps, subscriptions)
├── shared/
│   ├── const.ts                   # Shared constants
│   └── types.ts                   # Shared TypeScript types
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite bundler configuration
└── vitest.config.ts               # Vitest testing configuration
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- MySQL/TiDB database
- Groq API key
- Stripe API keys (for payment features)

### Step 1: Install Dependencies
```bash
cd no-code-ai-app-builder
pnpm install
```

### Step 2: Configure Environment Variables
Create a `.env` file with the following variables:
```
DATABASE_URL=mysql://user:password@host:port/database
GROQ_API_KEY=your_groq_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
JWT_SECRET=your_jwt_secret
VITE_APP_TITLE=No-Code AI App Builder
VITE_APP_LOGO=/logo.svg
```

### Step 3: Initialize Database
```bash
pnpm db:push
```

### Step 4: Start Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### App Generation
- **POST** `/api/trpc/apps.generate` - Generate app from prompt
- **GET** `/api/trpc/apps.list` - List user's generated apps
- **GET** `/api/trpc/apps.getById` - Get specific app details
- **POST** `/api/trpc/apps.modify` - Modify app with AI chat
- **DELETE** `/api/trpc/apps.delete` - Delete an app

### Payments
- **GET** `/api/trpc/payments.getPricingTiers` - Get available pricing plans
- **POST** `/api/trpc/payments.createCheckoutSession` - Create Stripe checkout
- **GET** `/api/trpc/payments.getSubscription` - Get user's subscription
- **POST** `/api/trpc/payments.cancelSubscription` - Cancel subscription

### Authentication
- **GET** `/api/trpc/auth.me` - Get current user
- **POST** `/api/trpc/auth.logout` - Logout user

### Webhooks
- **POST** `/api/webhooks/stripe` - Stripe event handler

## Database Schema

### Users Table
```sql
- id (INT, Primary Key)
- openId (VARCHAR, Unique)
- name (TEXT)
- email (VARCHAR)
- loginMethod (VARCHAR)
- role (ENUM: user, admin)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- lastSignedIn (TIMESTAMP)
```

### Generated Apps Table
```sql
- id (INT, Primary Key)
- userId (INT, Foreign Key)
- title (VARCHAR)
- description (TEXT)
- htmlCode (LONGTEXT)
- cssCode (LONGTEXT)
- jsCode (LONGTEXT)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Subscriptions Table
```sql
- id (INT, Primary Key)
- userId (INT, Foreign Key)
- stripeCustomerId (VARCHAR)
- stripeSubscriptionId (VARCHAR)
- tier (VARCHAR)
- status (VARCHAR)
- currentPeriodStart (TIMESTAMP)
- currentPeriodEnd (TIMESTAMP)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

## Testing

Run the test suite:
```bash
pnpm test
```

Tests include:
- Groq API integration tests
- Authentication tests
- App generation validation
- Payment flow verification

## Building for Production

### Build Frontend
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

## Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Configure database with proper backups
- [ ] Set up Stripe webhooks with production URLs
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and error tracking
- [ ] Configure CDN for static assets
- [ ] Set up database replication/failover
- [ ] Configure email notifications
- [ ] Test payment flow end-to-end
- [ ] Set up analytics tracking
- [ ] Configure rate limiting

## Performance Optimization

- **Code Splitting**: Lazy load routes and components
- **Image Optimization**: Use optimized image formats
- **Caching**: Implement browser and server caching
- **Database Indexing**: Index frequently queried columns
- **API Response Compression**: Enable gzip compression
- **CDN**: Serve static assets from CDN

## Security Best Practices

- **Environment Variables**: Never commit secrets to version control
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure CORS properly for your domain
- **Rate Limiting**: Implement rate limiting on API endpoints
- **Input Validation**: Validate all user inputs
- **SQL Injection Prevention**: Use parameterized queries (Drizzle ORM)
- **XSS Prevention**: Sanitize user-generated content
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

## Troubleshooting

### App Generation Fails
- Check Groq API key is valid
- Verify API rate limits haven't been exceeded
- Check server logs for detailed error messages

### Payment Issues
- Verify Stripe API keys are correct
- Check webhook configuration in Stripe dashboard
- Ensure database is properly configured

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database credentials
- Ensure database server is running
- Check firewall rules

## Support & Documentation

For more information:
- [Groq API Documentation](https://console.groq.com/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [tRPC Documentation](https://trpc.io)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests.

---

**Last Updated**: November 29, 2025
**Version**: 1.0.0
**Status**: Production Ready
