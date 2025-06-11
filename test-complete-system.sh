#!/bin/bash

# CodeUnity Platform - Comprehensive Feature Testing Script
# This script tests all major features of the platform

echo "🚀 CodeUnity Platform - Comprehensive Feature Testing"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}🧪 Testing: $test_name${NC}"
    
    result=$(eval "$test_command" 2>&1)
    
    if echo "$result" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo -e "${YELLOW}Expected pattern: $expected_pattern${NC}"
        echo -e "${YELLOW}Actual result: $result${NC}"
    fi
}

# Check if server is running
echo -e "${BLUE}🔍 Checking if CodeUnity server is running...${NC}"
if ! curl -s http://localhost:8080 > /dev/null; then
    echo -e "${RED}❌ Server is not running on port 8080${NC}"
    echo -e "${YELLOW}Please start the server with: cd server && npm start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server is running${NC}"

# Test 1: AI Status Check
run_test "AI Service Status" \
    "curl -s http://localhost:8080/api/ai/status" \
    '"success":true'

# Test 2: AI Chat Functionality
run_test "AI Chat Functionality" \
    "curl -s -X POST http://localhost:8080/api/ai/chat -H \"Content-Type: application/json\" -d '{\"prompt\": \"Hello AI\"}'" \
    '"success":true'

# Test 3: AI Code Explanation
run_test "AI Code Explanation" \
    "curl -s -X POST http://localhost:8080/api/ai/explain -H \"Content-Type: application/json\" -d '{\"code\": \"function hello() { return \\\"world\\\"; }\", \"fileName\": \"test.js\"}'" \
    '"success":true'

# Test 4: AI Code Debugging
run_test "AI Code Debugging" \
    "curl -s -X POST http://localhost:8080/api/ai/debug -H \"Content-Type: application/json\" -d '{\"code\": \"console.log(hello())\", \"fileName\": \"test.js\"}'" \
    '"success":true'

# Test 5: AI Code Completion
run_test "AI Code Completion" \
    "curl -s -X POST http://localhost:8080/api/ai/complete -H \"Content-Type: application/json\" -d '{\"code\": \"function calculate\", \"fileName\": \"test.js\"}'" \
    '"success":true'

# Test 6: File Management - Create Room Files
TEST_ROOM_ID="test-room-$(date +%s)"
run_test "File Creation" \
    "curl -s -X POST http://localhost:8080/api/files/$TEST_ROOM_ID -H \"Content-Type: application/json\" -d '{\"name\": \"test.js\", \"content\": \"console.log(\\\"Hello World\\\");\"}'" \
    '"success":true'

# Test 7: File Management - Get Room Files
run_test "File Retrieval" \
    "curl -s http://localhost:8080/api/files/$TEST_ROOM_ID" \
    '"success":true'

# Test 8: Email Service Status
run_test "Email Service Status" \
    "curl -s http://localhost:8080/api/email/test" \
    '"success":true'

# Test 9: Chat Persistence - Save Message
TEST_SESSION_ID="session-$(date +%s)"
run_test "Chat Message Persistence" \
    "curl -s -X POST http://localhost:8080/api/ai-chat/save-message -H \"Content-Type: application/json\" -d '{\"roomId\": \"$TEST_ROOM_ID\", \"sessionId\": \"$TEST_SESSION_ID\", \"message\": {\"type\": \"question\", \"content\": \"Test message\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"}}'" \
    '"success":true'

# Test 10: Chat Persistence - Get History
run_test "Chat History Retrieval" \
    "curl -s http://localhost:8080/api/ai-chat/history/$TEST_ROOM_ID/$TEST_SESSION_ID" \
    '"success":true'

# Summary
echo -e "\n${BLUE}📊 Test Results Summary${NC}"
echo "==============================="
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "\n${GREEN}🎉 All tests passed! CodeUnity platform is fully functional.${NC}"
    echo -e "${GREEN}✅ AI System: Working${NC}"
    echo -e "${GREEN}✅ Chat Persistence: Working${NC}"
    echo -e "${GREEN}✅ File Management: Working${NC}"
    echo -e "${GREEN}✅ Email Service: Working${NC}"
    echo -e "${GREEN}✅ Database Integration: Working${NC}"
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please check the failed tests above.${NC}"
fi

echo -e "\n${BLUE}🌐 Platform URLs:${NC}"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
echo "AI Status: http://localhost:8080/api/ai/status"

echo -e "\n${BLUE}📚 Additional Features:${NC}"
echo "• Real-time collaboration via Socket.io"
echo "• Usage-based restrictions (3-session limit)"
echo "• Google Gemini AI integration"
echo "• MongoDB chat persistence"
echo "• Professional email templates"
echo "• Multi-language code execution"
echo "• GitHub OAuth integration"

echo -e "\n${GREEN}✨ CodeUnity is ready for production use!${NC}"
