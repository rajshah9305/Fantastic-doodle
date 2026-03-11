#!/bin/bash

# Universal NLP Interface Verification Script
# Verifies the installation and configuration

set -e

echo "🔍 Verifying Universal NLP Interface Setup..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Check Python
echo "📋 Checking Python..."
if command -v python3.11 &> /dev/null; then
    PYTHON_VERSION=$(python3.11 --version)
    echo -e "${GREEN}✓${NC} Python 3.11 found: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python 3.11 not found"
    ERRORS=$((ERRORS + 1))
fi

# Check Node.js
echo ""
echo "📋 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm found: v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check backend setup
echo ""
echo "📋 Checking Backend..."
if [ -d "backend/venv" ]; then
    echo -e "${GREEN}✓${NC} Virtual environment exists"
else
    echo -e "${YELLOW}⚠${NC} Virtual environment not found (run setup.sh)"
fi

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file exists"
else
    echo -e "${YELLOW}⚠${NC} Backend .env file not found (copy from .env.example)"
fi

# Check frontend setup
echo ""
echo "📋 Checking Frontend..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Node modules installed"
else
    echo -e "${YELLOW}⚠${NC} Node modules not installed (run npm install in frontend/)"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env file exists"
else
    echo -e "${YELLOW}⚠${NC} Frontend .env file not found (copy from .env.example)"
fi

# Check file structure
echo ""
echo "📋 Checking File Structure..."
REQUIRED_FILES=(
    "backend/app/main.py"
    "backend/app/processor.py"
    "backend/app/models.py"
    "backend/app/config.py"
    "backend/requirements.txt"
    "frontend/src/App.jsx"
    "frontend/src/main.jsx"
    "frontend/package.json"
    "frontend/index.html"
    "api/index.py"
    "requirements.txt"
    "vercel.json"
    "runtime.txt"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Test backend imports (if venv exists)
echo ""
echo "📋 Testing Backend Imports..."
if [ -d "backend/venv" ]; then
    source backend/venv/bin/activate 2>/dev/null || true
    if python3.11 -c "import fastapi, groq, pydantic" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Core backend dependencies available"
    else
        echo -e "${YELLOW}⚠${NC} Some backend dependencies missing (run pip install -r backend/requirements.txt)"
    fi
    
    if python3.11 -c "import crewai" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} crewAI available (optional)"
    else
        echo -e "${YELLOW}⚠${NC} crewAI not available (optional, for local development)"
    fi
    deactivate 2>/dev/null || true
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Verification Complete!${NC}"
    echo ""
    echo "🚀 Ready to start:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  uvicorn app.main:app --reload"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd frontend"
    echo "  npm run dev"
else
    echo -e "${RED}✗ Verification Failed with $ERRORS error(s)${NC}"
    echo ""
    echo "Please fix the errors above and run setup.sh if needed."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
