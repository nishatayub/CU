const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      username: user.username,
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// POST /api/auth/link-account - Link anonymous session to account
router.post('/link-account', async (req, res) => {
  try {
    const { username, provider, providerData } = req.body;

    if (!username || !provider || !providerData) {
      return res.status(400).json({
        success: false,
        message: 'Username, provider, and provider data are required'
      });
    }

    // Check if user already exists with this OAuth account
    const existingOAuthUser = await User.findByOAuth(provider, providerData.id);
    if (existingOAuthUser) {
      // Link existing OAuth account to current username
      if (existingOAuthUser.username !== username) {
        return res.status(409).json({
          success: false,
          message: 'This account is already linked to a different username'
        });
      }
      
      const token = generateToken(existingOAuthUser);
      return res.json({
        success: true,
        message: 'Account already linked',
        user: existingOAuthUser.getDisplayInfo(),
        token
      });
    }

    // Find existing user by username or create new one
    let user = await User.findByUsername(username);
    if (!user) {
      user = new User({ username });
      await user.save();
    }

    // Link OAuth provider
    await user.linkOAuthProvider(provider, providerData);

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Account linked successfully',
      user: user.getDisplayInfo(),
      token
    });
  } catch (error) {
    console.error('Error linking account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link account',
      error: error.message
    });
  }
});

// POST /api/auth/signin - Sign in with OAuth
router.post('/signin', async (req, res) => {
  try {
    const { provider, providerData } = req.body;

    if (!provider || !providerData) {
      return res.status(400).json({
        success: false,
        message: 'Provider and provider data are required'
      });
    }

    // Find user by OAuth provider
    const user = await User.findByOAuth(provider, providerData.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this OAuth provider'
      });
    }

    // Update last active time
    user.usage.lastActiveAt = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Signed in successfully',
      user: user.getDisplayInfo(),
      token
    });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign in',
      error: error.message
    });
  }
});

// GET /api/auth/profile - Get user profile (requires JWT)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.getDisplayInfo(),
      roomHistory: user.roomHistory.slice(0, 10) // Last 10 rooms
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
});

// POST /api/auth/signout - Sign out (optional, mainly clears client token)
router.post('/signout', (req, res) => {
  res.json({
    success: true,
    message: 'Signed out successfully'
  });
});

// GET /api/auth/status - Check if username has linked account
router.get('/status/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findByUsername(username);
    
    res.json({
      success: true,
      hasAccount: !!user,
      hasOAuth: !!(user?.oauth?.google || user?.oauth?.github || user?.oauth?.discord),
      subscription: user?.subscription?.tier || 'free'
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check auth status',
      error: error.message
    });
  }
});

module.exports = router;
