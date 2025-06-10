import React from 'react';

const UserList = ({ users, currentUser, className }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {users.map((username, index) => (
        <div
          key={username}
          style={{ 
            opacity: 0,
            animation: `fadeInSlide 0.3s ease-out ${index * 0.1}s forwards`
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 backdrop-blur-xl border border-white/15 group hover:border-white/25 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 min-w-0"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
              {username[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-black" title="Online" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-white font-medium truncate">
                {username === currentUser ? 'You' : username}
              </span>
              {username === currentUser && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-purple-500/25 via-blue-500/25 to-cyan-500/25 text-white/90 border border-white/15 flex-shrink-0">
                  current
                </span>
              )}
            </div>
            <span className="text-xs text-white/50">Online</span>
          </div>
          
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UserList;