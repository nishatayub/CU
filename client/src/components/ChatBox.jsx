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
    const onChatHistory = (history) => {
      setMessages(history);
      scrollToBottom();
    };
    socket.on('chat-history', onChatHistory);

    // Listen for new messages
    const onReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };
    socket.on('receive-message', onReceiveMessage);

    // Listen for chat notifications
    const onChatNotification = (notif) => {
      // You can show a toast, badge, or update unread count here
      // Example: window.alert(`${notif.username} sent a new message: ${notif.text}`);
      // Or increment unread count if not in chat tab
      if (typeof window !== 'undefined' && document.hidden) {
        // Optionally show browser notification
      }
    };
    socket.on('chat-notification', onChatNotification);

    // Always request chat history when ChatBox mounts
    if (roomId) {
      socket.emit('get-chat-history', { roomId });
    }

    return () => {
      socket.off('chat-history', onChatHistory);
      socket.off('receive-message', onReceiveMessage);
      socket.off('chat-notification', onChatNotification);
    };
  }, [socket, roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      roomId,
      username,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Do NOT optimistically add the message here; wait for receive-message event
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
