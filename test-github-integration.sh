#!/bin/bash

# 🎉 GitHub Integration Test Script
echo "🚀 Testing CodeUnity GitHub Integration"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_endpoint() {
    local url=$1
    local description=$2
    echo -n "Testing $description... "
    
    if curl -s "$url" > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

test_json_endpoint() {
    local url=$1
    local description=$2
    echo -n "Testing $description... "
    
    response=$(curl -s "$url")
    if echo "$response" | python3 -m json.tool > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "Response: $response"
        return 1
    fi
}

echo "🔍 STEP 1: Server Health Check"
echo "------------------------------"
test_endpoint "http://localhost:5173" "Client Server (Vite)"
test_endpoint "http://localhost:8080" "Backend Server (Express)"
echo ""

echo "🔧 STEP 2: GitHub API Endpoints"
echo "--------------------------------"
test_json_endpoint "http://localhost:8080/api/github/oauth-url?username=testuser&roomId=test123" "GitHub OAuth URL Generation"

echo ""
echo "🎯 STEP 3: Environment Variables Check"
echo "---------------------------------------"

# Check if environment variables are set
if [ ! -z "$GITHUB_CLIENT_ID" ] || grep -q "GITHUB_CLIENT_ID" /Users/nishatayub/Desktop/CU/server/.env; then
    echo -e "${GREEN}✅ GitHub Client ID configured${NC}"
else
    echo -e "${RED}❌ GitHub Client ID missing${NC}"
fi

if [ ! -z "$GITHUB_CLIENT_SECRET" ] || grep -q "GITHUB_CLIENT_SECRET" /Users/nishatayub/Desktop/CU/server/.env; then
    echo -e "${GREEN}✅ GitHub Client Secret configured${NC}"
else
    echo -e "${RED}❌ GitHub Client Secret missing${NC}"
fi

echo ""
echo "📊 STEP 4: Credential Analysis"
echo "-------------------------------"

# Read and display credential info (without exposing secrets)
dev_client_id=$(grep "GITHUB_CLIENT_ID" /Users/nishatayub/Desktop/CU/server/.env | cut -d'=' -f2 | tr -d ' ')
prod_client_id=$(grep "GITHUB_CLIENT_ID" /Users/nishatayub/Desktop/CU/server/.env.production | cut -d'=' -f2 | tr -d ' ')

echo "Development Environment:"
echo "  • Client ID: ${dev_client_id:0:10}... (${#dev_client_id} chars)"
echo "  • Redirect URI: http://localhost:8080/api/github/callback"

echo ""
echo "Production Environment:"
echo "  • Client ID: ${prod_client_id:0:10}... (${#prod_client_id} chars)"
echo "  • Redirect URI: https://cuni.vercel.app/api/github/callback"

echo ""
echo "🎮 STEP 5: Manual Testing Instructions"
echo "---------------------------------------"
echo -e "${BLUE}1. Open http://localhost:5173 in your browser${NC}"
echo -e "${BLUE}2. Create or join a room (any room ID works)${NC}"
echo -e "${BLUE}3. Add some code files using the file explorer${NC}"
echo -e "${BLUE}4. Look for the purple GitHub icon in the editor toolbar${NC}"
echo -e "${BLUE}5. Click the GitHub icon to test the save flow${NC}"
echo ""

echo "💡 STEP 6: Expected GitHub Save Flow"
echo "-------------------------------------"
echo "1. 🔄 Click GitHub button"
echo "2. 🔐 Authentication check"
echo "3. 🔗 GitHub OAuth redirect (if needed)"
echo "4. 📁 Repository creation (codeunity-rooms)"
echo "5. 💾 Files saved to GitHub"
echo "6. ✅ Success notification"
echo ""

echo "🔗 STEP 7: Quick Test Links"
echo "----------------------------"
echo "• Frontend: http://localhost:5173"
echo "• Backend: http://localhost:8080"
echo "• GitHub OAuth Test: http://localhost:8080/api/github/oauth-url?username=test&roomId=123"
echo ""

echo "📋 STEP 8: Troubleshooting"
echo "---------------------------"
echo "If GitHub save doesn't work:"
echo "• Check browser console for errors"
echo "• Verify OAuth app callback URL matches exactly"
echo "• Ensure GitHub OAuth app has 'repo' and 'user:email' scopes"
echo "• Check server logs for detailed error messages"
echo ""

echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${YELLOW}Ready to test GitHub integration at http://localhost:5173${NC}"
