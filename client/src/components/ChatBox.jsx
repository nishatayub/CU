import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

const ChatBox = ({ socket, roomId, username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    // Check initial connection status
    setIsConnected(socket.connected);

    // Listen for connection status changes
    const onConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
      // Request chat history when connected
      if (roomId) {
        console.log('Requesting chat history for room:', roomId);
        socket.emit('get-chat-history', { roomId });
      }
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    // Listen for chat history
    const onChatHistory = (history) => {
      console.log('Received chat history:', history);
      setMessages(history || []);
      setTimeout(scrollToBottom, 100);
    };

    // Listen for new messages
    const onReceiveMessage = (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
      setTimeout(scrollToBottom, 50);
    };

    // Listen for chat notifications
    const onChatNotification = (notification) => {
      console.log('Received chat notification:', notification);
      if (typeof window !== 'undefined' && document.hidden) {
        // Optionally show browser notification
      }
    };

    // Add event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chat-history', onChatHistory);
    socket.on('receive-message', onReceiveMessage);
    socket.on('chat-notification', onChatNotification);

    // If already connected, request chat history
    if (socket.connected && roomId) {
      console.log('Socket already connected, requesting chat history for room:', roomId);
      socket.emit('get-chat-history', { roomId });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat-history', onChatHistory);
      socket.off('receive-message', onReceiveMessage);
      socket.off('chat-notification', onChatNotification);
    };
  }, [socket, roomId, username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasSocket: !!socket,
        socketConnected: socket?.connected,
        isConnected
      });
      return;
    }

    const messageData = {
      roomId,
      username,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', messageData);
    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-cyan-800/25 max-w-full overflow-hidden">
      {/* Connection status indicator */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0">
        <span className="text-sm font-medium text-white">Chat</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className={`text-xs ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
        style={{ height: 'calc(100% - 120px)' }} // Account for header and input
      >
        {messages.map((msg, index) => (
          <motion.div
            key={`${msg.username}-${msg.timestamp}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              msg.type === 'system' 
                ? 'justify-center' 
                : msg.username === username 
                  ? 'justify-end' 
                  : 'justify-start'
            }`}
          >
            {msg.type === 'system' ? (
              // System message (join/leave notifications)
              <div className="bg-gradient-to-r from-gray-500/20 via-gray-400/20 to-gray-500/20 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-lg">
                <div className="text-white/80 text-sm text-center">
                  {msg.text}
                </div>
              </div>
            ) : (
              // Regular user message
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.username === username
                    ? 'bg-gradient-to-r from-purple-500/25 via-blue-500/25 to-cyan-500/25 ml-auto backdrop-blur-xl border border-white/15 shadow-lg shadow-purple-500/20'
                    : 'bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-blue-500/25 backdrop-blur-xl border border-white/15 shadow-lg shadow-pink-500/20'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {msg.username === username ? 'You' : msg.username}
                </div>
                <div className="text-white break-words">{msg.text}</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex-shrink-0 p-2 bg-gradient-to-r from-purple-900/20 via-blue-900/15 to-cyan-800/10 border-t border-white/10">
        <div className="flex items-center gap-1 w-full pr-1">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-w-0 max-w-[calc(100%-44px)] bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/15 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className={`w-10 h-10 flex-shrink-0 rounded-xl ${
              !newMessage.trim() || !isConnected
                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-purple-500/20'
            } text-white flex items-center justify-center transition-all duration-200 shadow-lg shadow-purple-500/25`}
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
