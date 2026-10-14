#!/bin/bash

# Deployment Script for ParsWebServer Linux Hosting
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Configuration
APP_NAME="radiotherapist-website"
APP_DIR="/home/$(whoami)/public_html"  # Adjust this path based on your ParsWebServer setup
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Please run this script from the project root."
    exit 1
fi

print_success "Found package.json"

# Create backup directory
mkdir -p $BACKUP_DIR
print_success "Created backup directory"

# Backup existing database (if exists)
if [ -f "data/site.db" ]; then
    cp data/site.db $BACKUP_DIR/site.db.$TIMESTAMP
    print_success "Backed up database to $BACKUP_DIR/site.db.$TIMESTAMP"
fi

# Install dependencies (production only)
print_warning "Installing dependencies..."
npm ci --omit=dev
print_success "Dependencies installed"

# Build the application
print_warning "Building application..."
npm run build
print_success "Application built successfully"

# Create logs directory
mkdir -p logs
print_success "Created logs directory"

# Create uploads directory
mkdir -p public/uploads
chmod 755 public/uploads
print_success "Created uploads directory with proper permissions"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2 globally..."
    npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 is already installed"
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "$APP_NAME"; then
    print_warning "Stopping existing PM2 process..."
    pm2 stop $APP_NAME
    pm2 delete $APP_NAME
    print_success "Stopped existing process"
fi

# Start application with PM2
print_warning "Starting application with PM2..."
pm2 start ecosystem.config.js
print_success "Application started with PM2"

# Save PM2 configuration
pm2 save
print_success "PM2 configuration saved"

# Setup PM2 to start on boot (optional)
print_warning "Setting up PM2 startup script..."
pm2 startup | tail -n 1 | bash || print_warning "Could not setup PM2 startup (you may need to run this manually)"

print_success "PM2 startup configured"

# Show PM2 status
echo ""
print_success "Deployment completed! 🎉"
echo ""
pm2 list
echo ""
print_warning "Application is running on port 3000"
print_warning "Configure your Apache/Nginx reverse proxy to forward requests to port 3000"
echo ""
print_warning "Next steps:"
echo "  1. Configure Apache/Nginx reverse proxy (see README-PARSWEBSERVER.md)"
echo "  2. Set ADMIN_PASSWORD environment variable (see .env.example)"
echo "  3. Visit your domain to verify the application is working"
echo "  4. Access admin panel at /admin/login"
echo ""
print_warning "Useful PM2 commands:"
echo "  pm2 list              - View all processes"
echo "  pm2 logs $APP_NAME    - View application logs"
echo "  pm2 restart $APP_NAME - Restart application"
echo "  pm2 stop $APP_NAME    - Stop application"
echo ""