// Google AI Studio Integration (Free Tier)
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI (if API key is provided)
let googleAI = null;
if (process.env.GOOGLE_AI_API_KEY) {
  googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}

// Check if Google AI is available
const isGoogleAIAvailable = () => {
  return googleAI && process.env.GOOGLE_AI_API_KEY && 
         process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_key_here' && 
         process.env.GOOGLE_AI_API_KEY !== '';
};

// Query Google AI (Gemini)
const queryGoogleAI = async (prompt) => {
  if (!googleAI) {
    throw new Error('Google AI not configured');
  }
  
  try {
    const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Google AI error: ${error.message}`);
  }
};

module.exports = {
  isGoogleAIAvailable,
  queryGoogleAI
};
