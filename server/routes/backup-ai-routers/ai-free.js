// Free AI Integration using Ollama (Local AI Models)
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Ollama runs locally on port 11434 by default
const OLLAMA_URL = 'http://localhost:11434';

// Test if Ollama is running
const isOllamaRunning = async () => {
  try {
    await axios.get(`${OLLAMA_URL}/api/tags`);
    return true;
  } catch (error) {
    return false;
  }
};

// AI Chat endpoint using Ollama
router.post('/chat', async (req, res) => {
  try {
    const { prompt, code, fileName, context } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Check if Ollama is running
    if (!(await isOllamaRunning())) {
      return res.status(503).json({
        success: false,
        message: 'Ollama is not running. Please install and start Ollama with a coding model like CodeLlama.',
        instructions: 'Run: brew install ollama && ollama run codellama'
      });
    }

    // Build context for the AI
    let systemMessage = `You are a helpful coding assistant integrated into CodeUnity. You help developers write, debug, and improve code. You can:
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

    // Make request to Ollama
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: "codellama", // or "deepseek-coder", "codegemma"
      prompt: `${systemMessage}\n\nUser: ${userMessage}\n\nAssistant:`,
      stream: false
    });

    res.json({
      success: true,
      response: response.data.response,
      model: 'CodeLlama (Free Local AI)'
    });

  } catch (error) {
    console.error('Free AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Free AI service error',
      error: error.message,
      suggestion: 'Make sure Ollama is installed and running with a coding model'
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

    if (!(await isOllamaRunning())) {
      return res.status(503).json({
        success: false,
        message: 'Ollama is not running'
      });
    }

    const fileExtension = fileName ? fileName.split('.').pop() : 'code';
    
    const prompt = `Please explain this ${fileExtension} code in detail:

\`\`\`${fileExtension}
${code}
\`\`\`

Explain what it does, how it works, and any important patterns or techniques used.`;

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: "codellama",
      prompt: prompt,
      stream: false
    });

    res.json({
      success: true,
      explanation: response.data.response
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
    const { code, fileName } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    if (!(await isOllamaRunning())) {
      return res.status(503).json({
        success: false,
        message: 'Ollama is not running'
      });
    }

    const fileExtension = fileName ? fileName.split('.').pop() : 'code';
    
    const prompt = `Please analyze this ${fileExtension} code for bugs, errors, and potential issues:

\`\`\`${fileExtension}
${code}
\`\`\`

Identify any:
1. Syntax errors
2. Logic errors
3. Performance issues
4. Security vulnerabilities
5. Best practice violations

Provide specific fixes and improvements.`;

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: "codellama",
      prompt: prompt,
      stream: false
    });

    res.json({
      success: true,
      debug: response.data.response
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

// Code completion endpoint
router.post('/complete', async (req, res) => {
  try {
    const { code, fileName } = req.body;

    if (!(await isOllamaRunning())) {
      return res.status(503).json({
        success: false,
        message: 'Ollama is not running'
      });
    }

    const fileExtension = fileName ? fileName.split('.').pop() : 'js';
    
    const prompt = `Complete this ${fileExtension} code. Provide only the missing code that should come next:

\`\`\`${fileExtension}
${code}
\`\`\`

Completion:`;

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: "codellama",
      prompt: prompt,
      stream: false
    });

    res.json({
      success: true,
      completion: response.data.response
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

module.exports = router;
