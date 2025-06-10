import React, { useState, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaSpinner, FaBug, FaLightbulb, FaCode, FaMagic, FaDownload, FaCopy } from 'react-icons/fa';
import axios from 'axios';

const BACKEND_URL = import.meta.env.PROD 
  ? 'https://cu-669q.onrender.com'
  : 'http://localhost:8080';

const CopilotPanel = ({ currentFile, code, onCodeInsert }) => {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  
  // Check AI service status on mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/ai/status`);
        setAiStatus(response.data);
      } catch (error) {
        console.error('Failed to check AI status:', error);
      }
    };
    
    checkAIStatus();
  }, []);
  
  // Extract code blocks from AI response
  const extractCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        language: match[1] || 'plaintext',
        code: match[2].trim()
      });
    }
    
    return matches;
  };
  
  // Copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };
  
  // Insert code into editor
  const insertCode = (codeToInsert) => {
    if (onCodeInsert && typeof onCodeInsert === 'function') {
      onCodeInsert(codeToInsert);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userPrompt = prompt.trim();
    setPrompt('');
    setIsLoading(true);

    // Add user's question to responses
    setResponses(prev => [...prev, {
      type: 'question',
      content: userPrompt,
      timestamp: new Date().toISOString()
    }]);

    try {
      // Check for special commands
      if (userPrompt.startsWith('/')) {
        await handleCommand(userPrompt);
      } else {
        await handleGeneralQuery(userPrompt);
      }
    } catch (error) {
      setResponses(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = async (command) => {
    const cmd = command.toLowerCase();
    
    if (cmd === '/help') {
      setResponses(prev => [...prev, {
        type: 'help',
        content: `Available Commands:
        
/help - Show this help message
/explain - Explain the current code
/debug - Debug the current code
/complete - Auto-complete code
/optimize - Optimize the current code
/comment - Add comments to code
/refactor - Refactor the current code
/convert <language> - Convert code to another language

Examples:
- "Write a function to sort an array"
- "Fix the bug in this code"
- "Add error handling"
- "Convert this to TypeScript"`,
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    if (cmd === '/explain') {
      if (!code || !currentFile) {
        setResponses(prev => [...prev, {
          type: 'error',
          content: 'No code to explain. Please select a file first.',
          timestamp: new Date().toISOString()
        }]);
        return;
      }
      await explainCode();
      return;
    }

    if (cmd === '/debug') {
      if (!code || !currentFile) {
        setResponses(prev => [...prev, {
          type: 'error', 
          content: 'No code to debug. Please select a file first.',
          timestamp: new Date().toISOString()
        }]);
        return;
      }
      await debugCode();
      return;
    }

    if (cmd === '/complete') {
      if (!code || !currentFile) {
        setResponses(prev => [...prev, {
          type: 'error',
          content: 'No code to complete. Please select a file first.',
          timestamp: new Date().toISOString()
        }]);
        return;
      }
      await completeCode();
      return;
    }

    // Handle convert command
    if (cmd.startsWith('/convert ')) {
      const targetLanguage = cmd.split(' ')[1];
      if (!targetLanguage) {
        setResponses(prev => [...prev, {
          type: 'error',
          content: 'Please specify a target language. Example: /convert python',
          timestamp: new Date().toISOString()
        }]);
        return;
      }
      await convertCode(targetLanguage);
      return;
    }

    // If command not recognized
    setResponses(prev => [...prev, {
      type: 'error',
      content: `Unknown command: ${command}. Type /help for available commands.`,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleGeneralQuery = async (query) => {
    console.log('Making AI request:', { query, code, currentFile }); // Debug log
    
    const response = await axios.post(`${BACKEND_URL}/api/ai/chat`, {
      prompt: query,
      code: code,
      fileName: currentFile,
      context: 'CodeUnity Editor'
    });

    console.log('AI Response:', response.data); // Debug log

    if (response.data.success) {
      setResponses(prev => [...prev, {
        type: 'answer',
        content: response.data.response,
        timestamp: new Date().toISOString(),
        aiService: response.data.aiService,
        serviceMessage: response.data.serviceMessage
      }]);
    } else {
      throw new Error(response.data.message || 'AI service error');
    }
  };

  const explainCode = async () => {
    const response = await axios.post(`${BACKEND_URL}/api/ai/explain`, {
      code: code,
      fileName: currentFile
    });

    if (response.data.success) {
      setResponses(prev => [...prev, {
        type: 'explanation',
        content: response.data.explanation,
        timestamp: new Date().toISOString()
      }]);
    } else {
      throw new Error(response.data.message || 'Explanation service error');
    }
  };

  const debugCode = async () => {
    const response = await axios.post(`${BACKEND_URL}/api/ai/debug`, {
      code: code,
      fileName: currentFile
    });

    if (response.data.success) {
      setResponses(prev => [...prev, {
        type: 'debug',
        content: response.data.debug,
        timestamp: new Date().toISOString()
      }]);
    } else {
      throw new Error(response.data.message || 'Debug service error');
    }
  };

  const completeCode = async () => {
    const response = await axios.post(`${BACKEND_URL}/api/ai/complete`, {
      code: code,
      fileName: currentFile
    });

    if (response.data.success) {
      setResponses(prev => [...prev, {
        type: 'completion',
        content: response.data.completion,
        timestamp: new Date().toISOString()
      }]);
    } else {
      throw new Error(response.data.message || 'Code completion service error');
    }
  };

  const convertCode = async (targetLanguage) => {
    const response = await axios.post(`${BACKEND_URL}/api/ai/chat`, {
      prompt: `Convert this code to ${targetLanguage}`,
      code: code,
      fileName: currentFile,
      context: `Code conversion to ${targetLanguage}`
    });

    if (response.data.success) {
      setResponses(prev => [...prev, {
        type: 'conversion',
        content: response.data.response,
        timestamp: new Date().toISOString()
      }]);
    } else {
      throw new Error(response.data.message || 'Code conversion service error');
    }
  };

  const getResponseIcon = (type) => {
    switch (type) {
      case 'question': return <FaRobot className="text-purple-300" size={16} />;
      case 'answer': return <FaMagic className="text-blue-300" size={16} />;
      case 'explanation': return <FaLightbulb className="text-yellow-300" size={16} />;
      case 'debug': return <FaBug className="text-red-300" size={16} />;
      case 'completion': return <FaCode className="text-green-300" size={16} />;
      case 'conversion': return <FaCode className="text-cyan-300" size={16} />;
      case 'help': return <FaLightbulb className="text-orange-300" size={16} />;
      case 'error': return <FaBug className="text-red-400" size={16} />;
      default: return <FaRobot className="text-purple-300" size={16} />;
    }
  };

  const getResponseStyle = (type) => {
    switch (type) {
      case 'question': 
        return 'bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 border border-white/10';
      case 'answer':
        return 'bg-gradient-to-r from-blue-500/25 via-cyan-500/25 to-purple-500/25 border border-white/15';
      case 'explanation':
        return 'bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border border-yellow-400/20';
      case 'debug':
        return 'bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 border border-red-400/20';
      case 'completion':
        return 'bg-gradient-to-r from-green-500/20 via-teal-500/20 to-blue-500/20 border border-green-400/20';
      case 'conversion':
        return 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-400/20';
      case 'help':
        return 'bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-amber-500/20 border border-orange-400/20';
      case 'error':
        return 'bg-gradient-to-r from-red-600/25 via-red-500/25 to-pink-500/25 border border-red-400/25';
      default:
        return 'bg-gradient-to-r from-blue-500/25 via-cyan-500/25 to-purple-500/25 border border-white/15';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-800/25 text-white overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-white/10 flex-shrink-0">
        <FaRobot className="text-purple-300" size={20} />
        <span className="font-medium">GitHub Copilot</span>
        {aiStatus && (
          <div className="ml-auto text-xs">
            <span className={`px-2 py-1 rounded-full text-xs ${
              aiStatus.currentService === 'openai' 
                ? 'bg-green-500/20 text-green-300' 
                : aiStatus.currentService === 'ollama'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              {aiStatus.currentService === 'openai' && '🚀 Premium AI'}
              {aiStatus.currentService === 'ollama' && '🆓 Free AI'}
              {aiStatus.currentService === 'fallback' && '⚡ Basic'}
            </span>
          </div>
        )}
      </div>

      {/* AI Status Info Panel */}
      {aiStatus && aiStatus.currentService === 'fallback' && (
        <div className="p-3 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-b border-orange-400/20">
          <div className="text-xs space-y-2">
            <div className="font-medium text-orange-300">🔥 Upgrade Your AI Experience!</div>
            <div className="text-orange-200/80">
              <div>• <strong>Free:</strong> brew install ollama && ollama run codellama</div>
              <div>• <strong>Premium:</strong> Add OpenAI API key for best results</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0">
        {responses.length === 0 && (
          <div className="text-center text-white/40 space-y-3 mt-8">
            <FaRobot size={48} className="mx-auto text-purple-300/30" />
            <p className="text-sm">Start a conversation with GitHub Copilot</p>
            <p className="text-xs">Type <code className="px-1 py-0.5 bg-white/10 rounded">/help</code> to see available commands</p>
          </div>
        )}
        
        {responses.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${getResponseStyle(item.type)} transition-all duration-200 hover:scale-[1.01]`}>
            <div className="flex items-start gap-2 mb-2">
              {getResponseIcon(item.type)}
              <span className="text-xs text-white/60 capitalize font-medium">
                {item.type === 'question' ? 'You' : item.type}
              </span>
              {item.aiService && (
                <span className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/20">
                  {item.aiService === 'openai' ? '🤖 OpenAI' : item.aiService === 'ollama' ? '🆓 Ollama' : '⚡ Pattern'}
                </span>
              )}
              <span className="text-xs text-white/40 ml-auto">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-sm whitespace-pre-wrap break-words overflow-hidden leading-relaxed">
              {item.content}
            </div>
            
            {/* Action buttons for code responses */}
            {item.type !== 'question' && item.content && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => copyToClipboard(item.content)}
                  className="px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded border border-blue-400/20 transition-all duration-200 flex items-center gap-1"
                >
                  <FaCopy size={10} />
                  Copy
                </button>
                
                {/* Show insert button if there are code blocks and onCodeInsert is available */}
                {onCodeInsert && extractCodeBlocks(item.content).length > 0 && (
                  <button
                    onClick={() => {
                      const codeBlocks = extractCodeBlocks(item.content);
                      if (codeBlocks.length > 0) {
                        insertCode(codeBlocks[0].code); // Insert the first code block
                      }
                    }}
                    className="px-2 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded border border-green-400/20 transition-all duration-200 flex items-center gap-1"
                  >
                    <FaDownload size={10} />
                    Insert
                  </button>
                )}
                
                {/* Insert raw response for completion type */}
                {onCodeInsert && (item.type === 'completion' || item.type === 'conversion') && (
                  <button
                    onClick={() => insertCode(item.content)}
                    className="px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded border border-purple-400/20 transition-all duration-200 flex items-center gap-1"
                  >
                    <FaDownload size={10} />
                    Insert Code
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-gradient-to-r from-blue-500/25 via-cyan-500/25 to-purple-500/25 border border-white/15 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaSpinner className="text-blue-300 animate-spin" size={16} />
              <span className="text-xs text-white/60 font-medium">AI Assistant</span>
            </div>
            <div className="text-sm text-white/70">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex-shrink-0 space-y-3">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPrompt('/explain')}
            className="px-3 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg border border-yellow-400/20 transition-all duration-200"
          >
            <FaLightbulb className="inline mr-1" size={12} />
            Explain
          </button>
          <button
            onClick={() => setPrompt('/debug')}
            className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-400/20 transition-all duration-200"
          >
            <FaBug className="inline mr-1" size={12} />
            Debug
          </button>
          <button
            onClick={() => setPrompt('/complete')}
            className="px-3 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg border border-green-400/20 transition-all duration-200"
          >
            <FaCode className="inline mr-1" size={12} />
            Complete
          </button>
          <button
            onClick={() => setPrompt('/help')}
            className="px-3 py-1 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg border border-orange-400/20 transition-all duration-200"
          >
            Help
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 min-w-0">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={currentFile ? `Ask about ${currentFile}...` : "Type /help for commands..."}
            className="flex-1 min-w-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 text-white rounded-xl px-4 py-2 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500/30 backdrop-blur-xl placeholder-white/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 flex-shrink-0 ${
              !prompt.trim() || isLoading
                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
            }`}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <FaPaperPlane size={14} />
            )}
          </button>
        </form>
        
        <p className="text-xs text-white/40 break-words">
          💡 Tip: Use commands like <code className="px-1 py-0.5 bg-white/10 rounded">/explain</code>, <code className="px-1 py-0.5 bg-white/10 rounded">/debug</code>, or ask questions about your code
        </p>
      </div>
    </div>
  );
};

export default CopilotPanel;