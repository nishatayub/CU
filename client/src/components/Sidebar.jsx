import React from 'react';
import { 
  FaUsers, 
  FaFile, 
  FaPencilAlt, 
  FaRobot, 
  FaComments 
} from 'react-icons/fa';

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
    <div className="bg-gray-900 w-20 flex-shrink-0 flex flex-col items-center py-4">
      {tabs.map((tab) => (
        <div key={tab.id} className="relative">
          <button
            onClick={() => handleTabClick(tab.id)}
            className={`w-16 h-16 mb-4 flex flex-col items-center justify-center rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
          {tab.badge > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {tab.badge}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
