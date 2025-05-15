import React, { useEffect, useRef, useState } from 'react';
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
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Socket initialization and event handling
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    const socket = socketRef.current;

    // Emit join room with username immediately when connecting
    if (roomId && state?.username) {
      socket.emit('join-room', {
        roomId,
        username: state.username
      });

      // Add current user to users list immediately
      setUsers(prev => Array.from(new Set([...prev, state.username])));
    }

    socket.on('update-user-list', (userList) => {
      console.log('Received user list:', userList);
      setUsers(userList);
    });

    socket.on('user-joined', ({ username }) => {
      console.log('User joined:', username);
      setUsers(prev => Array.from(new Set([...prev, username])));
    });

    socket.on('user-left', ({ username }) => {
      console.log('User left:', username);
      setUsers(prev => prev.filter(user => user !== username));
    });

    socket.on('receive-message', (data) => {
      setMessages(prev => [...prev, data]);
      if (activeTab !== 'chat') {
        setUnreadCount(prev => prev + 1);
      }
    });

    socket.on('code-change', ({ fileName, newCode }) => {
      if (fileName === currentFile) {
        setCode(newCode);
      }
      setFiles(prev => ({
        ...prev,
        [fileName]: newCode
      }));
    });

    return () => {
      socket.off('update-user-list');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('receive-message');
      socket.off('code-change');
      socket.disconnect();
    };
  }, [roomId, state?.username, activeTab, currentFile]);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadCount(0);
    }
  }, [activeTab]);

  // Add this useEffect to load the last opened file
  useEffect(() => {
    const lastOpenedFile = localStorage.getItem('lastOpenedFile');
    if (lastOpenedFile) {
      handleFileClick(lastOpenedFile);
    }
  }, [files]); // Run when files are loaded

  // Update this useEffect for file operations
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('file-created', ({ fileName, content }) => {
        console.log('Received file-created event:', { fileName, content });
        // Immediately update files state with the new file
        setFiles(prev => ({
          ...prev,
          [fileName]: content
        }));
      });

      socketRef.current.on('file-deleted', ({ fileName }) => {
        console.log('Received file deletion:', fileName);
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

      socketRef.current.on('file-updated', ({ fileName, content }) => {
        setFiles(prev => ({
          ...prev,
          [fileName]: content
        }));
        if (currentFile === fileName) {
          setCode(content);
        }
      });

      return () => {
        socketRef.current.off('file-created');
        socketRef.current.off('file-deleted');
        socketRef.current.off('file-updated');
      };
    }
  }, []); // Remove dependencies to prevent re-subscription

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/files/${roomId}`);
      const filesData = {};
      for (const file of response.data.files) {
        const contentRes = await axios.get(`${BACKEND_URL}/api/files/${roomId}/${file}`);
        filesData[file] = contentRes.data.content;
      }
      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileClick = async (fileName) => {
    try {
      if (!files[fileName]) {
        const response = await axios.get(`${BACKEND_URL}/api/files/${fileName}`);
        setFiles((prev) => ({
          ...prev,
          [fileName]: response.data.content,
        }));
      }
      setCurrentFile(fileName);
      setCode(files[fileName] || '// Start typing...');
      localStorage.setItem('lastOpenedFile', fileName); // Save to localStorage
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleAddNode = async (fileName) => {
    try {
      const template = getTemplateForFile(fileName);
      
      const response = await axios.post(`${BACKEND_URL}/api/files/${roomId}`, {
        name: fileName,
        content: template
      });

      if (response.data.success) {
        // Update local state
        setFiles(prev => ({
          ...prev,
          [fileName]: response.data.content
        }));
        
        // Immediately emit to all users in the room
        socketRef.current.emit('file-created', {
          roomId,
          fileName,
          content: response.data.content
        });
        
        setCurrentFile(fileName);
        setCode(response.data.content);
        
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
        const newFiles = { ...files };
        delete newFiles[fileName];
        setFiles(newFiles);

        // Clear editor if deleted file was open
        if (currentFile === fileName) {
          setCurrentFile(null);
          setCode('');
        }

        // Always clear localStorage for this file
        if (localStorage.getItem('lastOpenedFile') === fileName) {
          localStorage.removeItem('lastOpenedFile');
          console.log('Cleared localStorage for file:', fileName);
        }

        // Notify other users in the room
        socketRef.current.emit('file-deleted', {
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

  const handleCodeChanges = (value) => {
    if (!currentFile || !socketRef.current) return;

    setCode(value);
    setFiles((prev) => ({
      ...prev,
      [currentFile]: value,
    }));

    // Emit changes immediately
    socketRef.current.emit('code-change', {
      roomId,
      fileName: currentFile,
      newCode: value,
    });

    // Save to server with debounce
    debouncedSave(currentFile, value);
  };

  const debouncedSave = useRef(
    _.debounce(async (fileName, content) => {
      try {
        await axios.post(`${BACKEND_URL}/api/files/${roomId}`, {
          name: fileName,
          content: content,
        });
        
        // Notify other users in the room
        socketRef.current.emit('file-updated', {
          roomId,
          fileName,
          content
        });
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }, 1000)
  ).current;

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
