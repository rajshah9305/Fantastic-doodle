#!/bin/bash

# Deployment Verification Script
# Run this before deploying to production

set -e

echo "🔍 Starting deployment verification..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version OK: $(node -v)${NC}"
echo ""

# Check pnpm
echo "📦 Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm not found. Install with: npm install -g pnpm${NC}"
    exit 1
fi
echo -e "${GREEN}✅ pnpm found: $(pnpm -v)${NC}"
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copy from .env.example${NC}"
    exit 1
fi

if ! grep -q "GROQ_API_KEY=" .env || grep -q "GROQ_API_KEY=your_groq_api_key_here" .env; then
    echo -e "${RED}❌ GROQ_API_KEY not set in .env${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Type check
echo "🔍 Running TypeScript type check..."
if ! pnpm check; then
    echo -e "${RED}❌ TypeScript errors found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ No TypeScript errors${NC}"
echo ""

# Build
echo "🏗️  Building for production..."
if ! pnpm build; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Check build output
echo "📊 Checking build output..."
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist directory not found${NC}"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo -e "${RED}❌ dist/public directory not found${NC}"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo -e "${RED}❌ dist/index.js not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build output verified${NC}"
echo ""

# Check for common issues
echo "🔍 Checking for common issues..."

# Check for console.log in production code
if grep -r "console\.log" server/ --include="*.ts" | grep -v "console.error" | grep -v "console.warn" | grep -v "// console.log"; then
    echo -e "${YELLOW}⚠️  console.log found in server code (consider removing for production)${NC}"
fi

# Check for TODO/FIXME
if grep -r "TODO\|FIXME" server/ client/src/ --include="*.ts" --include="*.tsx" | grep -v "placeholder"; then
    echo -e "${YELLOW}⚠️  TODO/FIXME found in code${NC}"
fi

echo -e "${GREEN}✅ Common issues check complete${NC}"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All checks passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "1. Push code to GitHub"
echo "2. Import project in Vercel"
echo "3. Add environment variables in Vercel:"
echo "   - GROQ_API_KEY"
echo "   - DATABASE_URL=sqlite://db.sqlite"
echo "   - JWT_SECRET"
echo "   - NODE_ENV=production"
echo "4. Deploy!"
echo ""
echo "🚀 Ready for deployment!"
