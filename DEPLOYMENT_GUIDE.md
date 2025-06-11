# 🚀 Production Deployment Guide

## Current Environment Setup ✅

Your code is already configured to handle different environments:

### Client (Frontend)
```javascript
const BACKEND_URL = import.meta.env.PROD 
  ? 'https://cu-669q.onrender.com'  // Production
  : 'http://localhost:8080';        // Development
```

### Server (Backend)
```javascript
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:8080/api/github/callback';
```

## 📋 Complete Setup Steps

### 1. Development Setup (Do This NOW)

**Create Development GitHub OAuth App:**
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   ```
   Application name: CodeUnity Development
   Homepage URL: http://localhost:5173
   Authorization callback URL: http://localhost:8080/api/github/callback
   Description: CodeUnity development environment
   ```
4. Copy Client ID and Secret
5. Update your `.env` file:
   ```bash
   GITHUB_CLIENT_ID=Ov23li_your_dev_client_id
   GITHUB_CLIENT_SECRET=ghp_your_dev_client_secret
   GITHUB_REDIRECT_URI=http://localhost:8080/api/github/callback
   ```

### 2. Production Setup (Do This When Deploying)

**Create Production GitHub OAuth App:**
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App" 
3. Fill in:
   ```
   Application name: CodeUnity
   Homepage URL: https://your-frontend-domain.com
   Authorization callback URL: https://your-backend-domain.com/api/github/callback
   Description: CodeUnity collaborative coding platform
   ```

**Production Environment Variables:**
```bash
# Production GitHub OAuth
GITHUB_CLIENT_ID=Ov23li_your_prod_client_id
GITHUB_CLIENT_SECRET=ghp_your_prod_client_secret
GITHUB_REDIRECT_URI=https://your-backend-domain.com/api/github/callback

# Production settings
NODE_ENV=production
PORT=8080
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_production_jwt_secret
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_email_password
```

## 🌐 Deployment Options

### Option A: Vercel (Frontend) + Render (Backend)

**Frontend (Vercel):**
1. Connect GitHub repo to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`
4. Environment variables: (none needed for frontend)

**Backend (Render):**
1. Connect GitHub repo to Render
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Add all environment variables in Render dashboard

### Option B: Railway (Full Stack)

1. Connect GitHub repo
2. Railway auto-detects both client and server
3. Set environment variables in Railway dashboard
4. Deploy both services

### Option C: Your Current Setup (Render)

Since you already have `https://cu-669q.onrender.com`, you just need to:
1. Update production GitHub OAuth app
2. Set production environment variables in Render
3. Deploy

## 🔧 Environment Variable Setup by Platform

### Vercel (Frontend)
```bash
# Usually no backend env vars needed for frontend
# Vercel automatically sets PROD=true for production builds
```

### Render (Backend)
Go to Render dashboard → Your service → Environment:
```
GITHUB_CLIENT_ID=Ov23li_your_prod_client_id
GITHUB_CLIENT_SECRET=ghp_your_prod_client_secret
GITHUB_REDIRECT_URI=https://cu-669q.onrender.com/api/github/callback
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_production_jwt_secret
EMAIL_USER=codeunity09@gmail.com
EMAIL_PASS=ggru nofb sisv dgst
```

### Railway
Similar to Render - add in Railway dashboard.

## 🎯 Your Next Steps

### Immediate (For Testing):
1. **Create development GitHub OAuth app** with localhost URLs
2. **Update your `.env`** with development credentials  
3. **Test the integration** locally

### For Production:
1. **Choose deployment platform** (Vercel + Render recommended)
2. **Create production GitHub OAuth app** with production URLs
3. **Set production environment variables**
4. **Deploy and test**

## 📝 Quick Setup Example

**Right now, do this:**

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Name: `CodeUnity Development`
   - Homepage: `http://localhost:5173`
   - Callback: `http://localhost:8080/api/github/callback`
4. Copy the Client ID (looks like: `Ov23liABC123DEF456`)
5. Generate Client Secret (looks like: `ghp_ABC123...`)
6. Update your `.env`:
   ```bash
   GITHUB_CLIENT_ID=Ov23liABC123DEF456
   GITHUB_CLIENT_SECRET=ghp_ABC123DEF456GHI789JKL012MNO345PQR678
   ```

## ✅ Testing Checklist

- [ ] GitHub OAuth app created
- [ ] Credentials copied to `.env`
- [ ] Server restarted
- [ ] Can click GitHub save button
- [ ] OAuth redirect works
- [ ] Files save to GitHub repository

## 🚨 Important Notes

- **localhost URLs only work in development**
- **Production needs real domain URLs**
- **Never commit `.env` files to git**
- **Use different credentials for dev/prod**
- **Test in development first**

Ready to test locally? Just create the development OAuth app and update your `.env` file!
