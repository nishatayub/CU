# GitHub OAuth Setup for Development & Production

## 🔧 Setup Strategy

You have two options for handling development vs production:

### Option 1: Two Separate OAuth Apps (Recommended)
- One for development (localhost)
- One for production (your domain)

### Option 2: Single OAuth App with Multiple Callback URLs
- GitHub allows multiple callback URLs in one app

## 📝 Step-by-Step Setup

### Development OAuth App

1. **Go to GitHub Developer Settings**: https://github.com/settings/developers
2. **Click "New OAuth App"**
3. **Fill in these exact values**:
   ```
   Application name: CodeUnity Development
   Homepage URL: http://localhost:5173
   Application description: CodeUnity collaborative coding platform (Development)
   Authorization callback URL: http://localhost:8080/api/github/callback
   ```
4. **Click "Register application"**
5. **Copy the credentials**:
   - Client ID (starts with "Ov23li...")
   - Generate and copy Client Secret (starts with "ghp_...")

### Production OAuth App

1. **Click "New OAuth App" again**
2. **Fill in these values** (replace `yourdomain.com` with your actual domain):
   ```
   Application name: CodeUnity Production
   Homepage URL: https://yourdomain.com
   Application description: CodeUnity collaborative coding platform (Production)
   Authorization callback URL: https://yourdomain.com/api/github/callback
   ```
3. **Click "Register application"**
4. **Copy the production credentials**

## 🔑 Environment Configuration

### Development Environment (.env)
Update `/Users/nishatayub/Desktop/CU/server/.env`:

```bash
# Development GitHub OAuth
GITHUB_CLIENT_ID=Ov23li_your_dev_client_id_here
GITHUB_CLIENT_SECRET=ghp_your_dev_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:8080/api/github/callback

# Other existing variables...
PORT=8080
MONGODB_URI=mongodb+srv://nishatayub702:nishat702@cluster0.qr0na.mongodb.net/cutrial
JWT_SECRET=cu-jwt-secret-key-change-in-production-2024
EMAIL_USER=codeunity09@gmail.com
EMAIL_PASS=ggru nofb sisv dgst
```

### Production Environment
For your production deployment, you'll set these environment variables:

```bash
# Production GitHub OAuth
GITHUB_CLIENT_ID=Ov23li_your_prod_client_id_here
GITHUB_CLIENT_SECRET=ghp_your_prod_client_secret_here
GITHUB_REDIRECT_URI=https://yourdomain.com/api/github/callback

# Production settings
NODE_ENV=production
PORT=8080
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_production_jwt_secret
```

## 🚀 Deployment Platforms

### For Vercel (Frontend)
1. Add environment variables in Vercel dashboard
2. Update build settings if needed

### For Render/Railway/Heroku (Backend)
1. Set environment variables in platform dashboard
2. Ensure GitHub OAuth production app is configured

### For Custom VPS/Server
1. Create `.env.production` file
2. Set environment variables in your process manager

## 🔄 Current Development Setup

**Right now, for development testing:**

1. **Create Development GitHub OAuth App**:
   - Application name: `CodeUnity Development`
   - Homepage URL: `http://localhost:5173`
   - Callback URL: `http://localhost:8080/api/github/callback`

2. **Update your `.env` file** with the development credentials

3. **Test the integration** in development

4. **Later, when you deploy**, create the production OAuth app

## 📋 What You Need to Do NOW

1. **Go to**: https://github.com/settings/developers
2. **Create**: Development OAuth app with localhost URLs
3. **Copy**: Client ID and Client Secret
4. **Update**: Your `.env` file with real credentials
5. **Restart**: Your server
6. **Test**: The GitHub integration

## 🎯 Example Credentials Format

Your `.env` file should look like this after setup:

```bash
# Example - replace with your actual values
GITHUB_CLIENT_ID=Ov23liABCD1234EFGH5678
GITHUB_CLIENT_SECRET=ghp_ABC123DEF456GHI789JKL012MNO345PQR678STU
GITHUB_REDIRECT_URI=http://localhost:8080/api/github/callback
```

## ⚠️ Security Notes

- Never commit `.env` files to git
- Use different secrets for production
- GitHub client secrets are shown only once - save them securely
- Consider using a secrets manager for production

## 🔍 Testing Checklist

- [ ] Create GitHub OAuth app
- [ ] Copy Client ID (starts with "Ov23li")
- [ ] Generate and copy Client Secret (starts with "ghp_")
- [ ] Update `.env` file
- [ ] Restart server
- [ ] Test GitHub save button
- [ ] Verify OAuth flow works
- [ ] Check repository creation

## 🚀 Ready for Production?

When you're ready to deploy:
1. Create production GitHub OAuth app
2. Update production environment variables
3. Test on staging environment first
4. Deploy with confidence!
