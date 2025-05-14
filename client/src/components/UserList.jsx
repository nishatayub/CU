import React from 'react';

const UserList = ({ socket, currentUser, users }) => {
  const getRandomColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username?.length || 0; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const getUserName = (user) => {
    if (typeof user === 'string') return user;
    return user?.username || user?.name || 'Unknown';
  };

  const getInitials = (user) => {
    const username = getUserName(user);
    if (!username) return '??';
    return username.slice(0, 2).toUpperCase();
  };

  // Create a unique list of users based on their names
  const uniqueUsers = Array.from(
    new Set(Array.isArray(users) ? users.map(user => getUserName(user)) : [])
  );
  
  console.log('Unique users:', uniqueUsers); // Debug log

  return (
    <div className="w-64 bg-gray-800 p-4 text-white h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Connected Users ({uniqueUsers.length})</h2>
      <div className="space-y-4">
        {uniqueUsers.map((username, index) => {
          const isCurrentUser = username === currentUser;
          
          return (
            <div 
              key={username} 
              className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 ${
                isCurrentUser ? 'bg-gray-700' : ''
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: getRandomColor(username) }}
              >
                {username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm flex-1">
                {username}{isCurrentUser ? ' (You)' : ''}
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500" title="Online" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserList;