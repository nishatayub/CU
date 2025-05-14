import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react';
import Sidebar from '../components/SideBar';
import ChatBox from '../components/ChatBox';
import FileExplorer from '../components/FileManager';
import { Tldraw } from 'tldraw';
import axios from 'axios';
import Panel from '../components/Panel';

let socket;

const Editor = () => {
  const { roomId } = useParams();
  const { state } = useLocation();
  const [code, setCode] = useState('// Start typing...');
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('files');
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState(null);

  useEffect(() => {
    socket = io('http://localhost:8080');

    socket.emit('join-room', { roomId, username: state?.username });

    socket.on('update-user-list', (userList) => {
      setUsers(userList);
    });

    socket.on('receive-message', ({ username, message }) => {
      setMessages((prev) => [...prev, { username, message }]);
    });

    socket.on('user-joined', ({ username }) => {
      setMessages((prev) => [...prev, { username: 'System', message: `${username} joined the room` }]);
    });

    socket.on('user-left', () => {
      setMessages((prev) => [...prev, { username: 'System', message: `A user left the room` }]);
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection on unmount
    };
  }, [roomId, state?.username]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/files');
      const filesData = {};
      for (const file of response.data.files) {
        const contentRes = await axios.get(`http://localhost:8080/api/files/${file}`);
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
        const response = await axios.get(`http://localhost:8080/api/files/${fileName}`);
        setFiles((prev) => ({
          ...prev,
          [fileName]: response.data.content,
        }));
      }
      setCurrentFile(fileName);
      setCode(files[fileName] || '// Start typing...');
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleAddNode = async (parentFolder, type) => {
    const fileName = prompt(`Enter ${type} name:`);
    if (!fileName) return;

    try {
      await axios.post('http://localhost:8080/api/files/save', {
        filename: fileName,
        content: '// Start typing...',
      });
      await fetchFiles();
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleDeleteNode = async (fileName) => {
    try {
      await axios.delete(`http://localhost:8080/api/files/${fileName}`);
      if (currentFile === fileName) {
        setCurrentFile(null);
        setCode('// Start typing...');
      }
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleCodeChanges = async (value) => {
    setCode(value);
    if (currentFile) {
      setFiles((prev) => ({
        ...prev,
        [currentFile]: value,
      }));
      try {
        await axios.post('http://localhost:8080/api/files/save', {
          filename: currentFile,
          content: value,
        });
        socket.emit('code-change', { roomId, fileName: currentFile, newCode: value });
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }
  };
    const renderActiveTab = () => {
    switch (activeTab) {
      case 'files':
        return (
          <FileExplorer
            files={files}
            currentFile={currentFile}
            onFileClick={setCurrentFile}
            onFileChange={handleCodeChanges}
          />
        );
      case 'users':
        return <div className="p-4"><h2>Connected Users</h2>{users.map(u => <div key={u}>{u}</div>)}</div>;
      case 'draw':
        return <Tldraw />;
      case 'chat':
        return <ChatBox socket={socket} roomId={roomId} username={state?.username} />;
      case 'run':
        return <div className="p-4">Run functionality coming soon...</div>;
      default:
        return null;
    }
  };


  useEffect(() => {
    if (!socket) return;

    socket.on('code-change', ({ fileName, newCode }) => {
      if (fileName === currentFile) {
        setCode(newCode);
      }
      setFiles((prev) => ({
        ...prev,
        [fileName]: newCode,
      }));
    });

    return () => socket.off('code-change');
  }, [currentFile]);

  return (
    <div className="flex h-screen">
      <Sidebar users={users} />
      <div className="flex-1 flex">
        <FileExplorer
          fileTree={Object.keys(files).map((name) => ({
            name,
            type: 'file',
            content: files[name],
          }))}
          onFileClick={handleFileClick}
          onAdd={handleAddNode}
          onDelete={handleDeleteNode}
          currentFile={currentFile}
        />
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-800 text-white px-4 py-2">
            {currentFile || 'No file selected'}
          </div>
          <MonacoEditor
            height="calc(100vh - 20rem)"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleCodeChanges}
          />
          <ChatBox
            socket={socket}
            roomId={roomId}
            username={state?.username}
            messages={messages}
            setMessages={setMessages}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
