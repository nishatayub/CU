// Simple AI Router that actually works
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Check if Ollama is available
const isOllamaAvailable = async () => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
    return response.data.models && response.data.models.length > 0;
  } catch (error) {
    return false;
  }
};

// Check if OpenAI is configured
const isOpenAIAvailable = () => {
  return process.env.OPENAI_API_KEY && 
         process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && 
         process.env.OPENAI_API_KEY !== '';
};

// Use Ollama for AI requests
const queryOllama = async (prompt, model = 'codellama:7b') => {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: model,
      prompt: prompt,
      stream: false
    }, { timeout: 30000 });
    
    return response.data.response;
  } catch (error) {
    throw new Error(`Ollama error: ${error.message}`);
  }
};

// Use OpenAI for AI requests
const queryOpenAI = async (prompt) => {
  const OpenAI = require('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    throw new Error(`OpenAI error: ${error.message}`);
  }
};

// Simple fallback responses
const getFallbackResponse = (prompt) => {
  if (prompt.toLowerCase().includes('function')) {
    return `Here's a basic function template:

\`\`\`javascript
function myFunction() {
  // Your code here
  return "Hello World!";
}
\`\`\`

For better AI responses, install Ollama or add an OpenAI API key.`;
  }
  
  if (prompt.toLowerCase().includes('help')) {
    return `I can help you with basic coding tasks! 

Available commands:
- Ask for function examples
- Request code explanations
- Get debugging tips

For advanced AI assistance:
- **Free**: Install Ollama locally
- **Premium**: Add OpenAI API key`;
  }

  return `I understand you're asking: "${prompt}"

I can provide basic programming help, but for detailed AI assistance:
- **Free option**: Install Ollama locally for powerful AI
- **Premium option**: Add OpenAI API key for best results

What specific coding help do you need?`;
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

    let fullPrompt = prompt;
    let aiService = 'fallback';
    let response;

    // Add context if provided
    if (code && fileName) {
      const fileExtension = fileName.split('.').pop();
      fullPrompt = `File: ${fileName} (${fileExtension})
Current code:
\`\`\`${fileExtension}
${code}
\`\`\`

User request: ${prompt}

Please provide helpful coding assistance.`;
    }

    // Try OpenAI first (if available)
    if (isOpenAIAvailable()) {
      try {
        response = await queryOpenAI(fullPrompt);
        aiService = 'openai';
      } catch (error) {
        console.log('OpenAI failed, trying Ollama:', error.message);
      }
    }

    // Try Ollama if OpenAI failed or unavailable
    if (!response && await isOllamaAvailable()) {
      try {
        response = await queryOllama(fullPrompt);
        aiService = 'ollama';
      } catch (error) {
        console.log('Ollama failed, using fallback:', error.message);
      }
    }

    // Use fallback if everything else failed
    if (!response) {
      response = getFallbackResponse(prompt);
      aiService = 'fallback';
    }

    res.json({
      success: true,
      response: response,
      aiService: aiService,
      message: aiService === 'fallback' ? 'Using basic responses. Install Ollama or add OpenAI key for better AI.' : `Using ${aiService} AI service`
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service error',
      error: error.message,
      fallback: getFallbackResponse(req.body.prompt || 'help')
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

    const fileExtension = fileName ? fileName.split('.').pop() : 'code';
    const prompt = `Please explain this ${fileExtension} code in detail:

\`\`\`${fileExtension}
${code}
\`\`\`

Explain what it does, how it works, and any important concepts.`;

    let explanation;
    let aiService = 'fallback';

    // Try OpenAI first
    if (isOpenAIAvailable()) {
      try {
        explanation = await queryOpenAI(prompt);
        aiService = 'openai';
      } catch (error) {
        console.log('OpenAI failed for explanation');
      }
    }

    // Try Ollama
    if (!explanation && await isOllamaAvailable()) {
      try {
        explanation = await queryOllama(prompt);
        aiService = 'ollama';
      } catch (error) {
        console.log('Ollama failed for explanation');
      }
    }

    // Fallback explanation
    if (!explanation) {
      explanation = `## Code Analysis for ${fileName || 'your file'}

This appears to be ${fileExtension} code with ${code.split('\n').length} lines.

**Basic Analysis:**
- Language: ${fileExtension}
- Contains functions: ${code.includes('function') ? 'Yes' : 'No'}
- Contains classes: ${code.includes('class') ? 'Yes' : 'No'}
- Contains loops: ${code.includes('for') || code.includes('while') ? 'Yes' : 'No'}

For detailed AI explanation, install Ollama or add OpenAI API key.`;
      aiService = 'fallback';
    }

    res.json({
      success: true,
      explanation: explanation,
      aiService: aiService
    });

  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({
      success: false,
      message: 'Code explanation error',
      error: error.message
    });
  }
});

// Debug endpoint
router.post('/debug', async (req, res) => {
  try {
    const { code, fileName } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const fileExtension = fileName ? fileName.split('.').pop() : 'code';
    const prompt = `Please analyze this ${fileExtension} code for bugs and issues:

\`\`\`${fileExtension}
${code}
\`\`\`

Look for:
1. Syntax errors
2. Logic errors  
3. Performance issues
4. Security vulnerabilities
5. Best practice violations

Provide specific fixes and improvements.`;

    let debug;
    let aiService = 'fallback';

    // Try OpenAI first
    if (isOpenAIAvailable()) {
      try {
        debug = await queryOpenAI(prompt);
        aiService = 'openai';
      } catch (error) {
        console.log('OpenAI failed for debugging');
      }
    }

    // Try Ollama
    if (!debug && await isOllamaAvailable()) {
      try {
        debug = await queryOllama(prompt);
        aiService = 'ollama';
      } catch (error) {
        console.log('Ollama failed for debugging');
      }
    }

    // Fallback debugging
    if (!debug) {
      let issues = [];
      if (code.includes('console.log')) issues.push('🟡 Remove console.log statements for production');
      if (code.includes('var ')) issues.push('🟡 Consider using let/const instead of var');
      if (code.includes('==') && !code.includes('===')) issues.push('🟡 Use strict equality (===) instead of loose equality (==)');
      
      debug = `## Debug Analysis for ${fileName || 'your file'}

${issues.length > 0 ? 
  '**Potential Issues Found:**\n' + issues.join('\n') + '\n\n' : 
  '✅ No obvious issues detected in basic analysis.\n\n'
}

For comprehensive AI debugging, install Ollama or add OpenAI API key.`;
      aiService = 'fallback';
    }

    res.json({
      success: true,
      debug: debug,
      aiService: aiService
    });

  } catch (error) {
    console.error('Debug error:', error);
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
    
    const fileExtension = fileName ? fileName.split('.').pop() : 'js';
    const prompt = `Complete this ${fileExtension} code:

\`\`\`${fileExtension}
${code}
\`\`\`

Provide only the completion that should come next.`;

    let completion;
    let aiService = 'fallback';

    // Try OpenAI first
    if (isOpenAIAvailable()) {
      try {
        completion = await queryOpenAI(prompt);
        aiService = 'openai';
      } catch (error) {
        console.log('OpenAI failed for completion');
      }
    }

    // Try Ollama
    if (!completion && await isOllamaAvailable()) {
      try {
        completion = await queryOllama(prompt);
        aiService = 'ollama';
      } catch (error) {
        console.log('Ollama failed for completion');
      }
    }

    // Fallback completion
    if (!completion) {
      if (code.endsWith('function ')) {
        completion = 'functionName() {\n  // Your code here\n  return result;\n}';
      } else if (code.endsWith('if (')) {
        completion = 'condition) {\n  // Your code here\n}';
      } else {
        completion = `// Continue your ${fileExtension} code here\n// For AI completion, install Ollama or add OpenAI key`;
      }
      aiService = 'fallback';
    }

    res.json({
      success: true,
      completion: completion,
      aiService: aiService
    });

  } catch (error) {
    console.error('Completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Code completion error',
      error: error.message
    });
  }
});

// Status endpoint
router.get('/status', async (req, res) => {
  const openaiAvailable = isOpenAIAvailable();
  const ollamaAvailable = await isOllamaAvailable();
  
  let currentService = 'fallback';
  if (openaiAvailable) currentService = 'openai';
  else if (ollamaAvailable) currentService = 'ollama';
  
  res.json({
    success: true,
    services: {
      openai: openaiAvailable,
      ollama: ollamaAvailable,
      fallback: true
    },
    currentService: currentService,
    message: currentService === 'fallback' ? 
      'Install Ollama or add OpenAI key for AI features' : 
      `Using ${currentService} for AI assistance`
  });
});

module.exports = router;
