import React, { useState, useEffect, useRef } from 'react';

const ChatBox = ({ socket, roomId, username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for chat history
    socket.on('chat-history', (history) => {
      console.log('Received chat history:', history);
      setMessages(history);
      scrollToBottom();
    });

    // Listen for new messages
    socket.on('receive-message', (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.off('chat-history');
      socket.off('receive-message');
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      roomId,
      username,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Only emit the message, don't update local state directly
    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={`${msg.username}-${msg.timestamp}-${index}`}
            className={`flex flex-col ${
              msg.username === username ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.username === username
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-700 text-white rounded-tl-none'
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {msg.username === username ? 'You' : msg.username}
              </div>
              <div className="break-words">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`px-4 py-2 rounded font-medium ${
              newMessage.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
