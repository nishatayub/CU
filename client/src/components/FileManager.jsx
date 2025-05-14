import React, { useState } from 'react';
import axios from 'axios';

const FileExplorer = ({ fileTree, onFileClick, onAdd, onDelete, currentFile }) => {
  const [newFileName, setNewFileName] = useState('');

  const handleAddFile = async () => {
    const fileName = prompt('Enter file name (with extension):', 'newfile.js');
    if (!fileName) return; // User cancelled

    if (!fileName.includes('.')) {
      alert('Please include a file extension (e.g., .js, .py, .java)');
      return;
    }

    try {
      await onAdd(fileName);
      console.log('File created:', fileName);
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to create file: ' + error.message);
    }
  };

  const renderTree = (nodes) => {
    if (!Array.isArray(nodes)) return null;

    return nodes.map((node, i) => (
      <div key={`${node.name}-${i}`} className="ml-4 mt-1">
        <div className={`flex items-center justify-between text-sm p-1 rounded ${
          currentFile === node.name ? 'bg-blue-600' : 'hover:bg-gray-800'
        }`}>
          <span
            className="cursor-pointer flex-grow p-1"
            onClick={() => node.type === 'file' && onFileClick(node.name)}
          >
            {node.type === 'file' ? '📄' : '📁'} {node.name}
          </span>
          <div className="flex space-x-2">
            <button 
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              onClick={() => onDelete(node.name)}
              title="Delete"
            >
              Delete
            </button>
          </div>
        </div>
        {node.type === 'folder' && renderTree(node.children)}
      </div>
    ));
  };

  return (
    <div className="bg-gray-900 text-white p-4 h-full overflow-y-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>📁</span> Files
        </h2>
        <button
          onClick={handleAddFile}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
        >
          <span>+</span> New File
        </button>
      </div>
      <div className="space-y-1">
        {renderTree(fileTree)}
      </div>
    </div>
  );
};

export default FileExplorer;
