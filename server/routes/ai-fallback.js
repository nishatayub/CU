// Free AI Integration using Hugging Face Inference API
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Hugging Face models (completely free)
const HF_MODELS = {
  code: 'microsoft/DialoGPT-medium', // For conversation
  codegen: 'Salesforce/codegen-350M-mono', // For code generation
  explain: 'microsoft/CodeBERT-base' // For code understanding
};

// Free Hugging Face inference
const queryHuggingFace = async (model, inputs, task = 'text-generation') => {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: inputs,
        parameters: {
          max_length: 512,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.95
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          // No API key required for basic inference
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 503) {
      // Model is loading, retry after a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      return queryHuggingFace(model, inputs, task);
    }
    throw error;
  }
};

// AI Chat endpoint using Hugging Face
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

    // Add context if provided
    if (code && fileName) {
      const fileExtension = fileName.split('.').pop();
      fullPrompt = `Context: ${fileName} (${fileExtension})\nCode:\n${code}\n\nQuestion: ${prompt}\n\nAnswer:`;
    }

    const result = await queryHuggingFace(HF_MODELS.code, fullPrompt);
    
    let response = 'I can help you with coding tasks! Please note that this is a free AI service with limited capabilities.';
    
    if (result && result[0] && result[0].generated_text) {
      response = result[0].generated_text.replace(fullPrompt, '').trim();
    }

    res.json({
      success: true,
      response: response,
      model: 'Hugging Face (Free AI)',
      note: 'Using free AI models - responses may be limited but completely free!'
    });

  } catch (error) {
    console.error('Free AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Free AI service temporarily unavailable',
      fallback: 'Try using the /help command for coding assistance',
      error: error.message
    });
  }
});

// Simple code explanation using pattern matching
router.post('/explain', async (req, res) => {
  try {
    const { code, fileName } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    // Simple code analysis without AI
    let explanation = analyzeCodePattern(code, fileName);

    res.json({
      success: true,
      explanation: explanation,
      note: 'Free code analysis using pattern recognition'
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

// Simple debugging using common patterns
router.post('/debug', async (req, res) => {
  try {
    const { code, fileName } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    // Simple debugging analysis
    let debug = analyzeCodeForIssues(code, fileName);

    res.json({
      success: true,
      debug: debug,
      note: 'Free debugging using pattern analysis'
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

// Code completion using templates
router.post('/complete', async (req, res) => {
  try {
    const { code, fileName } = req.body;
    
    // Simple code completion
    let completion = generateCompletion(code, fileName);

    res.json({
      success: true,
      completion: completion,
      note: 'Free code completion using templates'
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

// Helper functions for free code analysis
function analyzeCodePattern(code, fileName) {
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
  explanation += "💡 **Note:** This is a basic analysis. For detailed AI explanations, consider upgrading to premium AI services.";
  
  return explanation;
}

function analyzeCodeForIssues(code, fileName) {
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
  
  issues += "💡 **Note:** This is basic pattern matching. For comprehensive AI debugging, consider premium AI services.";
  
  return issues;
}

function generateCompletion(code, fileName) {
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
  
  return `// Continue your ${getLanguageName(ext)} code here\n// For advanced AI completion, consider premium AI services`;
}

function getLanguageName(ext) {
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
}

module.exports = router;
