import React from 'react';
import { FaUsers, FaFile, FaPencilAlt, FaPlay, FaComments } from 'react-icons/fa';

const Panel = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'files', icon: <FaFile />, label: 'Files' },
    { id: 'users', icon: <FaUsers />, label: 'Users' },
    { id: 'draw', icon: <FaPencilAlt />, label: 'Draw' },
    { id: 'chat', icon: <FaComments />, label: 'Chat' },
    { id: 'run', icon: <FaPlay />, label: 'Run' }
  ];

  return (
    <div className="bg-gray-900 w-20 flex-shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`w-full p-4 flex flex-col items-center text-sm ${
            activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          <span className="mt-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Panel;
