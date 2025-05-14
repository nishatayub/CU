import React from 'react';

const OutputPanel = ({ output, isError }) => {
  return (
    <div className="bg-gray-900 text-white p-4 h-[200px] overflow-y-auto">
      <div className="font-mono whitespace-pre">
        {isError ? (
          <span className="text-red-400">{output}</span>
        ) : (
          <span className="text-green-400">{output}</span>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;