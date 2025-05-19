import React from 'react';
import { 
  FaUsers, 
  FaFile, 
  FaPencilAlt, 
  FaRobot, 
  FaComments 
} from 'react-icons/fa';
import '../styles/icon-gradient.css';

const SideBar = ({ activeTab, setActiveTab, unreadCount }) => {
  const tabs = [
    { id: 'files', icon: <FaFile size={24} />, label: 'Files' },
    { id: 'users', icon: <FaUsers size={24} />, label: 'Users' },
    { id: 'draw', icon: <FaPencilAlt size={24} />, label: 'Draw' },
    { id: 'chat', icon: <FaComments size={24} />, label: 'Chat', badge: unreadCount },
    { id: 'copilot', icon: <FaRobot size={24} />, label: 'Copilot' }
  ];

  const handleTabClick = (tabId) => {
    console.log('Switching to tab:', tabId); // Debug log
    setActiveTab(tabId);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-black to-black w-20 flex-shrink-0 flex flex-col items-center py-6 border-r border-white/5 backdrop-blur-xl z-20 relative">
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
                ? 'bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 border border-white/10'
                : 'text-gray-400 hover:bg-gradient-to-r hover:from-purple-500/10 hover:via-blue-500/10 hover:to-cyan-500/10 hover:text-white'
            }`}
          >
            <div className={activeTab === tab.id ? 'icon-gradient' : ''}>
              {tab.icon}
            </div>
            <span className={`text-xs mt-1 ${activeTab === tab.id ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400' : ''}`}>
              {tab.label}
            </span>
          </button>
          {tab.badge > 0 && (
            <div className="absolute -top-1 right-1 z-10 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center border border-white/20 shadow-lg shadow-purple-500/20">
              <span className="text-xs font-medium">{tab.badge}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
