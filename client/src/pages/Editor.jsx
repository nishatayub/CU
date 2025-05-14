import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react';
import Sidebar from '../components/SideBar';
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

const BACKEND_URL = 'http://localhost:8080';

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
    socketRef.current = io(BACKEND_URL);
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

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/files`);
      const filesData = {};
      for (const file of response.data.files) {
        const contentRes = await axios.get(`${BACKEND_URL}/api/files/${file}`);
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
      console.log('Creating new file:', fileName);
      const template = getTemplateForFile(fileName);

      const response = await axios.post(`${BACKEND_URL}/api/files`, {
        name: fileName,
        content: template
      });

      if (response.data.success) {
        setFiles(prev => ({
          ...prev,
          [fileName]: response.data.content
        }));

        setCurrentFile(fileName);
        setCode(response.data.content);
        console.log('File created successfully:', fileName);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to create file: ' + error.message);
    }
  };

  const handleDeleteNode = async (fileName) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/files/${fileName}`);
      if (currentFile === fileName) {
        setCurrentFile(null);
        setCode('// Start typing...');
      }
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

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
        await axios.post(`${BACKEND_URL}/api/files/save`, {
          filename: fileName,
          content: content,
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
                  height="100%" // Changed from fixed height to 100%
                  defaultLanguage="javascript"
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
