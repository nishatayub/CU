import React, { useState, useEffect } from 'react';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';

const CopilotPanel = ({ currentFile, code }) => {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState([]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Add user's question to responses
    setResponses(prev => [...prev, {
      type: 'question',
      content: prompt
    }]);

    // Add a note about using VS Code's Copilot
    setResponses(prev => [...prev, {
      type: 'answer',
      content: 'GitHub Copilot works best directly in your editor. Try:\n\n' +
        '1. Type code and wait for inline suggestions\n' +
        '2. Press Ctrl+I (Cmd+I on Mac) for inline suggestions\n' +
        '3. Use /explain in comments for explanations\n' +
        '4. Open Copilot Chat panel (Ctrl+Shift+I) for more help'
    }]);

    setPrompt('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <FaRobot className="text-blue-400" size={20} />
        <span className="font-medium">GitHub Copilot</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {responses.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${
            item.type === 'question' 
              ? 'bg-gray-800' 
              : 'bg-blue-600'
          }`}>
            <pre className="text-sm whitespace-pre-wrap">{item.content}</pre>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <p className="text-sm text-gray-400 mb-2">
          💡 Tip: For the best experience, use GitHub Copilot directly in your editor with:
          <br />- Inline suggestions (as you type)
          <br />- Command+I for immediate suggestions
          <br />- Command+Shift+I for Copilot Chat
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type /help for Copilot commands..."
            className="flex-1 bg-gray-800 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              !prompt.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <FaPaperPlane size={14} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default CopilotPanel;