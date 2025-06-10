const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // You'll need to set this in your .env file
});

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { prompt, code, fileName, context } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Build context for the AI
    let systemMessage = `You are GitHub Copilot, an AI coding assistant integrated into CodeUnity. You help developers write, debug, and improve code. You can:
1. Generate code based on prompts
2. Explain existing code
3. Debug and fix issues
4. Refactor code
5. Add comments and documentation
6. Convert code between languages

Always provide practical, working code solutions.`;

    let userMessage = prompt;

    // Add context if provided
    if (code && fileName) {
      const fileExtension = fileName.split('.').pop();
      userMessage = `File: ${fileName} (${fileExtension})
Current code:
\`\`\`${fileExtension}
${code}
\`\`\`

Request: ${prompt}`;
    }

    // Make request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" for better results
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      response: response,
      usage: completion.usage
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service error',
      error: error.message
    });
  }
});

// Code completion endpoint
router.post('/complete', async (req, res) => {
  try {
    const { code, fileName, cursorPosition } = req.body;

    const fileExtension = fileName ? fileName.split('.').pop() : 'js';
    
    const prompt = `Complete this ${fileExtension} code:
\`\`\`${fileExtension}
${code}
\`\`\`

Provide only the completion, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a code completion assistant. Provide only the code that should come next, without explanations or additional text." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    res.json({
      success: true,
      completion: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Code completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Code completion error',
      error: error.message
    });
  }
});

// Code explanation endpoint
router.post('/explain', async (req, res) => {
  try {
    const { code, fileName } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const fileExtension = fileName ? fileName.split('.').pop() : 'js';
    
    const prompt = `Explain this ${fileExtension} code in detail:
\`\`\`${fileExtension}
${code}
\`\`\`

Provide a clear, step-by-step explanation of what this code does.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a code explanation assistant. Provide clear, educational explanations of code." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({
      success: true,
      explanation: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Code explanation error:', error);
    res.status(500).json({
      success: false,
      message: 'Code explanation error',
      error: error.message
    });
  }
});

// Code debugging endpoint
router.post('/debug', async (req, res) => {
  try {
    const { code, fileName, error } = req.body;

    const fileExtension = fileName ? fileName.split('.').pop() : 'js';
    
    let prompt = `Debug this ${fileExtension} code:
\`\`\`${fileExtension}
${code}
\`\`\``;

    if (error) {
      prompt += `\n\nError encountered: ${error}`;
    }

    prompt += `\n\nProvide the corrected code and explain what was wrong.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a debugging assistant. Identify issues in code and provide corrected versions with explanations." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1200,
      temperature: 0.3
    });

    res.json({
      success: true,
      debug: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Code debugging error:', error);
    res.status(500).json({
      success: false,
      message: 'Code debugging error',
      error: error.message
    });
  }
});

module.exports = router;
