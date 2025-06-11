import React from 'react';
import { 
  FaUsers, 
  FaFile, 
  FaPencilAlt, 
  FaRobot, 
  FaComments,
  FaLock 
} from 'react-icons/fa';
import '../styles/icon-gradient.css';

const SideBar = ({ activeTab, setActiveTab, unreadCount }) => {
  const isAuthenticated = !!localStorage.getItem('codeunity_token');
  const usageCount = parseInt(localStorage.getItem('codeunity_usage_count') || '0', 10);
  const isLimitReached = usageCount >= 3;

  const tabs = [
    { id: 'files', icon: <FaFile size={24} />, label: 'Files', restricted: false },
    { id: 'users', icon: <FaUsers size={24} />, label: 'Users', restricted: !isAuthenticated && isLimitReached },
    { id: 'draw', icon: <FaPencilAlt size={24} />, label: 'Draw', restricted: !isAuthenticated && isLimitReached },
    { id: 'chat', icon: <FaComments size={24} />, label: 'Chat', badge: unreadCount, restricted: !isAuthenticated && isLimitReached },
    { id: 'copilot', icon: <FaRobot size={24} />, label: 'Copilot', restricted: !isAuthenticated && isLimitReached }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="bg-gradient-to-b from-purple-900/50 via-blue-900/40 to-cyan-800/30 w-20 flex-shrink-0 flex flex-col items-center py-6 border-r border-white/10 backdrop-blur-xl z-20 relative">
      {/* SVG Filter Definition for Icon Gradient */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="purple-blue-cyan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" /> {/* purple-400 */}
            <stop offset="50%" stopColor="#60a5fa" /> {/* blue-400 */}
            <stop offset="100%" stopColor="#22d3ee" /> {/* cyan-400 */}
          </linearGradient>
        </defs>
      </svg>
      
      {tabs.map((tab) => (
        <div key={tab.id} className="relative mb-4">
          <button
            onClick={() => handleTabClick(tab.id)}
            className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500/25 via-blue-500/25 to-cyan-500/25 border border-white/15 shadow-lg shadow-purple-500/20'
                : 'text-gray-300 hover:bg-gradient-to-r hover:from-purple-500/15 hover:via-blue-500/15 hover:to-cyan-500/15 hover:text-white'
            }`}
            disabled={tab.restricted}
          >
            <div className={activeTab === tab.id ? 'icon-gradient' : ''}>
              {tab.icon}
            </div>
            <span className={`text-xs mt-1 ${activeTab === tab.id ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300' : ''}`}>
              {tab.label}
            </span>
          </button>
          {tab.badge > 0 && (
            <div className="absolute -top-1 right-1 z-10 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center border border-white/20 shadow-lg shadow-purple-500/20">
              <span className="text-xs font-medium">{tab.badge}</span>
            </div>
          )}
          {tab.restricted && (
            <FaLock className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
          )}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
