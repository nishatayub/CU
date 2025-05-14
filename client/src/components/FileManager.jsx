import React from 'react';
import axios from 'axios';

const FileExplorer = ({ fileTree, onFileClick, onAdd, onDelete, currentFile }) => {
  const renderTree = (nodes, path = []) => {
    return nodes.map((node, i) => (
      <div key={i} className="ml-4 mt-1">
        <div className={`flex items-center justify-between text-sm ${
          currentFile === node.name ? 'bg-blue-600' : ''
        }`}>
          <span
            className="cursor-pointer hover:underline flex-grow p-1"
            onClick={() => node.type === 'file' && onFileClick(node.name)}
          >
            {node.type === 'folder' ? '📁' : '📄'} {node.name}
          </span>
          <span className="text-xs space-x-1">
            {node.type === 'folder' && (
              <>
                <button 
                  className="px-2 py-1 bg-green-600 rounded"
                  onClick={() => onAdd(node.name, 'file')}
                >
                  +File
                </button>
              </>
            )}
            <button 
              className="px-2 py-1 bg-red-600 rounded"
              onClick={() => onDelete(node.name)}
            >
              ❌
            </button>
          </span>
        </div>
        {node.type === 'folder' && renderTree(node.children, [...path, node.name])}
      </div>
    ));
  };

  return (
    <div className="bg-gray-900 text-white p-3 h-screen overflow-y-auto w-64">
      <div className="mb-2 font-bold flex justify-between items-center">
        <span>📁 Files</span>
        <button
          onClick={() => onAdd(null, 'file')}
          className="text-xs bg-green-600 px-2 py-1 rounded"
        >
          + New File
        </button>
      </div>
      {renderTree(fileTree)}
    </div>
  );
};

export default FileExplorer;
