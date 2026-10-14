# Deployment Guide for ParsWebServer Linux Hosting

This guide will help you deploy your Next.js radiotherapy website on ParsWebServer's Linux hosting (میزبانی وب لینوکس ایران - 7GB).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Deployment Methods](#deployment-methods)
4. [Configuration](#configuration)
5. [Reverse Proxy Setup](#reverse-proxy-setup)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- ✅ ParsWebServer Linux hosting account (7GB plan)
- ✅ SSH access enabled on your hosting account
- ✅ Domain name pointed to your hosting server
- ✅ Node.js 18+ installed (or ability to install it)
- ✅ Git installed on the server (optional, for Git deployment)

---

## Initial Setup

### 1. Upload Your Project

**Option A: Using Git (Recommended)**
```bash
# SSH into your server
ssh username@yourserver.parswebserver.com

# Navigate to your home directory
cd ~

# Clone your repository (if using Git)
git clone https://github.com/yourusername/radiotherapist-website.git
cd radiotherapist-website
```

**Option B: Using FTP/SFTP**
- Upload all project files to `/home/username/public_html/` or your preferred directory
- Ensure hidden files (`.env`, `.gitignore`) are uploaded

### 2. Install Node.js (if not already installed)

Check if Node.js is installed:
```bash
node --version
npm --version
```

If not installed, contact ParsWebServer support or use Node Version Manager (nvm):
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 18+
nvm install 18
nvm use 18
```

---

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

Use the provided deployment script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

This script will:
- ✅ Install dependencies
- ✅ Build the application
- ✅ Create necessary directories
- ✅ Install PM2 (if needed)
- ✅ Start the application
- ✅ Configure auto-restart

### Method 2: Manual Deployment

If you prefer manual control:

```bash
# 1. Install dependencies
npm install

# 2. Build the application
npm run build

# 3. Create required directories
mkdir -p logs public/uploads

# 4. Set proper permissions
chmod 755 public/uploads

# 5. Install PM2 globally
npm install -g pm2

# 6. Start the application
pm2 start ecosystem.config.js

# 7. Save PM2 configuration
pm2 save

# 8. Setup PM2 startup
pm2 startup
```

---

## Configuration

### 1. Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env

# Edit the file
nano .env
```

**Required configuration:**
```env
# Admin password - CHANGE THIS!
ADMIN_PASSWORD=your_secure_password_here

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Node environment
NODE_ENV=production
```

**Important:** 
- ⚠️ Change `ADMIN_PASSWORD` to a strong, unique password
- ⚠️ Use your actual domain name in `NEXT_PUBLIC_APP_URL`

### 2. PM2 Configuration

The `ecosystem.config.js` file is already configured. To customize:

```javascript
// Edit ecosystem.config.js if needed
module.exports = {
  apps: [{
    name: "radiotherapist-website",
    script: "npm",
    args: "start",
    instances: 1,  // Increase for more CPU cores
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    }
  }]
}
```

---

## Reverse Proxy Setup

Your Next.js app runs on port 3000, but you need to configure Apache or Nginx to forward requests.

### Option A: Apache (.htaccess)

Create or edit `.htaccess` in your `public_html` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Redirect all requests to Next.js server on port 3000
  RewriteCond %{REQUEST_URI} !^/\.next
  RewriteCond %{REQUEST_URI} !^/uploads
  RewriteCond %{REQUEST_URI} !^/images
  RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>

# Enable proxy modules (may need to contact ParsWebServer support)
# ProxyPass / http://localhost:3000/
# ProxyPassReverse / http://localhost:3000/
```

**Note:** You may need to contact ParsWebServer support to enable `mod_proxy` and `mod_proxy_http`.

### Option B: Nginx

If using Nginx, create a configuration file:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Serve static files directly
    location /_next/static/ {
        alias /path/to/your/project/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias /path/to/your/project/public/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

---

## Post-Deployment

### 1. Verify the Application

```bash
# Check PM2 status
pm2 list

# View logs
pm2 logs radiotherapist-website

# Check if app is running
curl http://localhost:3000
```

### 2. Access Your Application

- 🌐 **Website:** https://yourdomain.com
- 🔐 **Admin Panel:** https://yourdomain.com/admin/login
- 📧 **Default Password:** (the one you set in `.env`)

### 3. Test Features

- [ ] Homepage loads correctly
- [ ] Booking form works
- [ ] Contact form works
- [ ] Forum is accessible
- [ ] Blog pages load
- [ ] Admin login works
- [ ] File uploads work (test in blog admin)

---

## Useful Commands

### PM2 Commands
```bash
# View all processes
pm2 list

# View logs
pm2 logs radiotherapist-website

# Restart application
pm2 restart radiotherapist-website

# Stop application
pm2 stop radiotherapist-website

# Start application
pm2 start radiotherapist-website

# Delete process
pm2 delete radiotherapist-website

# Monitor resources
pm2 monit
```

### Application Management
```bash
# Rebuild after changes
npm run build
pm2 restart radiotherapist-website

# Update dependencies
npm install
pm2 restart radiotherapist-website

# Backup database
cp data/site.db backups/site.db.backup
```

---

## Troubleshooting

### Issue: App won't start

**Solution:**
```bash
# Check logs for errors
pm2 logs radiotherapist-website

# Common issues:
# 1. Port 3000 already in use
lsof -i :3000
# Kill process using port 3000
kill -9 <PID>

# 2. Missing dependencies
npm install

# 3. Build errors
npm run build
```

### Issue: 502 Bad Gateway

**Solution:**
- Ensure Next.js is running: `pm2 list`
- Check if port 3000 is correct
- Verify reverse proxy configuration
- Check firewall settings

### Issue: File uploads not working

**Solution:**
```bash
# Check uploads directory permissions
ls -la public/uploads

# Fix permissions
chmod 755 public/uploads
chown -R www-data:www-data public/uploads  # Or your web server user
```

### Issue: Database errors

**Solution:**
```bash
# Check database file exists
ls -la data/site.db

# Fix permissions
chmod 644 data/site.db
chmod 755 data/

# Restore from backup if needed
cp backups/site.db.YYYYMMDD_HHMMSS data/site.db
pm2 restart radiotherapist-website
```

### Issue: Out of memory

**Solution:**
```bash
# Increase memory limit in ecosystem.config.js
# Change: max_memory_restart: "1G"
# To: max_memory_restart: "2G"

# Or reduce Next.js memory usage
# Add to next.config.ts:
# experimental: { memoryBasedWorkers: true }
```

---

## Security Recommendations

1. **Change Admin Password**
   - Use a strong, unique password
   - Never use the default "admin123"

2. **Enable HTTPS**
   - Use Let's Encrypt SSL certificate
   - Contact ParsWebServer for SSL setup

3. **Firewall Configuration**
   - Only expose ports 80 and 443
   - Keep port 3000 internal only

4. **Regular Backups**
   ```bash
   # Backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d)
   tar -czf backup-$DATE.tar.gz data/site.db public/uploads
   ```

5. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

---

## Performance Optimization

### 1. Enable Next.js Image Optimization

Already configured in your app. Ensure you have:
```javascript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-domain.com',
    },
  ],
}
```

### 2. Database Optimization

```bash
# Vacuum database periodically
sqlite3 data/site.db "VACUUM;"
```

### 3. PM2 Clustering (for multiple CPU cores)

Edit `ecosystem.config.js`:
```javascript
instances: 'max',  // Use all available CPU cores
exec_mode: 'cluster'
```

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs radiotherapist-website`
2. Review this guide's troubleshooting section
3. Contact ParsWebServer support for server-level issues
4. Check Next.js documentation: https://nextjs.org/docs

---

## Quick Reference

| Task | Command |
|------|---------|
| Start app | `pm2 start ecosystem.config.js` |
| Stop app | `pm2 stop radiotherapist-website` |
| Restart app | `pm2 restart radiotherapist-website` |
| View logs | `pm2 logs radiotherapist-website` |
| Rebuild | `npm run build && pm2 restart radiotherapist-website` |
| Backup DB | `cp data/site.db backups/site.db.$(date +%Y%m%d)` |

---

**Deployment completed!** 🎉

Your radiotherapy website is now live on ParsWebServer Linux hosting.