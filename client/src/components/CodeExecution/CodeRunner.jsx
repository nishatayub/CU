import React, { useState } from 'react';
import { FaPlay, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CodeRunner = ({ currentFile, code, children, onRunCode }) => {
  const [output, setOutput] = useState('');
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async (e) => {
    e.preventDefault();
    setIsOutputVisible(true);
    if (!code || !currentFile) {
      setOutput('Please open a file and write some code first.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await onRunCode();
      if (response && response.data && typeof response.data.output !== 'undefined') {
        setOutput(String(response.data.output));
      } else if (response && response.data) {
        setOutput('No output returned. Full response: ' + JSON.stringify(response.data));
      } else {
        setOutput('No output and no response from server.');
      }
    } catch (error) {
      setOutput((error && error.message) ? error.message : 'An error occurred while running the code');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOutput = () => {
    setIsOutputVisible(!isOutputVisible);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 backdrop-blur-xl">
        <span className="text-white font-medium">{currentFile || 'No File Selected'}</span>
        <button 
          onClick={handleRun}
          disabled={isLoading}
          className={`px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/25 via-blue-500/25 to-cyan-500/25 text-white font-medium transition-all duration-200 border border-white/15 hover:from-purple-500/35 hover:via-blue-500/35 hover:to-cyan-500/35 flex items-center gap-2 shadow-lg shadow-purple-500/20
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaPlay className="text-sm" />
          {isLoading ? 'Running...' : 'Run'}
        </button>
      </div>

      {/* Editor and Output Panel stacked with flex, no overlap or wasted space */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0">
          {children}
        </div>
        <div 
          className={`bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-800/25 border-t border-white/10 transition-all duration-300 ease-in-out ${
            isOutputVisible ? 'h-[300px]' : 'h-0'
          } overflow-hidden`}
        >
          <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 backdrop-blur-xl">
            <span className="text-white font-medium flex items-center gap-2">
              Output
              {isLoading && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/20">
                  Running...
                </span>
              )}
            </span>
            <button
              onClick={toggleOutput}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
            >
              {isOutputVisible ? <FaChevronDown size={14} /> : <FaChevronUp size={14} />}
            </button>
          </div>
          <div className="h-[calc(100%-40px)] overflow-auto p-4 font-mono text-white/90">
            <pre className="whitespace-pre-wrap break-words">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRunner;