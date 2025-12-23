# Windows PowerShell Deployment Script
# For School Management System

Write-Host "`n🚀 Starting School Management System Deployment..." -ForegroundColor Cyan
Write-Host "==================================================`n" -ForegroundColor Cyan

# Step 1: Check Node.js
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "`nStep 2: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Check environment file
Write-Host "`nStep 3: Checking environment variables..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "⚠️  Please update .env file with your credentials" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ .env.example not found" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Environment file exists" -ForegroundColor Green

# Step 4: Build for production
Write-Host "`nStep 4: Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 5: Verify build
Write-Host "`nStep 5: Verifying build output..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "✅ dist/ folder created" -ForegroundColor Green
    $size = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Build size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ dist/ folder not found" -ForegroundColor Red
    exit 1
}

# Step 6: Deployment options
Write-Host "`nStep 6: Deployment options" -ForegroundColor Yellow
Write-Host "Choose deployment platform:"
Write-Host "  1) Vercel (recommended)"
Write-Host "  2) Netlify"
Write-Host "  3) Skip deployment (manual)"
$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
        npx vercel --prod
    }
    "2" {
        Write-Host "Deploying to Netlify..." -ForegroundColor Cyan
        npx netlify deploy --prod --dir=dist
    }
    "3" {
        Write-Host "Skipping deployment. Run manually:" -ForegroundColor Yellow
        Write-Host "  Vercel: npx vercel --prod"
        Write-Host "  Netlify: npx netlify deploy --prod --dir=dist"
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "✅ Deployment process complete!" -ForegroundColor Green
Write-Host "==================================================`n" -ForegroundColor Green
