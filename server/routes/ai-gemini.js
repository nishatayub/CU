// Simple Gemini-Only AI Router
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI
let genAI = null;
if (process.env.GOOGLE_AI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}

// Check if Gemini is available
const isGeminiAvailable = () => {
  const hasKey = process.env.GOOGLE_AI_API_KEY && 
         process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_key_here' && 
         process.env.GOOGLE_AI_API_KEY !== '';
  
  // Debug logging for production
  console.log('🔍 AI Service Debug:', {
    hasKey: !!hasKey,
    genAI: !!genAI,
    keyLength: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0
  });
  
  return genAI && hasKey;
};

// Query Gemini
const queryGemini = async (prompt) => {
  if (!genAI) {
    throw new Error('Google AI not configured. Please add GOOGLE_AI_API_KEY to your .env file');
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    throw new Error(`Gemini error: ${error.message}`);
  }
};

// Enhanced prompt for better coding responses
const createCodingPrompt = (userPrompt, code, fileName) => {
  let prompt = `You are an expert programming assistant. Please provide helpful, accurate coding assistance.

User's request: ${userPrompt}`;

  if (code && fileName) {
    const fileExtension = fileName.split('.').pop();
    prompt += `

Current file: ${fileName} (${fileExtension})
Current code:
\`\`\`${fileExtension}
${code}
\`\`\`

Please provide specific help for this code context.`;
  }

  prompt += `

Guidelines:
- If asked to create code, provide complete, working examples
- If explaining code, be detailed and educational
- Include comments in code examples
- Suggest best practices and optimizations when relevant
- For debugging, identify specific issues and provide fixes`;

  return prompt;
};

// Main chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { prompt, code, fileName, context } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    if (!isGeminiAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Gemini AI is not configured. Please add GOOGLE_AI_API_KEY to your .env file.',
        setup: {
          step1: 'Go to https://makersuite.google.com/app/apikey',
          step2: 'Create a free API key',
          step3: 'Add GOOGLE_AI_API_KEY=your_key to your .env file',
          step4: 'Restart the server'
        }
      });
    }

    const enhancedPrompt = createCodingPrompt(prompt, code, fileName);
    const response = await queryGemini(enhancedPrompt);

    res.json({
      success: true,
      response: response,
      aiService: 'gemini-pro',
      message: 'Powered by Google Gemini Pro - Free AI'
    });

  } catch (error) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Gemini AI service error',
      error: error.message,
      fallback: 'Please check your GOOGLE_AI_API_KEY configuration'
    });
  }
});







// Status endpoint to check AI service availability
router.get('/status', async (req, res) => {
  try {
    const geminiAvailable = isGeminiAvailable();
    
    res.json({
      success: true,
      currentService: geminiAvailable ? 'gemini' : 'unavailable',
      services: {
        gemini: geminiAvailable,
        fallback: false // No fallback in Gemini-only system
      },
      model: 'Google Gemini 1.5 Flash',
      capabilities: [
        'General AI chat and conversation',
        'Code questions and guidance',
        'Technical problem solving',
        'Multi-language support'
      ],
      message: geminiAvailable 
        ? 'Google Gemini AI is ready and available' 
        : 'Google AI API key is not configured. Please add GOOGLE_AI_API_KEY to your .env file',
      setup: !geminiAvailable ? {
        instruction: 'Get a free API key from https://makersuite.google.com/app/apikey',
        envVariable: 'GOOGLE_AI_API_KEY'
      } : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check AI status',
      error: error.message
    });
  }
});

module.exports = router;
