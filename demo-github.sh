#!/bin/bash

# CodeUnity GitHub Integration Demo Script
# This script demonstrates the GitHub save functionality

echo "🚀 CodeUnity GitHub Integration Demo"
echo "======================================"
echo ""

# Check if servers are running
echo "📋 Checking server status..."

# Check if client is running on port 5173
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Client server is running on http://localhost:5173"
else
    echo "❌ Client server is not running. Please start with: cd client && npm run dev"
    exit 1
fi

# Check if backend is running on port 8080
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Backend server is running on http://localhost:8080"
else
    echo "❌ Backend server is not running. Please start with: cd server && npm start"
    exit 1
fi

echo ""
echo "🔧 Setup Instructions:"
echo "1. Create a GitHub OAuth App at: https://github.com/settings/developers"
echo "2. Set the Authorization callback URL to: http://localhost:8080/api/github/callback"
echo "3. Update your .env file with the CLIENT_ID and CLIENT_SECRET"
echo ""

echo "🎯 Testing Steps:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Create or join a room"
echo "3. Add some code files (.js, .py, .cpp, etc.)"
echo "4. Click the purple GitHub icon in the editor toolbar"
echo "5. Follow the authentication flow"
echo "6. Check your GitHub for the new 'codeunity-rooms' repository"
echo ""

echo "💡 Expected Flow:"
echo "   Anonymous → Link Account → GitHub OAuth → Save Success"
echo "   OR"
echo "   Authenticated → Direct Save → Save Success"
echo ""

echo "📊 API Endpoints Available:"
echo "   GET  /api/github/oauth-url    - Generate OAuth URL"
echo "   GET  /api/github/callback     - Handle OAuth callback"
echo "   GET  /api/github/status       - Check connection status"
echo "   POST /api/github/save-room    - Save room to GitHub"
echo ""

echo "🎉 Demo ready! Open http://localhost:5173 to test the GitHub integration."
