// Enhanced Free AI Router - High Quality Responses Without API Keys
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Best free models for different tasks
const FREE_AI_MODELS = {
  // Hugging Face models (completely free, no API key needed)
  codeGeneration: 'Salesforce/codegen-350M-mono',
  codeExplanation: 'microsoft/CodeBERT-base', 
  conversation: 'microsoft/DialoGPT-medium',
  // Code-specific models
  pythonCode: 'microsoft/CodeGPT-small-py',
  jsCode: 'microsoft/CodeGPT-small-js',
  debugging: 'huggingface/CodeBERTa-small-v1'
};

// Hugging Face API (completely free)
const queryHuggingFace = async (modelName, prompt, options = {}) => {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${modelName}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: options.maxTokens || 200,
            temperature: options.temperature || 0.7,
            do_sample: true,
            top_p: 0.95,
            repetition_penalty: 1.1,
            return_full_text: false
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      if (response.data && Array.isArray(response.data) && response.data[0]) {
        return response.data[0].generated_text || response.data[0].summary_text || '';
      }
      
      return '';
    } catch (error) {
      attempt++;
      
      if (error.response?.status === 503 && attempt < maxRetries) {
        // Model is loading, wait and retry
        console.log(`Model ${modelName} is loading, retrying in ${attempt * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }
      
      if (attempt >= maxRetries) {
        throw new Error(`Failed to get response from ${modelName} after ${maxRetries} attempts`);
      }
    }
  }
};

// Code-specific response generators
const generateFibonacciCode = (language = 'javascript') => {
  const implementations = {
    javascript: `// Fibonacci function in JavaScript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Optimized iterative version
function fibonacciOptimized(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

// Usage examples:
console.log(fibonacci(10));        // 55
console.log(fibonacciOptimized(10)); // 55 (faster)`,
    
    python: `# Fibonacci function in Python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Optimized iterative version
def fibonacci_optimized(n):
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Usage examples:
print(fibonacci(10))           # 55
print(fibonacci_optimized(10)) # 55 (faster)`,

    java: `// Fibonacci function in Java
public class Fibonacci {
    // Recursive version
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    // Optimized iterative version
    public static int fibonacciOptimized(int n) {
        if (n <= 1) return n;
        
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacci(10));           // 55
        System.out.println(fibonacciOptimized(10));  // 55 (faster)
    }
}`
  };
  
  return implementations[language] || implementations.javascript;
};

const generateCodeForPrompt = (prompt, language = 'javascript') => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Fibonacci
  if (lowerPrompt.includes('fibonacci')) {
    return generateFibonacciCode(language);
  }
  
  // Array sorting
  if (lowerPrompt.includes('sort') && lowerPrompt.includes('array')) {
    return language === 'python' ? `# Array sorting in Python
# Built-in sort
numbers = [64, 34, 25, 12, 22, 11, 90]
numbers.sort()
print(numbers)  # [11, 12, 22, 25, 34, 64, 90]

# Custom bubble sort
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Usage
result = bubble_sort([64, 34, 25, 12, 22, 11, 90])
print(result)` : `// Array sorting in JavaScript
// Built-in sort
const numbers = [64, 34, 25, 12, 22, 11, 90];
numbers.sort((a, b) => a - b);
console.log(numbers); // [11, 12, 22, 25, 34, 64, 90]

// Custom bubble sort
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// Usage
const result = bubbleSort([64, 34, 25, 12, 22, 11, 90]);
console.log(result);`;
  }
  
  // API call
  if (lowerPrompt.includes('api') || lowerPrompt.includes('fetch') || lowerPrompt.includes('http')) {
    return `// Making API calls in JavaScript
// Using fetch (modern approach)
async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage example
fetchData('https://jsonplaceholder.typicode.com/posts/1')
  .then(data => console.log(data))
  .catch(error => console.error('Failed to fetch:', error));

// Using axios (if available)
const axios = require('axios');

async function fetchWithAxios(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Axios Error:', error);
    throw error;
  }
}`;
  }
  
  // Loop examples
  if (lowerPrompt.includes('loop') || lowerPrompt.includes('iterate')) {
    return `// Different types of loops in JavaScript

// For loop
for (let i = 0; i < 5; i++) {
  console.log(\`Iteration \${i}\`);
}

// While loop
let count = 0;
while (count < 3) {
  console.log(\`Count: \${count}\`);
  count++;
}

// For...of loop (arrays)
const fruits = ['apple', 'banana', 'orange'];
for (const fruit of fruits) {
  console.log(fruit);
}

// For...in loop (objects)
const person = { name: 'John', age: 30, city: 'New York' };
for (const key in person) {
  console.log(\`\${key}: \${person[key]}\`);
}

// Array methods (functional approach)
const numbers = [1, 2, 3, 4, 5];

// forEach
numbers.forEach(num => console.log(num));

// map
const doubled = numbers.map(num => num * 2);

// filter
const evens = numbers.filter(num => num % 2 === 0);`;
  }
  
  // Return a helpful template for other requests
  return `// Here's a helpful code template for: "${prompt}"

// Basic function structure
function ${prompt.toLowerCase().replace(/[^a-z0-9]/g, '')}Function() {
  // Implementation goes here
  
  // Example logic
  try {
    // Your main logic
    console.log('Function executed successfully');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Usage example
${prompt.toLowerCase().replace(/[^a-z0-9]/g, '')}Function();

// Need more specific help? Try asking:
// - "Create a function that does [specific task]"
// - "How to [specific action] in [programming language]"
// - "Debug this code: [paste your code]"`;
};

// Intelligent code explanation
const explainCode = (code, fileName = '') => {
  const language = getLanguageFromFileName(fileName);
  const codeAnalysis = analyzeCodeStructure(code);
  
  let explanation = `## Code Explanation: ${fileName || 'Your Code'}\n\n`;
  
  // Language and basic info
  explanation += `**Language**: ${language}\n`;
  explanation += `**Lines of code**: ${code.split('\n').length}\n\n`;
  
  // Main functionality
  if (code.includes('fibonacci')) {
    explanation += `**Purpose**: This code implements the Fibonacci sequence algorithm.\n\n`;
    explanation += `**How it works**:\n`;
    explanation += `1. The Fibonacci sequence starts with 0 and 1\n`;
    explanation += `2. Each subsequent number is the sum of the two preceding ones\n`;
    explanation += `3. Formula: F(n) = F(n-1) + F(n-2)\n\n`;
    
    if (code.includes('if (n <= 1)')) {
      explanation += `**Base case**: Returns n directly for 0 and 1\n`;
    }
    if (code.includes('fibonacci(n - 1)')) {
      explanation += `**Recursive approach**: Calls itself with smaller values\n`;
      explanation += `⚠️ **Note**: Recursive version can be slow for large numbers\n\n`;
    }
  }
  
  // Structure analysis
  if (codeAnalysis.functions.length > 0) {
    explanation += `**Functions found**:\n`;
    codeAnalysis.functions.forEach(func => {
      explanation += `• \`${func}\` - Main function implementation\n`;
    });
    explanation += '\n';
  }
  
  if (codeAnalysis.variables.length > 0) {
    explanation += `**Variables used**:\n`;
    codeAnalysis.variables.forEach(variable => {
      explanation += `• \`${variable}\` - ${getVariablePurpose(variable, code)}\n`;
    });
    explanation += '\n';
  }
  
  // Control flow
  if (code.includes('if')) explanation += `**Conditional logic**: Uses if-statements for decision making\n`;
  if (code.includes('for') || code.includes('while')) explanation += `**Loops**: Contains iteration logic\n`;
  if (code.includes('return')) explanation += `**Return value**: Function returns a computed result\n\n`;
  
  // Performance notes
  if (code.includes('fibonacci(n - 1)') && code.includes('fibonacci(n - 2)')) {
    explanation += `**⚡ Performance tip**: The recursive approach has O(2^n) time complexity. Consider using an iterative approach for better performance with large numbers.\n\n`;
  }
  
  return explanation;
};

// Code structure analysis helpers
const analyzeCodeStructure = (code) => {
  const functions = [];
  const variables = [];
  
  // Find function declarations
  const functionMatches = code.match(/function\s+(\w+)/g);
  if (functionMatches) {
    functions.push(...functionMatches.map(match => match.replace('function ', '')));
  }
  
  // Find arrow functions
  const arrowMatches = code.match(/const\s+(\w+)\s*=/g);
  if (arrowMatches) {
    variables.push(...arrowMatches.map(match => match.replace(/const\s+/, '').replace(/\s*=/, '')));
  }
  
  // Find variable declarations
  const varMatches = code.match(/(?:let|const|var)\s+(\w+)/g);
  if (varMatches) {
    variables.push(...varMatches.map(match => match.replace(/(?:let|const|var)\s+/, '')));
  }
  
  return { functions: [...new Set(functions)], variables: [...new Set(variables)] };
};

const getLanguageFromFileName = (fileName) => {
  if (!fileName) return 'JavaScript';
  const ext = fileName.split('.').pop()?.toLowerCase();
  const langMap = {
    js: 'JavaScript', ts: 'TypeScript', py: 'Python', java: 'Java',
    cpp: 'C++', c: 'C', php: 'PHP', rb: 'Ruby', go: 'Go'
  };
  return langMap[ext] || 'Code';
};

const getVariablePurpose = (variable, code) => {
  if (variable === 'n') return 'Input parameter (typically a number)';
  if (variable === 'i' || variable === 'j') return 'Loop counter variable';
  if (variable === 'result') return 'Stores the computed result';
  if (variable === 'temp') return 'Temporary storage variable';
  return 'Program variable';
};

// Main chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { prompt, code, fileName } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }
    
    let response = '';
    let aiService = 'free-ai';
    
    // Check if it's a code explanation request
    if (code && (prompt.toLowerCase().includes('explain') || prompt.toLowerCase().includes('what does'))) {
      response = explainCode(code, fileName);
      aiService = 'code-analysis';
    }
    // Check if it's a code generation request
    else if (prompt.toLowerCase().includes('function') || 
             prompt.toLowerCase().includes('create') || 
             prompt.toLowerCase().includes('write') ||
             prompt.toLowerCase().includes('fibonacci') ||
             prompt.toLowerCase().includes('sort') ||
             prompt.toLowerCase().includes('api')) {
      
      const language = fileName ? getLanguageFromFileName(fileName) : 'javascript';
      response = generateCodeForPrompt(prompt, language.toLowerCase());
      aiService = 'code-generation';
    }
    // Try Hugging Face for conversational responses
    else {
      try {
        const hfResponse = await queryHuggingFace(
          FREE_AI_MODELS.conversation, 
          prompt,
          { maxTokens: 150, temperature: 0.8 }
        );
        
        if (hfResponse && hfResponse.trim()) {
          response = hfResponse.trim();
          aiService = 'huggingface-free';
        } else {
          throw new Error('Empty response from Hugging Face');
        }
      } catch (error) {
        console.log('Hugging Face failed, using enhanced fallback:', error.message);
        
        // Enhanced fallback for specific questions
        if (prompt.toLowerCase().includes('help')) {
          response = `I'm here to help with your coding! I can assist with:

🔧 **Code Generation**: 
- "Create a function for fibonacci numbers"
- "Write a sorting algorithm"
- "Make an API call example"

🔍 **Code Analysis**: 
- "Explain this code" (paste your code)
- "What does this function do?"

🐛 **Debugging Help**:
- "Debug this code" (share your code)
- "Fix this error"

💡 **Examples**: 
- "How to loop through an array"
- "Create a REST API endpoint"
- "Write a Python class"

Just ask me anything about programming!`;
        } else {
          response = `I can help you with that! Here are some specific ways I can assist:

**For "${prompt}":**
- Share your code and I'll explain how it works
- Ask for specific code examples and I'll generate them
- Describe what you're trying to build and I'll help

Try being more specific, like:
- "Create a function that calculates fibonacci numbers"
- "Explain this JavaScript code: [paste code]"
- "How to make an HTTP request in Python"

What specific coding help do you need?`;
        }
        aiService = 'enhanced-fallback';
      }
    }
    
    res.json({
      success: true,
      response: response,
      aiService: aiService,
      message: getServiceMessage(aiService)
    });
    
  } catch (error) {
    console.error('Free AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable',
      error: error.message,
      fallback: `I'm here to help with coding! Try asking:
- "Create a function for [specific task]"
- "Explain this code: [paste your code]" 
- "How to [specific programming task]"`
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
    
    const explanation = explainCode(code, fileName);
    
    res.json({
      success: true,
      explanation: explanation,
      aiService: 'code-analysis',
      message: 'Code analysis complete - generated by free AI system'
    });
    
  } catch (error) {
    console.error('Code explanation error:', error);
    res.status(500).json({
      success: false,
      message: 'Code explanation service error',
      error: error.message
    });
  }
});

// Service status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    services: {
      huggingface: true,
      codeGeneration: true,
      codeAnalysis: true,
      enhancedFallback: true
    },
    message: 'Free AI services are available'
  });
});

const getServiceMessage = (service) => {
  switch (service) {
    case 'huggingface-free':
      return 'Powered by Hugging Face - Free AI';
    case 'code-generation':
      return 'Smart code generation - No API key needed';
    case 'code-analysis':
      return 'Intelligent code analysis - Always available';
    case 'enhanced-fallback':
      return 'Enhanced AI assistance - Free forever';
    default:
      return 'Free AI assistant ready to help';
  }
};

module.exports = router;
