// Improved AI Router - No local installation required
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Check if OpenAI is configured
const isOpenAIAvailable = () => {
  return process.env.OPENAI_API_KEY && 
         process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && 
         process.env.OPENAI_API_KEY !== '' &&
         process.env.OPENAI_API_KEY.trim() !== '';
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
        { role: "system", content: "You are an AI Assistant that helps with coding, debugging, and software development. Provide clear, helpful responses with code examples when appropriate." },
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

// Free AI using Hugging Face Inference API (no API key required)
const queryHuggingFace = async (prompt) => {
  try {
    // Use Hugging Face's free inference API for code-related tasks
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        inputs: prompt,
        parameters: {
          max_length: 512,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.95,
          pad_token_id: 50256
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text.replace(prompt, '').trim();
    }
    
    throw new Error('No response from Hugging Face');
  } catch (error) {
    if (error.response?.status === 503) {
      // Model is loading, provide helpful message
      throw new Error('AI model is initializing, please try again in a moment');
    }
    throw error;
  }
};

// Intelligent pattern-based responses for coding assistance
const getIntelligentResponse = (prompt, code, fileName) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Code explanation requests
  if (lowerPrompt.includes('explain') || lowerPrompt.includes('what does') || lowerPrompt.includes('how does')) {
    if (code) {
      return analyzeCode(code, fileName);
    }
    return "I can help explain code! Please share the code you'd like me to analyze, and I'll break down what it does, how it works, and any important concepts.";
  }
  
  // Bug fixing requests
  if (lowerPrompt.includes('bug') || lowerPrompt.includes('error') || lowerPrompt.includes('fix') || lowerPrompt.includes('wrong')) {
    if (code) {
      return debugCode(code, fileName, prompt);
    }
    return "I can help debug your code! Please share the problematic code along with any error messages, and I'll help identify potential issues and solutions.";
  }
  
  // Function/feature requests
  if (lowerPrompt.includes('function') || lowerPrompt.includes('create') || lowerPrompt.includes('write')) {
    return generateCodeSuggestion(prompt);
  }
  
  // Optimization requests
  if (lowerPrompt.includes('optimize') || lowerPrompt.includes('improve') || lowerPrompt.includes('better')) {
    if (code) {
      return suggestOptimizations(code, fileName);
    }
    return "I can help optimize your code for better performance, readability, and maintainability. Please share the code you'd like me to review.";
  }
  
  // General help
  if (lowerPrompt.includes('help') || lowerPrompt.includes('how to')) {
    return `I'm here to help with your coding needs! I can assist with:

🔍 **Code Analysis**: Explain how your code works
🐛 **Debugging**: Find and fix issues in your code  
⚡ **Optimization**: Improve code performance and readability
🛠️ **Code Generation**: Create functions and features
📚 **Best Practices**: Suggest coding improvements

Just describe what you need help with, and I'll provide detailed assistance!`;
  }
  
  // Default response with context awareness
  return generateContextualResponse(prompt, code, fileName);
};

// Analyze code structure and functionality
const analyzeCode = (code, fileName) => {
  const ext = fileName ? fileName.split('.').pop().toLowerCase() : 'unknown';
  const lines = code.split('\n');
  
  let analysis = `## Code Analysis: ${fileName || 'Your Code'}\n\n`;
  
  // Language detection
  analysis += `**Language**: ${getLanguageName(ext)}\n`;
  analysis += `**Lines**: ${lines.length}\n\n`;
  
  // Structure analysis
  const structures = analyzeCodeStructure(code, ext);
  if (structures.length > 0) {
    analysis += `**Code Structure**:\n${structures.map(s => `• ${s}`).join('\n')}\n\n`;
  }
  
  // Functionality analysis
  const functions = analyzeFunctionality(code, ext);
  if (functions.length > 0) {
    analysis += `**Functionality**:\n${functions.map(f => `• ${f}`).join('\n')}\n\n`;
  }
  
  // Dependencies
  const dependencies = findDependencies(code, ext);
  if (dependencies.length > 0) {
    analysis += `**Dependencies**:\n${dependencies.map(d => `• ${d}`).join('\n')}\n\n`;
  }
  
  analysis += `**Summary**: This ${getLanguageName(ext)} code ${generateSummary(code, ext)}`;
  
  return analysis;
};

// Debug code and find potential issues
const debugCode = (code, fileName, userPrompt) => {
  const issues = [];
  const suggestions = [];
  
  // Common JavaScript issues
  if (code.includes('var ')) {
    issues.push("Using 'var' instead of 'let' or 'const'");
    suggestions.push("Replace 'var' with 'let' for mutable variables or 'const' for constants");
  }
  
  if (code.includes('==') && !code.includes('===')) {
    issues.push("Using loose equality (==) instead of strict equality (===)");
    suggestions.push("Use '===' for type-safe comparisons");
  }
  
  if (code.includes('console.log')) {
    issues.push("Console.log statements found");
    suggestions.push("Remove debug console.log statements before production");
  }
  
  // Missing error handling
  if (code.includes('await') && !code.includes('try')) {
    issues.push("Async operations without error handling");
    suggestions.push("Wrap async operations in try-catch blocks");
  }
  
  // Unused variables (basic detection)
  const variableMatches = code.match(/(?:let|const|var)\s+(\w+)/g);
  if (variableMatches) {
    variableMatches.forEach(match => {
      const varName = match.split(/\s+/)[1];
      const usageCount = (code.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
      if (usageCount <= 1) {
        issues.push(`Variable '${varName}' might be unused`);
      }
    });
  }
  
  let response = `## Debug Analysis: ${fileName || 'Your Code'}\n\n`;
  
  if (issues.length === 0) {
    response += "✅ **No obvious issues found!** Your code looks clean.\n\n";
  } else {
    response += `**Potential Issues Found (${issues.length})**:\n`;
    issues.forEach((issue, index) => {
      response += `${index + 1}. ${issue}\n`;
      if (suggestions[index]) {
        response += `   💡 *Suggestion: ${suggestions[index]}*\n`;
      }
    });
    response += '\n';
  }
  
  // Provide specific help based on user's prompt
  if (userPrompt.toLowerCase().includes('error')) {
    response += "**For specific error messages**: Please share the exact error text for more targeted debugging help.";
  }
  
  return response;
};

// Generate code suggestions
const generateCodeSuggestion = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('function')) {
    return `Here's a basic function template:

\`\`\`javascript
function myFunction(parameter) {
  // Your logic here
  return result;
}

// Arrow function alternative
const myFunction = (parameter) => {
  return result;
};
\`\`\`

**Next steps**: Describe what specific functionality you need, and I can provide a more tailored example.`;
  }
  
  if (lowerPrompt.includes('api') || lowerPrompt.includes('fetch')) {
    return `Here's an API request example:

\`\`\`javascript
// Using fetch (modern)
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
fetchData('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\``;
  }
  
  if (lowerPrompt.includes('loop') || lowerPrompt.includes('iterate')) {
    return `Common loop patterns:

\`\`\`javascript
// For array iteration
const items = ['a', 'b', 'c'];

// Modern forEach
items.forEach(item => console.log(item));

// Traditional for loop
for (let i = 0; i < items.length; i++) {
  console.log(items[i]);
}

// For...of loop (ES6+)
for (const item of items) {
  console.log(item);
}
\`\`\``;
  }
  
  return `I can help you create specific code! Try asking for:
- "Create a function that..."
- "How to make an API call"
- "Write a loop that..."
- "Create a class for..."

Be specific about what you want to build, and I'll provide targeted code examples.`;
};

// Suggest optimizations
const suggestOptimizations = (code, fileName) => {
  const suggestions = [];
  
  // Performance suggestions
  if (code.includes('document.getElementById') && code.split('document.getElementById').length > 3) {
    suggestions.push("🚀 **Performance**: Cache DOM elements instead of repeated getElementById calls");
  }
  
  if (code.includes('for') && code.includes('.length') && !code.includes('const length')) {
    suggestions.push("🚀 **Performance**: Cache array length in for loops");
  }
  
  // Readability suggestions
  if (code.split('\n').some(line => line.length > 120)) {
    suggestions.push("📖 **Readability**: Consider breaking long lines for better readability");
  }
  
  if (!code.includes('//') && code.split('\n').length > 10) {
    suggestions.push("📖 **Maintainability**: Add comments to explain complex logic");
  }
  
  // Modern JavaScript suggestions
  if (code.includes('.innerHTML =')) {
    suggestions.push("🔒 **Security**: Consider using textContent instead of innerHTML for text-only content");
  }
  
  if (code.includes('function(') && !code.includes('this')) {
    suggestions.push("✨ **Modern JS**: Consider using arrow functions for cleaner syntax");
  }
  
  let response = `## Optimization Suggestions: ${fileName || 'Your Code'}\n\n`;
  
  if (suggestions.length === 0) {
    response += "✅ **Code looks well-optimized!** No immediate improvements needed.\n\n";
    response += "**General optimization tips**:\n";
    response += "• Use meaningful variable names\n";
    response += "• Keep functions small and focused\n";
    response += "• Add error handling for robustness\n";
    response += "• Consider using modern ES6+ features\n";
  } else {
    response += "**Recommended improvements**:\n\n";
    suggestions.forEach((suggestion, index) => {
      response += `${index + 1}. ${suggestion}\n\n`;
    });
  }
  
  return response;
};

// Helper functions
const getLanguageName = (ext) => {
  const languages = {
    js: 'JavaScript',
    ts: 'TypeScript',
    jsx: 'React JSX',
    tsx: 'React TSX',
    py: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    html: 'HTML',
    css: 'CSS',
    php: 'PHP',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    sql: 'SQL'
  };
  return languages[ext] || 'Code';
};

const analyzeCodeStructure = (code, ext) => {
  const structures = [];
  
  if (code.includes('class ')) structures.push('Classes defined');
  if (code.includes('function ') || code.includes('=>')) structures.push('Functions defined');
  if (code.includes('if (') || code.includes('if(')) structures.push('Conditional logic');
  if (code.includes('for ') || code.includes('while ')) structures.push('Loops present');
  if (code.includes('try {') || code.includes('catch')) structures.push('Error handling');
  if (code.includes('async ') || code.includes('await ')) structures.push('Async operations');
  
  return structures;
};

const analyzeFunctionality = (code, ext) => {
  const functionality = [];
  
  if (code.includes('fetch(') || code.includes('axios')) functionality.push('API/HTTP requests');
  if (code.includes('addEventListener') || code.includes('onClick')) functionality.push('Event handling');
  if (code.includes('document.') || code.includes('getElementById')) functionality.push('DOM manipulation');
  if (code.includes('localStorage') || code.includes('sessionStorage')) functionality.push('Local storage usage');
  if (code.includes('console.')) functionality.push('Console output/debugging');
  if (code.includes('Math.')) functionality.push('Mathematical operations');
  if (code.includes('JSON.')) functionality.push('JSON processing');
  
  return functionality;
};

const findDependencies = (code, ext) => {
  const dependencies = [];
  
  const imports = code.match(/import .+ from ['"](.+)['"];?/g);
  if (imports) {
    imports.forEach(imp => {
      const match = imp.match(/from ['"](.+)['"];?/);
      if (match) dependencies.push(match[1]);
    });
  }
  
  const requires = code.match(/require\(['"](.+)['"]\)/g);
  if (requires) {
    requires.forEach(req => {
      const match = req.match(/require\(['"](.+)['"]\)/);
      if (match) dependencies.push(match[1]);
    });
  }
  
  return dependencies;
};

const generateSummary = (code, ext) => {
  const lines = code.split('\n').length;
  const hasClasses = code.includes('class ');
  const hasFunctions = code.includes('function ') || code.includes('=>');
  
  if (hasClasses && hasFunctions) {
    return `appears to be a well-structured ${getLanguageName(ext)} module with classes and functions.`;
  } else if (hasClasses) {
    return `defines classes for object-oriented programming.`;
  } else if (hasFunctions) {
    return `contains functions for specific functionality.`;
  } else if (lines > 20) {
    return `appears to be a substantial script or configuration file.`;
  } else {
    return `is a simple ${getLanguageName(ext)} snippet.`;
  }
};

const generateContextualResponse = (prompt, code, fileName) => {
  if (code) {
    return `I can see you're working with ${fileName ? `the file "${fileName}"` : 'some code'}. 

To better assist you, please let me know:
- What specific help do you need with this code?
- Are you trying to debug an issue?
- Do you want to add new functionality?
- Need an explanation of how it works?

I can provide detailed analysis, suggestions, and solutions based on your specific needs!`;
  }
  
  return `I'm here to help with your coding question: "${prompt}"

I can assist with:
• **Code Analysis**: Understanding and explaining code
• **Debugging**: Finding and fixing issues  
• **Code Generation**: Creating functions and features
• **Optimization**: Improving performance and readability
• **Best Practices**: Modern coding techniques

Please share your code or be more specific about what you'd like help with!`;
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
    let response;
    let aiService = 'intelligent-fallback';

    // Add context if provided
    if (code && fileName) {
      const fileExtension = fileName.split('.').pop();
      fullPrompt = `File: ${fileName} (${fileExtension})
Code:
\`\`\`${fileExtension}
${code}
\`\`\`

User question: ${prompt}

Please provide helpful coding assistance.`;
    }

    // Try OpenAI first (if available)
    if (isOpenAIAvailable()) {
      try {
        response = await queryOpenAI(fullPrompt);
        aiService = 'openai';
      } catch (error) {
        console.log('OpenAI failed, trying Hugging Face:', error.message);
      }
    }

    // Try Hugging Face if OpenAI failed or unavailable
    if (!response) {
      try {
        response = await queryHuggingFace(fullPrompt);
        aiService = 'huggingface';
      } catch (error) {
        console.log('Hugging Face failed, using intelligent fallback:', error.message);
      }
    }

    // Use intelligent pattern-based response if all cloud services failed
    if (!response) {
      response = getIntelligentResponse(prompt, code, fileName);
      aiService = 'intelligent-fallback';
    }

    res.json({
      success: true,
      response: response,
      aiService: aiService,
      message: getServiceMessage(aiService)
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service error',
      error: error.message,
      fallback: getIntelligentResponse(req.body.prompt || 'help', req.body.code, req.body.fileName)
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
    let aiService = 'intelligent-fallback';

    // Try OpenAI first
    if (isOpenAIAvailable()) {
      try {
        explanation = await queryOpenAI(prompt);
        aiService = 'openai';
      } catch (error) {
        console.log('OpenAI failed for explanation:', error.message);
      }
    }

    // Try Hugging Face if OpenAI failed
    if (!explanation) {
      try {
        explanation = await queryHuggingFace(prompt);
        aiService = 'huggingface';
      } catch (error) {
        console.log('Hugging Face failed for explanation:', error.message);
      }
    }

    // Use intelligent analysis if all cloud services failed
    if (!explanation) {
      explanation = analyzeCode(code, fileName);
      aiService = 'intelligent-fallback';
    }

    res.json({
      success: true,
      explanation: explanation,
      aiService: aiService,
      message: getServiceMessage(aiService)
    });

  } catch (error) {
    console.error('Code explanation error:', error);
    res.status(500).json({
      success: false,
      message: 'Code explanation service error',
      error: error.message,
      fallback: analyzeCode(req.body.code || '', req.body.fileName || '')
    });
  }
});

// Code debugging endpoint
router.post('/debug', async (req, res) => {
  try {
    const { code, fileName, errorMessage } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const prompt = `Please debug this code and find potential issues:

File: ${fileName || 'code'}
${errorMessage ? `Error message: ${errorMessage}` : ''}

\`\`\`
${code}
\`\`\`

Identify issues and suggest fixes.`;

    let debugInfo;
    let aiService = 'intelligent-fallback';

    // Try OpenAI first
    if (isOpenAIAvailable()) {
      try {
        debugInfo = await queryOpenAI(prompt);
        aiService = 'openai';
      } catch (error) {
        console.log('OpenAI failed for debugging:', error.message);
      }
    }

    // Try Hugging Face if OpenAI failed
    if (!debugInfo) {
      try {
        debugInfo = await queryHuggingFace(prompt);
        aiService = 'huggingface';
      } catch (error) {
        console.log('Hugging Face failed for debugging:', error.message);
      }
    }

    // Use intelligent debugging if all cloud services failed
    if (!debugInfo) {
      debugInfo = debugCode(code, fileName, errorMessage || 'debug analysis');
      aiService = 'intelligent-fallback';
    }

    res.json({
      success: true,
      debugInfo: debugInfo,
      aiService: aiService,
      message: getServiceMessage(aiService)
    });

  } catch (error) {
    console.error('Code debugging error:', error);
    res.status(500).json({
      success: false,
      message: 'Code debugging service error',
      error: error.message,
      fallback: debugCode(req.body.code || '', req.body.fileName || '', 'error analysis')
    });
  }
});

// Service status endpoint
router.get('/status', async (req, res) => {
  const status = {
    openai: isOpenAIAvailable(),
    huggingface: true, // Always available (no API key required)
    intelligentFallback: true, // Always available
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    services: status,
    primaryService: status.openai ? 'openai' : 'huggingface',
    message: 'AI services status check complete'
  });
});

// Helper function to get service message
const getServiceMessage = (service) => {
  switch (service) {
    case 'openai':
      return 'Powered by OpenAI GPT - Premium AI responses';
    case 'huggingface':
      return 'Powered by Hugging Face - Free cloud AI';
    case 'intelligent-fallback':
      return 'Intelligent pattern analysis - Always available';
    default:
      return 'AI Assistant ready to help';
  }
};

module.exports = router;
