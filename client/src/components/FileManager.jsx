import React, { useState, useEffect } from 'react';

const FileExplorer = ({ fileTree, onFileClick, onAdd, onDelete, currentFile, socket, roomId }) => {
  const [files, setFiles] = useState(Array.isArray(fileTree) ? fileTree : []);

  // Listen for real-time file updates
  useEffect(() => {
    if (socket) {
      // Listen for file list updates
      socket.on('files-list-updated', ({ files }) => {
        console.log('Received files list update:', files);
        // Defensive: ensure files is always an array
        const fileArr = Array.isArray(files) ? files : Object.keys(files).map(name => ({
          name,
          type: 'file',
          content: files[name],
          updatedAt: null
        }));
        setFiles(fileArr.map(file => ({
          name: file.fileName || file.name,
          type: 'file',
          content: file.content,
          updatedAt: file.updatedAt
        })).sort((a, b) => a.name.localeCompare(b.name)));
      });

      // Listen for new files being created
      socket.on('file-created', ({ fileName, content, updatedAt }) => {
        console.log('New file created:', fileName);
        setFiles(prev => {
          // Check if file already exists
          const exists = prev.some(file => file.name === fileName);
          if (exists) return prev;

          return [...prev, {
            name: fileName,
            type: 'file',
            content,
            updatedAt
          }].sort((a, b) => a.name.localeCompare(b.name)); // Keep files sorted
        });
      });

      // Listen for files being deleted
      socket.on('file-deleted', ({ fileName }) => {
        console.log('File deleted:', fileName);
        setFiles(prev => prev.filter(file => file.name !== fileName));
        if (currentFile === fileName) {
          onFileClick(null);
        }
      });

      // Listen for file updates
      socket.on('file-content-updated', ({ fileName, content, updatedAt }) => {
        console.log('File content updated:', fileName);
        setFiles(prev => prev.map(file => {
          if (file.name === fileName) {
            return { ...file, content, updatedAt };
          }
          return file;
        }));
      });

      // Listen for file errors
      socket.on('file-error', ({ error, details }) => {
        console.error('File operation error:', error, details);
        alert(`Error: ${details}`);
      });

      // Initial file list request
      socket.emit('join-room', { roomId }); // This will trigger files-list-updated

      return () => {
        socket.off('files-list-updated');
        socket.off('file-created');
        socket.off('file-deleted');
        socket.off('file-content-updated');
        socket.off('file-error');
      };
    }
  }, [socket, currentFile, roomId, onFileClick]);

  // Update local files when fileTree prop changes
  useEffect(() => {
    if (Array.isArray(fileTree) && fileTree.length > 0) {
      setFiles(fileTree);
    }
  }, [fileTree]);

  const handleAddFile = async () => {
    const fileName = prompt('Enter file name (with extension):', 'newfile.js');
    if (!fileName) return; // User cancelled

    if (!fileName.includes('.')) {
      alert('Please include a file extension (e.g., .js, .py, .java)');
      return;
    }

    try {
      // First verify file doesn't exist
      if (files.some(file => file.name === fileName)) {
        alert('A file with this name already exists');
        return;
      }

      await onAdd(fileName);
      console.log('File creation requested:', fileName);
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to create file: ' + error.message);
    }
  };

  const handleDelete = async (fileName) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        await onDelete(fileName);
        // Emit delete event
        socket.emit('file-deleted', {
          roomId,
          fileName
        });
        console.log('File deletion requested:', fileName);
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file: ' + error.message);
      }
    }
  };

  const renderTree = (nodes) => {
    if (!Array.isArray(nodes)) return null;

    return nodes.map((node) => (
      <div key={node.name} className="ml-4 mt-1">
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
              onClick={() => handleDelete(node.name)}
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
        {renderTree(files)}
      </div>
    </div>
  );
};

export default FileExplorer;
