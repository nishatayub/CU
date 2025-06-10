// Smart AI Router - Automatically uses free alternatives when OpenAI key is not available
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Check what AI services are available
const checkAvailableServices = async () => {
  const services = {
    openai: false,
    ollama: false,
    fallback: true // Always available
  };
  
  // Check OpenAI
  if (process.env.OPENAI_API_KEY && 
      process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && 
      process.env.OPENAI_API_KEY !== '' &&
      process.env.OPENAI_API_KEY.trim() !== '') {
    services.openai = true;
  }
  
  // Check Ollama
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 1000 });
    services.ollama = true;
  } catch (error) {
    services.ollama = false;
  }
  
  return services;
};

// Simple pattern-based analysis functions
const analyzeCodePattern = (code, fileName) => {
  const ext = fileName ? fileName.split('.').pop().toLowerCase() : 'unknown';
  
  let explanation = `## Code Analysis for ${fileName || 'your file'}\n\n`;
  
  // Basic pattern recognition
  if (code.includes('function') || code.includes('=>')) {
    explanation += "**Functions detected:** This code defines functions that can be called to perform specific tasks.\n\n";
  }
  
  if (code.includes('class ') || code.includes('class{')) {
    explanation += "**Classes detected:** This code uses object-oriented programming with classes.\n\n";
  }
  
  if (code.includes('if') || code.includes('else')) {
    explanation += "**Conditional logic:** This code uses if/else statements for decision making.\n\n";
  }
  
  if (code.includes('for') || code.includes('while')) {
    explanation += "**Loops detected:** This code uses loops to repeat operations.\n\n";
  }
  
  if (code.includes('import') || code.includes('require')) {
    explanation += "**Dependencies:** This code imports external libraries or modules.\n\n";
  }
  
  explanation += `**Language:** ${getLanguageName(ext)}\n`;
  explanation += `**Lines of code:** ${code.split('\n').length}\n\n`;
  explanation += "💡 **Note:** This is a basic analysis. For detailed AI explanations, install Ollama (free) or add an OpenAI API key.";
  
  return explanation;
};

const analyzeCodeForIssues = (code, fileName) => {
  let issues = `## Code Analysis for ${fileName || 'your file'}\n\n`;
  let foundIssues = [];
  
  // Basic issue detection
  if (code.includes('console.log')) {
    foundIssues.push("🟡 **Debug statements found:** Remove console.log statements before production");
  }
  
  if (code.includes('var ')) {
    foundIssues.push("🟡 **Use modern variable declarations:** Consider using 'let' or 'const' instead of 'var'");
  }
  
  if (code.includes('==') && !code.includes('===')) {
    foundIssues.push("🟡 **Loose equality:** Consider using strict equality (===) instead of loose equality (==)");
  }
  
  if (!code.includes('try') && code.includes('await')) {
    foundIssues.push("🟠 **Missing error handling:** Consider wrapping async code in try-catch blocks");
  }
  
  if (foundIssues.length === 0) {
    issues += "✅ **No obvious issues detected!** Your code looks clean.\n\n";
  } else {
    issues += "**Potential improvements:**\n\n";
    foundIssues.forEach(issue => {
      issues += `${issue}\n\n`;
    });
  }
  
  issues += "💡 **Note:** This is basic pattern matching. For comprehensive AI debugging, install Ollama (free) or add an OpenAI API key.";
  
  return issues;
};

const generateCompletion = (code, fileName) => {
  const ext = fileName ? fileName.split('.').pop().toLowerCase() : 'js';
  
  // Very basic completion suggestions
  if (code.endsWith('function ')) {
    return 'functionName() {\n  // Your code here\n}';
  }
  
  if (code.endsWith('if (')) {
    return 'condition) {\n  // Your code here\n}';
  }
  
  if (code.endsWith('for (')) {
    return 'let i = 0; i < array.length; i++) {\n  // Your code here\n}';
  }
  
  return `// Continue your ${getLanguageName(ext)} code here\n// For advanced AI completion, install Ollama (free) or add OpenAI API key`;
};

const getLanguageName = (ext) => {
  const languages = {
    'js': 'JavaScript',
    'ts': 'TypeScript', 
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'kt': 'Kotlin'
  };
  
  return languages[ext] || 'Unknown';
};

// Health check endpoint
router.get('/status', async (req, res) => {
  try {
    const services = await checkAvailableServices();
    
    res.json({
      success: true,
      availableServices: services,
      currentService: services.openai ? 'openai' : (services.ollama ? 'ollama' : 'fallback'),
      recommendations: {
        free: 'Install Ollama for better free AI: brew install ollama && ollama run codellama',
        premium: 'Add OpenAI API key for best results: https://platform.openai.com/api-keys'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Chat endpoint with smart routing
router.post('/chat', async (req, res) => {
  try {
    const { prompt, code, fileName, context } = req.body;
    const services = await checkAvailableServices();
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Use OpenAI if available
    if (services.openai) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });

        let systemMessage = `You are GitHub Copilot, an AI coding assistant integrated into CodeUnity. You help developers write, debug, and improve code.`;
        let userMessage = prompt;

        if (code && fileName) {
          const fileExtension = fileName.split('.').pop();
          userMessage = `File: ${fileName} (${fileExtension})\nCurrent code:\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nRequest: ${prompt}`;
        }

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage }
          ],
          max_tokens: 1500,
          temperature: 0.7
        });

        return res.json({
          success: true,
          response: completion.choices[0].message.content,
          aiService: 'openai',
          serviceMessage: 'Using premium OpenAI service'
        });
      } catch (error) {
        console.error('OpenAI error:', error);
        // Fall through to Ollama or fallback
      }
    }

    // Try Ollama if available
    if (services.ollama) {
      try {
        let systemMessage = `You are a helpful coding assistant. Help developers write, debug, and improve code.`;
        let userMessage = prompt;

        if (code && fileName) {
          const fileExtension = fileName.split('.').pop();
          userMessage = `File: ${fileName} (${fileExtension})\nCurrent code:\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nRequest: ${prompt}`;
        }

        const response = await axios.post('http://localhost:11434/api/generate', {
          model: "codellama",
          prompt: `${systemMessage}\n\nUser: ${userMessage}\n\nAssistant:`,
          stream: false
        });

        return res.json({
          success: true,
          response: response.data.response,
          aiService: 'ollama',
          serviceMessage: 'Using free local AI (Ollama)'
        });
      } catch (error) {
        console.error('Ollama error:', error);
        // Fall through to fallback
      }
    }

    // Fallback to pattern analysis
    let response = `I can help you with coding questions! However, I'm currently using basic pattern analysis.

For better AI assistance:
• **Free option**: Install Ollama with \`brew install ollama && ollama run codellama\`
• **Premium option**: Add an OpenAI API key

Your question: "${prompt}"

Basic response: This appears to be a coding question. I can provide general programming guidance, but for specific code analysis, please install Ollama or add an OpenAI API key for more detailed assistance.`;

    return res.json({
      success: true,
      response: response,
      aiService: 'fallback',
      upgradeMessage: 'Using basic pattern analysis. Install Ollama (free) or add OpenAI API key for better AI!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service error',
      error: error.message
    });
  }
});

// Explain endpoint with smart routing
router.post('/explain', async (req, res) => {
  try {
    const { code, fileName } = req.body;
    const services = await checkAvailableServices();

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    // Use OpenAI if available
    if (services.openai) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });

        const fileExtension = fileName ? fileName.split('.').pop() : 'code';
        const prompt = `Please explain this ${fileExtension} code in detail:\n\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nExplain what it does, how it works, and any important patterns or techniques used.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.7
        });

        return res.json({
          success: true,
          explanation: completion.choices[0].message.content,
          aiService: 'openai',
          serviceMessage: 'Using premium OpenAI service'
        });
      } catch (error) {
        console.error('OpenAI error:', error);
      }
    }

    // Try Ollama if available
    if (services.ollama) {
      try {
        const fileExtension = fileName ? fileName.split('.').pop() : 'code';
        const prompt = `Please explain this ${fileExtension} code in detail:\n\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nExplain what it does, how it works, and any important patterns or techniques used.`;

        const response = await axios.post('http://localhost:11434/api/generate', {
          model: "codellama",
          prompt: prompt,
          stream: false
        });

        return res.json({
          success: true,
          explanation: response.data.response,
          aiService: 'ollama',
          serviceMessage: 'Using free local AI (Ollama)'
        });
      } catch (error) {
        console.error('Ollama error:', error);
      }
    }

    // Fallback to pattern analysis
    const explanation = analyzeCodePattern(code, fileName);
    return res.json({
      success: true,
      explanation: explanation,
      aiService: 'fallback',
      upgradeMessage: 'Using basic pattern analysis. Install Ollama (free) or add OpenAI API key for better AI!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Code explanation error',
      error: error.message
    });
  }
});

// Debug endpoint with smart routing
router.post('/debug', async (req, res) => {
  try {
    const { code, fileName } = req.body;
    const services = await checkAvailableServices();

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    // Use OpenAI if available
    if (services.openai) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });

        const fileExtension = fileName ? fileName.split('.').pop() : 'code';
        const prompt = `Please analyze this ${fileExtension} code for bugs, errors, and potential issues:\n\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nIdentify any:\n1. Syntax errors\n2. Logic errors\n3. Performance issues\n4. Security vulnerabilities\n5. Best practice violations\n\nProvide specific fixes and improvements.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.7
        });

        return res.json({
          success: true,
          debug: completion.choices[0].message.content,
          aiService: 'openai',
          serviceMessage: 'Using premium OpenAI service'
        });
      } catch (error) {
        console.error('OpenAI error:', error);
      }
    }

    // Try Ollama if available
    if (services.ollama) {
      try {
        const fileExtension = fileName ? fileName.split('.').pop() : 'code';
        const prompt = `Please analyze this ${fileExtension} code for bugs, errors, and potential issues:\n\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nIdentify any:\n1. Syntax errors\n2. Logic errors\n3. Performance issues\n4. Security vulnerabilities\n5. Best practice violations\n\nProvide specific fixes and improvements.`;

        const response = await axios.post('http://localhost:11434/api/generate', {
          model: "codellama",
          prompt: prompt,
          stream: false
        });

        return res.json({
          success: true,
          debug: response.data.response,
          aiService: 'ollama',
          serviceMessage: 'Using free local AI (Ollama)'
        });
      } catch (error) {
        console.error('Ollama error:', error);
      }
    }

    // Fallback to pattern analysis
    const debug = analyzeCodeForIssues(code, fileName);
    return res.json({
      success: true,
      debug: debug,
      aiService: 'fallback',
      upgradeMessage: 'Using basic pattern analysis. Install Ollama (free) or add OpenAI API key for better AI!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Code debugging error',
      error: error.message
    });
  }
});

// Complete endpoint with smart routing
router.post('/complete', async (req, res) => {
  try {
    const { code, fileName } = req.body;
    const services = await checkAvailableServices();

    // Use OpenAI if available
    if (services.openai) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });

        const fileExtension = fileName ? fileName.split('.').pop() : 'js';
        const prompt = `Complete this ${fileExtension} code. Provide only the missing code that should come next:\n\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nCompletion:`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.3
        });

        return res.json({
          success: true,
          completion: completion.choices[0].message.content,
          aiService: 'openai',
          serviceMessage: 'Using premium OpenAI service'
        });
      } catch (error) {
        console.error('OpenAI error:', error);
      }
    }

    // Try Ollama if available
    if (services.ollama) {
      try {
        const fileExtension = fileName ? fileName.split('.').pop() : 'js';
        const prompt = `Complete this ${fileExtension} code. Provide only the missing code that should come next:\n\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nCompletion:`;

        const response = await axios.post('http://localhost:11434/api/generate', {
          model: "codellama",
          prompt: prompt,
          stream: false
        });

        return res.json({
          success: true,
          completion: response.data.response,
          aiService: 'ollama',
          serviceMessage: 'Using free local AI (Ollama)'
        });
      } catch (error) {
        console.error('Ollama error:', error);
      }
    }

    // Fallback to template completion
    const completion = generateCompletion(code, fileName);
    return res.json({
      success: true,
      completion: completion,
      aiService: 'fallback',
      upgradeMessage: 'Using basic template completion. Install Ollama (free) or add OpenAI API key for better AI!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Code completion error',
      error: error.message
    });
  }
});

module.exports = router;
