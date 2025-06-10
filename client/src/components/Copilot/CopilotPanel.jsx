import React, { useState } from 'react';
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
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-800/25 text-white overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-white/10 flex-shrink-0">
        <FaRobot className="text-purple-300" size={20} />
        <span className="font-medium">GitHub Copilot</span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0">
        {responses.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${
            item.type === 'question' 
              ? 'bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 border border-white/10' 
              : 'bg-gradient-to-r from-blue-500/25 via-cyan-500/25 to-purple-500/25 border border-white/15'
          }`}>
            <pre className="text-sm whitespace-pre-wrap break-words overflow-hidden">{item.content}</pre>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <p className="text-sm text-white/60 mb-2 break-words">
          💡 Tip: For the best experience, use GitHub Copilot directly in your editor with:
          <br />- Inline suggestions (as you type)
          <br />- Command+I for immediate suggestions
          <br />- Command+Shift+I for Copilot Chat
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 min-w-0">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type /help for commands..."
            className="flex-1 min-w-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 text-white rounded-xl px-4 py-2 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500/30 backdrop-blur-xl"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 flex-shrink-0 ${
              !prompt.trim()
                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-purple-500/20'
            }`}
          >
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CopilotPanel;