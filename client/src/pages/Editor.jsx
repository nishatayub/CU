import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import FileExplorer from '../components/FileManager';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import axios from 'axios';
import _ from 'lodash';
import UserList from '../components/UserList';
import CodeRunner from '../components/CodeExecution/CodeRunner';
import { getTemplateForFile } from '../utils/codeTemplates';
import CopilotPanel from '../components/Copilot/CopilotPanel';

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
    'html': 'html',
    'css': 'css',
    'json': 'json',
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
      
      // Emit event to notify other users
      socketRef.current?.emit('file-opened', { roomId, fileName });
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
      console.log('Connected to server');
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
      console.log('Received files list update');
      const filesData = {};
      files.forEach(file => {
        filesData[file.fileName] = file.content;
      });
      setFiles(filesData);
    });

    socket.on('file-created', ({ fileName, content }) => {
      console.log('Received new file:', fileName);
      setFiles(prev => ({
        ...prev,
        [fileName]: content
      }));
    });

    socket.on('file-deleted', ({ fileName }) => {
      console.log('File deleted:', fileName);
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
      console.log('Received real-time update:', fileName);
      setFiles(prev => ({
        ...prev,
        [fileName]: content
      }));
      if (currentFile === fileName && content !== code) {
        setCode(content);
      }
    });

    socket.on('file-updated', ({ fileName, content }) => {
      console.log('Received saved update:', fileName);
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
        
        console.log('File created and broadcasted:', fileName);
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
        
        console.log('File deleted and broadcasted:', fileName);
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
          <UserList 
            socket={socketRef.current}
            currentUser={state?.username}
            users={[state?.username, ...users].filter(Boolean)}
          />
        );
      case 'files':
        return (
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
          />
        );
      case 'draw':
        return (
          <div className="w-full h-full bg-gray-800">
            <Tldraw
              persistenceKey={`drawing-${roomId}`}
              className="h-full w-full"
              autoFocus={false}
            />
          </div>
        );
      case 'chat':
        return (
          <ChatBox
            socket={socketRef.current}
            roomId={roomId}
            username={state?.username}
          />
        );
      case 'copilot':
        return (
          <CopilotPanel
            currentFile={currentFile}
            code={code}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
      />
      <div className="flex-1 flex">
        {activeTab === 'draw' ? (
          renderActiveTab()
        ) : (
          <>
            <div className="w-64 border-r border-gray-700">
              {renderActiveTab()}
            </div>
            <div className="flex-1">
              <CodeRunner 
                currentFile={currentFile} 
                code={code}
                onRunCode={handleRunCode}
              >
                <MonacoEditor
                  height="100%"
                  language={currentFile ? getLanguageFromFileName(currentFile) : 'javascript'}
                  theme="vs-dark"
                  value={code}
                  onChange={handleCodeChanges}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true
                  }}
                />
              </CodeRunner>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Editor;
