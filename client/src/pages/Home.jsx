import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createRoom = () => {
    const id = uuidv4();
    setRoomId(id);
  };

  const joinRoom = () => {
    if (!roomId || !username) return alert('Both Room ID and Username required');
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-3xl font-bold mb-4">Join Code Unity</h1>
      <input
        className="border p-2 mb-2"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <input
        className="border p-2 mb-2"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={joinRoom} className="bg-blue-500 text-white px-4 py-2 mb-2">
        Join Room
      </button>
      <button onClick={createRoom} className="text-blue-500 underline">
        Create New Room
      </button>
    </div>
  );
};

export default Home;
