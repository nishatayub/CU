import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import FileExplorer from '../components/FileManager';
import axios from 'axios';
import _ from 'lodash';
import UserList from '../components/UserList';
import CodeRunner from '../components/CodeExecution/CodeRunner';
import { getTemplateForFile } from '../utils/codeTemplates';
import CopilotPanel from '../components/Copilot/CopilotPanel';
import MobileError from '../components/MobileError.jsx';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.PROD 
  ? 'https://cu-669q.onrender.com'
  : 'http://localhost:8080';

// Add this helper function at the top of your file
const getLanguageFromFileName = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'ts': 'typescript',
    'go': 'go',
    'rb': 'ruby',
    'php': 'php',
    'rs': 'rust',
    'kt': 'kotlin',
    'swift': 'swift',
    'md': 'markdown',
    'txt': 'plaintext'
  };
  return languageMap[extension] || 'plaintext';
};

const Editor = () => {
  const { roomId } = useParams();
  const { state } = useLocation();
  
  const socketRef = useRef(null);
  const [code, setCode] = useState('// Start typing...');
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Create persistent debounced save function
  const debouncedSaveRef = useRef();
  
  // Initialize debounced save functionality
  useEffect(() => {
    debouncedSaveRef.current = _.debounce(async (fileName, content) => {
      if (!fileName || !roomId) return;
      try {
        await axios.post(`${BACKEND_URL}/api/files/${roomId}`, {
          name: fileName,
          content: content,
        });
        
        // Notify other users in the room
        socketRef.current?.emit('file-updated', {
          roomId,
          fileName,
          content
        });
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }, 1000);

    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel();
      }
    };
  }, [roomId]);

  // Wrapper function to call the debounced save
  const saveToServer = useCallback((fileName, content) => {
    if (debouncedSaveRef.current) {
      debouncedSaveRef.current(fileName, content);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/files/${roomId}`);
      // response.data.files is an array of { fileName, content, ... }
      const filesData = {};
      response.data.files.forEach(file => {
        filesData[file.fileName] = file.content;
      });
      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }, [roomId]);



  const handleFileClick = useCallback(async (fileName) => {
    try {
      let fileContent = files[fileName];
      
      if (!fileContent) {
        // File not in local state, fetch it
        const response = await axios.get(`${BACKEND_URL}/api/files/${roomId}/${fileName}`);
        fileContent = response.data.content;
        
        // Update files state
        setFiles(prev => ({
          ...prev,
          [fileName]: fileContent
        }));
      }

      setCurrentFile(fileName);
      setCode(fileContent);
      localStorage.setItem('lastOpenedFile', fileName);
      
      // No longer emit file-opened; navigation is local only
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }, [files, roomId]);

  // Then define effects
  useEffect(() => {
    if (roomId) {
      fetchFiles();
    }
  }, [roomId, fetchFiles]);

  // Socket initialization and event handling
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      path: '/socket.io/', // Explicitly set the socket.io path
      forceNew: true // Force a new connection
    });

    const socket = socketRef.current;

    // Clean up any existing listeners to prevent duplicates
    socket.removeAllListeners();

    socket.on('connect', () => {
      if (roomId && state?.username) {
        socket.emit('join-room', { roomId, username: state.username });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('update-user-list', (userList) => {
      setUsers(userList.map(u => u.username));
    });

    // File-related socket events
    socket.on('files-list-updated', ({ files }) => {
      const filesData = {};
      files.forEach(file => {
        filesData[file.fileName] = file.content;
      });
      setFiles(filesData);
    });

    socket.on('file-created', ({ fileName, content }) => {
      setFiles(prev => ({
        ...prev,
        [fileName]: content
      }));
    });

    socket.on('file-deleted', ({ fileName }) => {
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fileName];
        return newFiles;
      });

      if (currentFile === fileName) {
        setCurrentFile(null);
        setCode('');
        localStorage.removeItem('lastOpenedFile');
      }
    });

    // Listen for both immediate updates and saved updates
    socket.on('file-content-change', ({ fileName, content }) => {
      setFiles(prev => ({
        ...prev,
        [fileName]: content
      }));
      if (currentFile === fileName && content !== code) {
        setCode(content);
      }
    });

    socket.on('file-updated', ({ fileName, content }) => {
      setFiles(prev => ({
        ...prev,
        [fileName]: content
      }));
      if (currentFile === fileName && content !== code) {
        setCode(content);
      }
    });

    // --- CHAT NOTIFICATION HANDLER ---
    socket.on('chat-notification', () => {
      // Only increment unread if not in chat tab
      setUnreadCount(prev => (activeTab !== 'chat' ? prev + 1 : prev));
      // Optionally, show a toast or browser notification here
    });

    return () => {
      socket.off('files-list-updated');
      socket.off('file-created');
      socket.off('file-deleted');
      socket.off('file-content-change');
      socket.off('file-updated');
      socket.off('chat-notification');
      socket.disconnect();
    };
  }, [roomId, state?.username, currentFile, code, activeTab]);

  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadCount(0);
    }
  }, [activeTab]);

  // Add this useEffect to load the last opened file
  useEffect(() => {
    const lastOpenedFile = localStorage.getItem('lastOpenedFile');
    if (lastOpenedFile && files[lastOpenedFile]) {
      handleFileClick(lastOpenedFile);
    }
  }, [files, handleFileClick]); // Include handleFileClick in dependencies

  const handleAddNode = async (fileName) => {
    try {
      const template = getTemplateForFile(fileName);
      
      // First update MongoDB through the API
      const response = await axios.post(`${BACKEND_URL}/api/files/${roomId}`, {
        name: fileName,
        content: template,
        roomId
      });

      if (response.data.success) {
        // Update local state immediately
        const fileContent = response.data.content || template;
        setFiles(prev => ({
          ...prev,
          [fileName]: fileContent
        }));
        
        // Emit socket event for real-time sync
        socketRef.current?.emit('file-created', {
          roomId,
          fileName,
          content: fileContent
        });
        
        // Set as current file and update editor
        setCurrentFile(fileName);
        setCode(fileContent);
      }
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleDeleteNode = async (fileName) => {
    try {
      if (!fileName || !roomId) {
        console.error('Missing fileName or roomId:', { fileName, roomId });
        return;
      }

      const response = await axios.delete(`${BACKEND_URL}/api/files/${roomId}/${fileName}`);

      if (response.data.success) {
        // Remove from files state
        setFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[fileName];
          return newFiles;
        });

        // Clear editor if deleted file was open
        if (currentFile === fileName) {
          setCurrentFile(null);
          setCode('');
          localStorage.removeItem('lastOpenedFile');
        }

        // Notify other users
        socketRef.current?.emit('file-deleted', {
          roomId,
          fileName
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(`Failed to delete file: ${error.message}`);
    }
  };

  // Add this useEffect to handle file cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup function
      const lastOpenedFile = localStorage.getItem('lastOpenedFile');
      if (lastOpenedFile && !files[lastOpenedFile]) {
        localStorage.removeItem('lastOpenedFile');
      }
    };
  }, [files]);

  const handleCodeChanges = useCallback((value) => {
    if (!currentFile || !socketRef.current) return;

    // Update local state
    setCode(value);
    setFiles(prev => ({
      ...prev,
      [currentFile]: value,
    }));

    // Emit code change immediately for real-time sync
    socketRef.current.emit('file-content-change', {
      roomId,
      fileName: currentFile,
      content: value,
    });

    // Save to server with debounce (this will emit file-updated event)
    saveToServer(currentFile, value);
  }, [currentFile, roomId, saveToServer]);

  const handleRunCode = async () => {
    if (!currentFile || !code) return null;

    try {
      const fileExt = currentFile.split('.').pop();
      const response = await axios.post(`${BACKEND_URL}/api/execute`, {
        language: fileExt,
        code: code
      });

      if (response.data.output) {
        socketRef.current.emit('code-output', {
          roomId,
          output: response.data.output
        });
      }

      return response; // Return the response so CodeRunner can access it
    } catch (error) {
      console.error('Error executing code:', error);
      socketRef.current.emit('code-output', {
        roomId,
        output: `Error: ${error.message}`
      });
      throw error; // Throw the error so CodeRunner can handle it
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="h-full bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-800/25 backdrop-blur-xl">
            <motion.div 
              className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-white font-medium flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300">
                  Active Users
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-purple-500/25 via-blue-500/25 to-cyan-500/25 text-white/90 border border-white/15">
                  Live
                </span>
              </h2>
            </motion.div>
            <UserList 
              socket={socketRef.current}
              currentUser={state?.username}
              users={Array.from(new Set([state?.username, ...users].filter(Boolean)))}
              className="p-4 space-y-2"
            />
          </div>
        );
      case 'files':
        return (
          <div className="h-full bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-800/25 backdrop-blur-xl">
            <motion.div 
              className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-white font-medium flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300">
                  Files
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-purple-500/25 via-blue-500/25 to-cyan-500/25 text-white/90 border border-white/15">
                  Live
                </span>
              </h2>
            </motion.div>
            <FileExplorer
              fileTree={Object.keys(files).map((name) => ({
                name,
                type: 'file',
                content: files[name]
              }))}
              onFileClick={handleFileClick}
              onAdd={handleAddNode}
              onDelete={handleDeleteNode}
              currentFile={currentFile}
              socket={socketRef.current}
              roomId={roomId}
              className="p-4"
              hideFolderActions={true}
            />
          </div>
        );
      case 'chat':
        return (
          <div className="h-full flex flex-col bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-800/25">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-blue-500/8 to-cyan-500/8"></div>
            <motion.div 
              className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-white font-medium flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300">
                  Code Chat
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-purple-500/25 via-blue-500/25 to-cyan-500/25 text-white/90 border border-white/15">
                  Live
                </span>
              </h2>
            </motion.div>
            <div className="relative flex-1 overflow-hidden">
              <ChatBox
                socket={socketRef.current}
                roomId={roomId}
                username={state?.username}
              />
            </div>
          </div>
        );
      case 'copilot':
        return (
          <div className="h-full bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-800/25 backdrop-blur-xl">
            <motion.div 
              className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-white font-medium flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300">
                  AI Assistant
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-purple-500/25 via-blue-500/25 to-cyan-500/25 text-white/90 border border-white/15">
                  Live
                </span>
              </h2>
            </motion.div>
            <CopilotPanel
              currentFile={currentFile}
              code={code}
              className="p-4"
            />
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileError />;
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/90 to-cyan-800/85"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/8 via-blue-500/8 to-cyan-500/8 mix-blend-overlay"></div>
        {/* Floating geometric elements for visual consistency */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/15 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-500/15 blur-2xl"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex h-full">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-20 border-r border-white/10 bg-gradient-to-b from-purple-900/50 via-blue-900/40 to-cyan-800/30 backdrop-blur-xl z-20"
        >
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadCount={unreadCount}
            className="h-full"
          />
        </motion.div>

        {/* Main Editor Area */}
        <div className="flex-1 flex">{
            <>
              {/* Left Panel */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-64 border-r border-white/10 bg-gradient-to-br from-purple-900/30 via-blue-900/25 to-cyan-800/20 backdrop-blur-xl overflow-y-auto overflow-x-hidden min-w-0 max-w-[256px]"
              >
                {renderActiveTab()}
              </motion.div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-0 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-blue-500/8 to-cyan-500/8"></div>
                <div className="relative flex flex-col h-full min-h-0">
                  {/* Editor Header */}
                  <motion.div 
                    className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 backdrop-blur-xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-white font-medium">
                        {currentFile || 'No File Selected'}
                      </h2>
                      {currentFile && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 text-sm border border-white/15 backdrop-blur-xl text-gray-200">
                            {getLanguageFromFileName(currentFile)}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Code Editor and Output Panel */}
                  <div className="flex-1 min-h-0 flex flex-col">
                    <CodeRunner 
                      currentFile={currentFile} 
                      code={code}
                      onRunCode={handleRunCode}
                    >
                      <MonacoEditor
                        height="100%"
                        language={currentFile ? getLanguageFromFileName(currentFile) : 'javascript'}
                        theme="vs-dark"
                        defaultValue={code}
                        onChange={(value) => {
                          if (value !== code) handleCodeChanges(value);
                        }}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          automaticLayout: true,
                          background: '#0F0A1A',
                          padding: { top: 16, bottom: 16 },
                          scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            useShadows: false,
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8
                          },
                          lineHeight: 1.6,
                          letterSpacing: 0.5,
                          fontFamily: "'JetBrains Mono', monospace",
                          smoothScrolling: true,
                          cursorBlinking: "smooth",
                          cursorSmoothCaretAnimation: true,
                          renderWhitespace: "none",
                          glyphMargin: false,
                          renderLineHighlight: "all",
                          contextmenu: true,
                          mouseWheelZoom: true,
                          quickSuggestions: true,
                          roundedSelection: true,
                          wordWrap: "on"
                        }}
                        className="border-l border-white/10"
                        key={currentFile}
                      />
                    </CodeRunner>
                  </div>
                </div>
              </div>
            </>
}
        </div>
      </div>
    </div>
  );
};

export default Editor;
