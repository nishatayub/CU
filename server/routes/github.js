const express = require('express');
const { Octokit } = require('@octokit/rest');
const User = require('../models/user');
const GitHubService = require('../services/githubService');
const router = express.Router();

// GitHub OAuth App credentials (add these to your .env file)
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'your_github_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:8080/api/github/callback';

// GET /api/github/oauth-url - Get GitHub OAuth URL for authentication
router.get('/oauth-url', (req, res) => {
  const { username, roomId } = req.query;
  
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Username is required'
    });
  }

  // GitHub OAuth URL with required scopes
  const scope = 'repo user:email';
  const state = JSON.stringify({ username, roomId: roomId || null });
  
  const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

  res.json({
    success: true,
    oauthUrl: githubOAuthUrl,
    message: 'Redirect user to this URL for GitHub authentication'
  });
});

// GET /api/github/callback - Handle GitHub OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    console.log('🔥 GitHub OAuth callback received:', { code: !!code, state });
    
    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }

    // Parse state to get username and roomId
    let username = null;
    let roomId = null;
    try {
      const stateData = JSON.parse(state);
      username = stateData.username;
      roomId = stateData.roomId;
      console.log('📋 Parsed state:', { username, roomId });
      
      // Add validation for username
      if (!username || username === 'undefined' || username === 'null') {
        console.log('⚠️ Warning: No valid username found in state, using fallback');
        username = 'github-user-' + Date.now(); // Create a fallback username
      }
      
    } catch (error) {
      console.error('Error parsing state:', error);
      console.log('⚠️ State parsing failed, using fallback username');
      username = 'github-user-' + Date.now();
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData);
      return res.status(400).send(`GitHub OAuth error: ${tokenData.error_description}`);
    }

    const accessToken = tokenData.access_token;

    // Get GitHub user info
    const githubService = new GitHubService(accessToken);
    const userInfo = await githubService.getUserInfo();
    
    if (!userInfo.success) {
      return res.status(500).send('Failed to get GitHub user info');
    }

    // Update or create user with GitHub info
    console.log('🔍 Looking for user with username:', username);
    let user = await User.findByUsername(username);
    if (!user) {
      console.log('👤 Creating new user with username:', username);
      user = new User({ username });
    } else {
      console.log('👤 Found existing user:', user.username);
    }

    // Link GitHub OAuth
    console.log('🔗 Linking GitHub OAuth for user:', username);
    await user.linkOAuthProvider('github', {
      ...userInfo.user,
      accessToken: accessToken // Store access token for API calls
    });

    console.log('✅ GitHub OAuth linked successfully for user:', username);
    console.log('👤 User info:', { username: user.username, hasGithub: !!user.oauth?.github?.accessToken });

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Redirect back to the editor with success
    const redirectUrl = roomId 
      ? `${process.env.CLIENT_URL || 'http://localhost:5173'}/editor/${roomId}?github_linked=true&token=${token}`
      : `${process.env.CLIENT_URL || 'http://localhost:5173'}?github_linked=true&token=${token}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
});

// POST /api/github/save-room - Save current room to GitHub
router.post('/save-room', async (req, res) => {
  try {
    const { roomId, files, roomName, metadata } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    if (!roomId || !files) {
      return res.status(400).json({
        success: false,
        message: 'RoomId and files are required'
      });
    }

    // Verify JWT token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Get user with GitHub access token
    const user = await User.findByUsername(decoded.username);
    if (!user || !user.oauth?.github?.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'GitHub account not linked. Please connect your GitHub account first.',
        requiresAuth: true
      });
    }

    // Use GitHub service to save room
    const githubService = new GitHubService(user.oauth.github.accessToken);
    const result = await githubService.saveRoomToGitHub(roomId, files, roomName, metadata);

    if (result.success) {
      // Update user's room history
      await user.addRoomToHistory(roomId, roomName || `Room ${roomId}`, 'creator');
      
      res.json({
        success: true,
        message: `Successfully saved ${result.savedFiles} files to GitHub!`,
        repositoryUrl: result.repositoryUrl,
        folderUrl: result.folderUrl,
        savedFiles: result.savedFiles
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to save to GitHub'
      });
    }
  } catch (error) {
    console.error('Error saving room to GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save room to GitHub',
      error: error.message
    });
  }
});

// GET /api/github/saved-rooms/:username - Get user's saved rooms from GitHub
router.get('/saved-rooms/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Get user with GitHub access token
    const user = await User.findByUsername(username);
    if (!user || !user.oauth?.github?.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'GitHub account not linked',
        requiresAuth: true
      });
    }

    // Use GitHub service to get saved rooms
    const githubService = new GitHubService(user.oauth.github.accessToken);
    const result = await githubService.getSavedRooms();

    if (result.success) {
      res.json({
        success: true,
        rooms: result.rooms,
        repositoryUrl: `https://github.com/${user.oauth.github.username}/codeunity-rooms`
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to get saved rooms'
      });
    }
  } catch (error) {
    console.error('Error getting saved rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved rooms',
      error: error.message
    });
  }
});

// GET /api/github/status - Check if user has GitHub connected (JWT auth)
router.get('/status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify JWT token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find user and check GitHub connection
    const user = await User.findByUsername(decoded.username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isConnected = !!(user?.oauth?.github?.accessToken);
    
    res.json({
      success: true,
      connected: isConnected,
      githubUsername: user?.oauth?.github?.username || null,
      repositoryUrl: isConnected ? `https://github.com/${user.oauth.github.username}/codeunity-rooms` : null
    });
  } catch (error) {
    console.error('Error checking GitHub status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check GitHub status',
      error: error.message
    });
  }
});

// GET /api/github/status/:username - Check GitHub status by username (for backward compatibility)
router.get('/status/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findByUsername(username);
    const isConnected = !!(user?.oauth?.github?.accessToken);
    
    res.json({
      success: true,
      connected: isConnected,
      githubUsername: user?.oauth?.github?.username || null,
      repositoryUrl: isConnected ? `https://github.com/${user.oauth.github.username}/codeunity-rooms` : null
    });
  } catch (error) {
    console.error('Error checking GitHub status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check GitHub status',
      error: error.message
    });
  }
});

module.exports = router;
