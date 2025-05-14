import React from 'react';

const Sidebar = ({ users }) => {
  return (
    <div className="bg-gray-900 text-white w-64 p-4 h-screen overflow-auto">
      <h2 className="text-lg font-bold mb-4">👥 Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.socketId} className="mb-2">• {u.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
