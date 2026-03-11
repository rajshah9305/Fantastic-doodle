#!/bin/bash

# Universal NLP Interface Setup Script
# Requires Python 3.11 for optimal compatibility

set -e

echo "🚀 Setting up Universal NLP Interface..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python 3.11
if ! command -v python3.11 &> /dev/null; then
    echo -e "${RED}✗ Python 3.11 is required but not installed.${NC}"
    echo "   Install via: brew install python@3.11 (macOS) or download from python.org"
    exit 1
fi
echo -e "${GREEN}✓${NC} Python 3.11 found: $(python3.11 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠ Node.js version is less than 18. Please upgrade.${NC}"
fi
echo -e "${GREEN}✓${NC} Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed. Please install npm.${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm found: $(npm --version)"

echo ""
echo "📦 Setting up backend..."
cd backend

# Create virtual environment with Python 3.11
if [ ! -d "venv" ]; then
    echo "Creating Python 3.11 virtual environment..."
    python3.11 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt --quiet

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠  Please edit backend/.env with your configuration${NC}"
fi

echo -e "${GREEN}✓${NC} Backend setup complete!"

cd ..

echo ""
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --silent

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠  Please edit frontend/.env with your configuration${NC}"
fi

echo -e "${GREEN}✓${NC} Frontend setup complete!"

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next steps:"
echo ""
echo "1. Get a Groq API key from https://console.groq.com"
echo "2. Update configuration files:"
echo "   - backend/.env (optional, can use UI)"
echo "   - frontend/.env (set VITE_API_URL if needed)"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then visit http://localhost:5173"
echo ""
echo "💡 Run ./verify.sh to verify your setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Happy coding! 🎉"
