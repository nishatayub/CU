import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import ChatBox from './components/ChatBox';

const BACKEND_URL = import.meta.env.PROD 
  ? 'https://cu-669q.onrender.com'
  : 'http://localhost:8080';
const socket = io(BACKEND_URL);

function App() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });
    return () => socket.disconnect();
  }, []);

  return (
    
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:roomId" element={<Editor />} />
        <Route path="/chats/:roomId" element={<ChatBox />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
