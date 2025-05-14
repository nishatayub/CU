import React, { useState, useEffect } from 'react';

const ChatBox = ({ socket, roomId, username, messages = [], setMessages }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', ({ username, message }) => {
      setMessages(prev => [...prev, { username, message }]);
    });

    return () => {
      socket.off('receive-message');
    };
  }, [socket, setMessages]);

  const sendMessage = () => {
    if (!socket || !text.trim()) return;

    socket.emit('send-message', { roomId, username, message: text });
    setMessages(prev => [...prev, { username, message: text }]);
    setText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="bg-gray-800 text-white p-2 flex flex-col h-48">
      <div className="flex-1 overflow-y-auto mb-2">
        {Array.isArray(messages) && messages.map((m, i) => (
          <div 
            key={`${m.username}-${i}`}
            className={`mb-1 p-1 rounded ${
              m.username === username ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <strong>{m.username}:</strong> {m.message}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 p-1 text-black rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type message..."
        />
        <button 
          onClick={sendMessage} 
          className="ml-2 bg-blue-600 px-3 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
