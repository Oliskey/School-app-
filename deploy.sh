#!/bin/bash

# Automated Deployment Script for School Management System
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting School Management System Deployment..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found${NC}"

# Step 2: Install dependencies
echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Check environment variables
echo -e "\n${YELLOW}Step 3: Checking environment variables...${NC}"

if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please update .env file with your credentials${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Check for required env vars
required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env; then
        echo -e "${RED}❌ Missing environment variable: $var${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ Environment variables configured${NC}"

# Step 4: Run production build
echo -e "\n${YELLOW}Step 4: Building for production...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Step 5: Check build output
echo -e "\n${YELLOW}Step 5: Verifying build output...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist/ folder created${NC}"
    echo "Build size: $(du -sh dist | cut -f1)"
else
    echo -e "${RED}❌ dist/ folder not found${NC}"
    exit 1
fi

# Step 6: Deploy (choose your platform)
echo -e "\n${YELLOW}Step 6: Deployment options${NC}"
echo "Choose deployment platform:"
echo "  1) Vercel (recommended)"
echo "  2) Netlify"
echo "  3) Skip deployment (manual)"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "Installing Vercel CLI..."
            npm install -g vercel
            vercel --prod
        fi
        ;;
    2)
        echo "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir=dist
        else
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
            netlify deploy --prod --dir=dist
        fi
        ;;
    3)
        echo -e "${YELLOW}Skipping deployment. Run manually:${NC}"
        echo "  Vercel: npx vercel --prod"
        echo "  Netlify: npx netlify deploy --prod --dir=dist"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}=================================================="
echo -e "✅ Deployment process complete!${NC}"
echo -e "=================================================="
