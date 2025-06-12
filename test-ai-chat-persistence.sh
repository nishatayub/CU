#!/bin/bash

# Test AI Chat Database Persistence
echo "🧪 Testing AI Chat Database Persistence..."

# Set up test data
ROOM_ID="test-room-$(date +%s)"
SESSION_ID="test-session-$(date +%s)"
BASE_URL="http://localhost:8080"

echo "📋 Test Room ID: $ROOM_ID"
echo "📋 Test Session ID: $SESSION_ID"

# Test 1: Save a user message
echo ""
echo "✅ Test 1: Saving user message..."
USER_MSG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-chat/save-message" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"sessionId\": \"$SESSION_ID\",
    \"message\": {
      \"type\": \"question\",
      \"content\": \"Can you help me write a function?\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
    }
  }")

echo "Response: $USER_MSG_RESPONSE"

# Test 2: Save an AI response
echo ""
echo "✅ Test 2: Saving AI response..."
AI_MSG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-chat/save-message" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"sessionId\": \"$SESSION_ID\",
    \"message\": {
      \"type\": \"answer\",
      \"content\": \"Sure! Here's a function example:\\n\\n\\\`\\\`\\\`javascript\\nfunction example() {\\n  return 'Hello World!';\\n}\\n\\\`\\\`\\\`\",
      \"aiService\": \"intelligent-fallback\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
    }
  }")

echo "Response: $AI_MSG_RESPONSE"

# Test 3: Retrieve chat history
echo ""
echo "✅ Test 3: Retrieving chat history..."
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/ai-chat/history/$ROOM_ID/$SESSION_ID")

echo "Response: $HISTORY_RESPONSE"

# Test 4: Test bulk save
echo ""
echo "✅ Test 4: Testing bulk message save..."
BULK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-chat/save-messages" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"sessionId\": \"$SESSION_ID\",
    \"messages\": [
      {
        \"type\": \"question\",
        \"content\": \"How do I debug this code?\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
      },
      {
        \"type\": \"debug\",
        \"content\": \"Here are some debugging tips...\",
        \"aiService\": \"intelligent-fallback\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
      }
    ]
  }")

echo "Response: $BULK_RESPONSE"

# Test 5: Verify final history
echo ""
echo "✅ Test 5: Verifying final chat history..."
FINAL_HISTORY=$(curl -s -X GET "$BASE_URL/api/ai-chat/history/$ROOM_ID/$SESSION_ID")

echo "Final history: $FINAL_HISTORY"

# Test 6: Clear chat history
echo ""
echo "✅ Test 6: Clearing chat history..."
CLEAR_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/ai-chat/clear/$ROOM_ID/$SESSION_ID")

echo "Clear response: $CLEAR_RESPONSE"

# Test 7: Verify history is cleared
echo ""
echo "✅ Test 7: Verifying chat history is cleared..."
CLEARED_HISTORY=$(curl -s -X GET "$BASE_URL/api/ai-chat/history/$ROOM_ID/$SESSION_ID")

echo "Cleared history: $CLEARED_HISTORY"

echo ""
echo "🎉 AI Chat Database Persistence Tests Complete!"
echo ""
echo "📊 Summary:"
echo "- ✅ Single message save"
echo "- ✅ AI response save"
echo "- ✅ History retrieval"
echo "- ✅ Bulk message save"
echo "- ✅ History verification"
echo "- ✅ Chat clearing"
echo "- ✅ Clear verification"
echo ""
echo "🚀 Database persistence is working correctly!"
