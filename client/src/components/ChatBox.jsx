import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

const ChatBox = ({ socket, roomId, username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for chat history
    const onChatHistory = (history) => {
      setMessages(history);
      setTimeout(scrollToBottom, 100); // Delay to ensure rendering is complete
    };
    socket.on('chat-history', onChatHistory);

    // Listen for new messages
    const onReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
      setTimeout(scrollToBottom, 50);
    };
    socket.on('receive-message', onReceiveMessage);

    // Listen for chat notifications
    const onChatNotification = () => {
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

    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-900 to-black max-w-full overflow-hidden">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent"
        style={{ height: 'calc(100% - 60px)' }} // Account for smaller input area
      >
        {messages.map((msg, index) => (
          <motion.div
            key={`${msg.username}-${msg.timestamp}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.username === username
                  ? 'bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 ml-auto backdrop-blur-xl border border-white/10'
                  : 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/10'
              }`}
            >
              <div className="text-xs text-gray-400 mb-1">
                {msg.username === username ? 'You' : msg.username}
              </div>
              <div className="text-white break-words">{msg.text}</div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex-shrink-0 p-2 bg-black/40 border-t border-white/5">
        <div className="flex items-center gap-1 w-full pr-1">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-w-0 max-w-[calc(100%-44px)] bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim()}
            className={`w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white flex items-center justify-center transition-all duration-200 shadow-lg shadow-purple-500/20 ${
              !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
            aria-label="Send message"
          >
            <FaPaperPlane size={14} />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
