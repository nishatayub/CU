# GitHub Integration Setup Guide

## Overview
Your CodeUnity platform now includes GitHub integration that allows users to save their collaborative coding sessions directly to their GitHub repositories. This guide will help you set up the GitHub OAuth application and test the functionality.

## Features Implemented

### ✅ GitHub Save Button
- **Location**: Editor toolbar (purple GitHub icon)
- **Function**: Saves all room files to user's GitHub repository
- **Flow**: Check auth → Check GitHub connection → OAuth if needed → Save to repo

### ✅ Authentication Flow
1. User clicks "Save to GitHub" button
2. If not authenticated, shows account linking modal
3. If authenticated but GitHub not connected, redirects to GitHub OAuth
4. After OAuth, automatically saves room files to `codeunity-rooms` repository

### ✅ Repository Structure
```
codeunity-rooms/
├── rooms/
│   ├── room-id-1/
│   │   ├── file1.js
│   │   ├── file2.py
│   │   └── session-info.json
│   └── room-id-2/
│       ├── file1.cpp
│       └── session-info.json
└── README.md
```

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `CodeUnity`
   - **Homepage URL**: `http://localhost:5173` (for development)
   - **Application description**: `Collaborative coding platform with real-time editing`
   - **Authorization callback URL**: `http://localhost:8080/api/github/callback`

### Step 2: Update Environment Variables
After creating the OAuth app, update your `.env` file:

```bash
# In /Users/nishatayub/Desktop/CU/server/.env
GITHUB_CLIENT_ID=your_actual_client_id_here
GITHUB_CLIENT_SECRET=your_actual_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:8080/api/github/callback
```

### Step 3: Production Setup
For production deployment:
1. Update the callback URL in GitHub OAuth app to your production domain
2. Update `GITHUB_REDIRECT_URI` in production environment
3. Update `BACKEND_URL` in client config

## Testing the Integration

### Prerequisites
1. Both servers running:
   - Client: `http://localhost:5173`
   - Server: `http://localhost:8080`
2. GitHub OAuth app configured
3. Valid environment variables

### Test Scenario
1. **Open CodeUnity**: Navigate to `http://localhost:5173`
2. **Create/Join Room**: Enter a room
3. **Create Files**: Add some code files (.js, .py, .cpp, etc.)
4. **Test Save Flow**:
   - Click the purple GitHub icon in the editor toolbar
   - If prompted, link your account
   - Should redirect to GitHub OAuth
   - After authorization, return to editor
   - Files should be saved to your `codeunity-rooms` repository

### Expected Behavior
- **Button States**:
  - Default: Purple GitHub icon
  - Saving: Spinning loader
  - Success: Green checkmark (3 seconds)
  - No files: Disabled gray button
  - No auth: Shows "Sign in to save to GitHub" tooltip

## API Endpoints

### GitHub Routes
- `GET /api/github/oauth-url` - Generate OAuth URL
- `GET /api/github/callback` - Handle OAuth callback
- `GET /api/github/status` - Check connection status (JWT)
- `POST /api/github/save-room` - Save room to GitHub (JWT)
- `GET /api/github/saved-rooms/:username` - List saved rooms

### Authentication Routes
- `POST /api/auth/link-account` - Link OAuth providers
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/status/:username` - Check auth status

## Troubleshooting

### Common Issues
1. **"GitHub account not linked"**: User needs to authenticate first
2. **"Failed to connect to GitHub"**: Check OAuth app credentials
3. **"Port already in use"**: Kill existing server processes
4. **OAuth redirect fails**: Verify callback URL matches exactly

### Debug Steps
1. Check server logs for detailed error messages
2. Verify environment variables are loaded
3. Test OAuth flow manually in browser
4. Check GitHub OAuth app settings

## File Structure Created
```
server/
├── routes/github.js          # GitHub API routes
├── services/githubService.js # GitHub integration logic
├── models/user.js            # User authentication model
└── .env                      # Environment variables

client/
├── contexts/AuthContext.jsx  # Authentication context
├── components/LinkAccount.jsx # Account linking modal
└── pages/Editor.jsx          # Updated with GitHub save button
```

## Security Notes
- JWT tokens used for API authentication
- GitHub access tokens stored securely in database
- OAuth state parameter prevents CSRF attacks
- Room permissions checked before save operations

## Next Steps
1. Set up production GitHub OAuth app
2. Add error handling for API rate limits
3. Implement file conflict resolution
4. Add repository management features
5. Create user dashboard for saved rooms
