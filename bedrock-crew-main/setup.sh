#!/bin/bash

# Universal NLP Interface Setup Script
# Requires Python 3.11 for optimal compatibility

set -e

echo "🚀 Setting up Universal NLP Interface..."
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python 3.11
if ! command -v python3.11 &> /dev/null; then
    echo "❌ Python 3.11 is required but not installed."
    echo "   Install via: brew install python@3.11 (macOS) or download from python.org"
    exit 1
fi
echo "✅ Python 3.11 found: $(python3.11 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi
echo "✅ npm found: $(npm --version)"

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

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

echo "✅ Backend setup complete!"

cd ..

echo ""
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit frontend/.env with your configuration"
fi

echo "✅ Frontend setup complete!"

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get a Groq API key from https://console.groq.com"
echo "2. Update configuration files:"
echo "   - backend/.env"
echo "   - frontend/.env"
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
echo "Happy coding! 🎉"
