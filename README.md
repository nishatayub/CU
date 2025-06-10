# CodeUnity - Collaborative Code Editor with AI

A real-time collaborative code editor with integrated GitHub Copilot-like AI functionality.

### 🌐 Live URLs
- **Frontend URL**: https://cuni.vercel.app/
- **Backend URL**: https://cu-669q.onrender.com

## 🚀 Features

- **Real-time Collaboration**: Multiple users can edit code simultaneously
- **AI Code Assistant**: Integrated OpenAI-powered coding assistant
- **File Management**: Create, edit, and organize project files
- **Code Execution**: Run code directly in the browser
- **Modern UI**: Beautiful purple-blue-cyan gradient theme
- **Responsive Design**: Works on desktop and mobile devices

## 🤖 AI Integration - FREE & PAID Options

### 🆓 FREE Options (No Money Required!)

Your CodeUnity app works with **completely free AI** out of the box!

#### Option 1: Built-in Pattern Analysis (Already Working!)
- **Cost:** $0 forever
- **Setup:** None - already included!
- **Features:** Basic code analysis, simple debugging, pattern recognition

#### Option 2: Ollama - Free Local AI (Recommended Free Option)
- **Cost:** $0 forever  
- **Quality:** Much better than pattern analysis
- **Setup:** 5 minutes
```bash
# Install free local AI
brew install ollama
ollama run codellama  # Downloads free coding AI model
```

### 💰 Premium Option: OpenAI API

#### Prerequisites
You'll need an OpenAI API key for premium AI features.

### Step 1: Get OpenAI API Key (For Premium AI)
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Name it "CodeUnity-AI" and copy the key
6. **⚠️ Important**: Add billing information at [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)

### Step 2: Configure Environment Variables (For Premium AI)
1. Navigate to the `server` directory
2. Open the `.env` file
3. Replace `your_openai_api_key_here` with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### Step 3: Restart the Server
```bash
cd server
npm run dev
```

## 🛠️ Local Development Setup

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🎯 AI Commands

Once your OpenAI API key is configured, you can use these commands in the Copilot panel:

- `/help` - Show available commands
- `/explain` - Explain the current code
- `/debug` - Debug the current code
- `/complete` - Auto-complete code
- `/optimize` - Optimize the current code
- `/comment` - Add comments to code
- `/refactor` - Refactor the current code
- `/convert <language>` - Convert code to another language

### Example Prompts
- "Write a function to sort an array"
- "Fix the bug in this code"
- "Add error handling to this function"
- "Convert this JavaScript to TypeScript"
- "Explain what this function does"

## 💰 Cost Information

### Free Options:
- **Pattern Analysis**: $0 (built-in)
- **Ollama Local AI**: $0 (download once, use forever)

### Premium Option:
- **OpenAI API**: Pay-per-use
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **GPT-4**: ~$0.03 per 1K tokens (more expensive but higher quality)

**The app automatically detects what's available and uses the best option!**

You can set spending limits in your OpenAI dashboard to control costs.

## 🔧 Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Monaco Editor
- **Backend**: Node.js, Express, Socket.IO, MongoDB
- **AI**: OpenAI GPT-3.5-turbo/GPT-4
- **Deployment**: Vercel (Frontend), Render (Backend)
