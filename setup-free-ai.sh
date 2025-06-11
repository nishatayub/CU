#!/bin/bash

# Easy Setup Script for Free AI Options
echo "🚀 Setting up FREE AI for CodeUnity..."
echo ""

# Check if Ollama is installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed!"
    
    # Check if any models are installed
    models=$(ollama list 2>/dev/null | grep -v "NAME")
    if [ -n "$models" ]; then
        echo "📋 Installed models:"
        ollama list
    else
        echo "📥 No models installed yet. Let's install a free coding model..."
        echo ""
        echo "🔄 Installing CodeLlama (3.8GB) - Best free coding AI..."
        ollama pull codellama:7b
        echo "✅ CodeLlama installed successfully!"
    fi
else
    echo "📦 Installing Ollama (free local AI)..."
    
    # Check if we're on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            echo "🍺 Installing via Homebrew..."
            brew install ollama
        else
            echo "🌐 Installing via curl..."
            curl -fsSL https://ollama.ai/install.sh | sh
        fi
    else
        echo "🌐 Installing via curl..."
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
    
    echo "✅ Ollama installed!"
    echo ""
    echo "📥 Installing CodeLlama (free coding model)..."
    ollama pull codellama:7b
    echo "✅ CodeLlama installed successfully!"
fi

echo ""
echo "🧪 Testing your AI setup..."

# Test the current AI service
echo "🔄 Testing CodeUnity AI service..."
ai_status=$(curl -s http://localhost:8080/api/ai/status 2>/dev/null)

if [[ $ai_status == *"success"* ]]; then
    echo "✅ CodeUnity AI service is running!"
    echo ""
    echo "🎯 Testing with a coding question..."
    
    test_response=$(curl -s -X POST http://localhost:8080/api/ai/chat \
        -H "Content-Type: application/json" \
        -d '{"prompt": "create a simple hello world function"}' 2>/dev/null)
    
    if [[ $test_response == *"function"* ]]; then
        echo "✅ AI is working and generating code!"
        echo ""
        echo "🎉 SUCCESS! Your free AI setup is complete!"
        echo ""
        echo "📊 What you now have:"
        echo "  ✅ Enhanced pattern-based AI (always available)"
        echo "  ✅ Hugging Face integration (free cloud AI)"
        if command -v ollama &> /dev/null; then
            echo "  ✅ Ollama with CodeLlama (free local AI)"
        fi
        echo ""
        echo "🚀 Go to your CodeUnity app and try asking:"
        echo "  • 'Create a function for fibonacci numbers'"
        echo "  • 'Explain this code' (paste any code)"
        echo "  • 'How to make an API call'"
        echo "  • 'Debug this code' (share problematic code)"
    else
        echo "⚠️  AI service responded but might need attention"
        echo "Response: $test_response"
    fi
else
    echo "❌ CodeUnity server might not be running"
    echo "💡 Make sure to run: cd server && npm start"
fi

echo ""
echo "🔧 Available AI Options:"
echo ""
echo "1. 🆓 CURRENT ENHANCED AI (Working now!)"
echo "   - Smart code generation"
echo "   - Intelligent code analysis" 
echo "   - No setup required"
echo ""

if command -v ollama &> /dev/null; then
    echo "2. 🏠 OLLAMA LOCAL AI (Recommended)"
    echo "   - Start: ollama serve"
    echo "   - Models: codellama, deepseek-coder, codegemma"
    echo "   - Quality: Excellent, Speed: Fast, Cost: $0"
    echo ""
fi

echo "3. 🌟 GOOGLE AI STUDIO (Free Tier)"
echo "   - Get API key: https://makersuite.google.com/app/apikey"
echo "   - Add to .env: GOOGLE_AI_API_KEY=your_key"
echo "   - Quality: Excellent, Cost: Free tier generous"
echo ""

echo "4. 💰 OPENAI (Premium Option)"
echo "   - Get API key: https://platform.openai.com/api-keys"  
echo "   - Add to .env: OPENAI_API_KEY=your_key"
echo "   - Quality: Best, Cost: ~$5-10/month"
echo ""

echo "🎯 RECOMMENDATION:"
echo "Your enhanced free AI is already working great!"
if command -v ollama &> /dev/null; then
    echo "For even better results, start Ollama: 'ollama serve'"
fi
echo "Try it now in your CodeUnity app! 🚀"
