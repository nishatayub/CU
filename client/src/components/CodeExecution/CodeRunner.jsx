import React, { useState } from 'react';
import { FaPlay, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CodeRunner = ({ currentFile, code, children, onRunCode }) => {
  const [output, setOutput] = useState('');
  const [isOutputVisible, setIsOutputVisible] = useState(false);

  const handleRun = async (e) => {
    e.preventDefault();
    try {
      const response = await onRunCode();
      setOutput(response.data.output || 'No output');
      setIsOutputVisible(true); // Show output section when running code
    } catch (error) {
      setOutput(error.message);
      setIsOutputVisible(true);
    }
  };

  const toggleOutput = () => {
    setIsOutputVisible(!isOutputVisible);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-white">{currentFile}</span>
        <button 
          onClick={handleRun}
          type="button"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded cursor-pointer z-10"
        >
          <FaPlay className="inline mr-2" size={12} />
          Run
        </button>
      </div>
      <div className="flex-1" style={{ height: isOutputVisible ? 'calc(100vh - 400px)' : '100vh' }}>
        {children}
      </div>
      {isOutputVisible && (
        <div className="bg-gray-900 border-t border-gray-700">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
            <span className="text-white text-sm">Output</span>
            <button
              onClick={toggleOutput}
              className="text-gray-400 hover:text-white"
            >
              <FaChevronDown size={14} />
            </button>
          </div>
          <div className="h-[300px] overflow-auto p-4 font-mono text-white">
            <pre>{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeRunner;