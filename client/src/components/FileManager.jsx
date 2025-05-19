import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFile, FiTrash2 } from 'react-icons/fi';

const FileExplorer = ({
  fileTree,
  onFileClick,
  onAdd,
  onDelete,
  currentFile,
  className = ''
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const startCreating = () => {
    setIsCreating(true);
    setNewItemName('');
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (newItemName) {
      onAdd(newItemName, 'file');
      setNewItemName('');
      setIsCreating(false);
    }
  };

  return (
    <div className={`text-white ${className}`}>
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startCreating}
          className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl hover:from-purple-500/30 hover:via-blue-500/30 hover:to-cyan-500/30 transition-all duration-200"
        >
          <div className="flex items-center gap-2 justify-center">
            <FiFile className="text-purple-400" />
            <span>New File</span>
          </div>
        </motion.button>
      </div>

      {/* Creation Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="mb-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={'filename.js'}
                className="flex-1 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 text-white font-medium hover:opacity-90 transition-all duration-200 border border-white/10"
              >
                Create
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Flat File List */}
      <div className="space-y-1">
        {fileTree.filter(item => item.type !== 'folder').map((item) => (
          <motion.div
            key={item.name}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-200 group ${currentFile === item.name ? 'bg-white/10' : ''}`}
          >
            <button
              onClick={() => onFileClick(item.name)}
              className="flex items-center gap-2 flex-1"
            >
              <FiFile className="text-purple-400" />
              <span>{item.name}</span>
            </button>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(item.name)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <FiTrash2 className="text-red-400" size={14} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Folder logic removed; only flat file list is supported

export default FileExplorer;
