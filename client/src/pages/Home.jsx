import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import codeunityLogo from '../assets/CodeUnity.png';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-purple-200 relative overflow-hidden">
      {/* Left and right background split */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-white/80 backdrop-blur-lg" />
        <div className="w-1/2 bg-[#232335]" />
      </div>
      {/* Navigation bar at the very top */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-16 pt-10 z-50">
        <div className="flex gap-8 text-lg font-semibold text-gray-700">
          <span className="hover:text-purple-600 transition cursor-pointer">Home</span>
          <span className="hover:text-purple-600 transition cursor-pointer">Store</span>
          <span className="hover:text-purple-600 transition cursor-pointer">Shop</span>
          <span className="hover:text-purple-600 transition cursor-pointer">Collection</span>
        </div>
        <div className="flex gap-6 text-gray-400 text-sm">
          <span className="hover:text-purple-400 transition cursor-pointer">Login</span>
          <span className="hover:text-purple-400 transition cursor-pointer">Profile</span>
        </div>
      </div>
      {/* Hero Section with 3 columns */}
      <div className="relative z-30 flex flex-row items-center justify-center w-full max-w-7xl mx-auto px-8 pt-24 pb-16 gap-0">
        {/* Left: Join Code Unity */}
        <div className="flex flex-col items-start bg-white/80 rounded-2xl shadow-xl p-10 min-w-[320px] max-w-sm w-full backdrop-blur-lg ml-8 mt-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Join CodeUnity</h1>
          <input
            className="border p-2 mb-2 rounded w-full focus:ring-2 focus:ring-purple-400"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            className="border p-2 mb-2 rounded w-full focus:ring-2 focus:ring-purple-400"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={joinRoom} className="bg-purple-600 text-white px-4 py-2 mb-2 rounded shadow hover:bg-purple-700 transition w-full">
            Join Room
          </button>
          <button onClick={createRoom} className="text-purple-600 underline mt-2">
            Create New Room
          </button>
        </div>
        {/* Center: Large S, Logo, and CODEUNITY text */}
        <div className="relative flex flex-col items-center justify-center min-w-[420px] max-w-xl w-full px-2" style={{ marginTop: '-7rem' }}>
          {/* Large animated S with mirror effect */}
          <motion.div
            initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 1.2, type: 'spring' }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none select-none"
          >
            <span className="text-[22rem] font-extrabold text-purple-400/60 drop-shadow-2xl mix-blend-multiply" style={{letterSpacing: '0.1em', filter: 'blur(0.5px)'}}>S</span>
            {/* Mirror effect */}
            <span className="absolute left-0 top-full w-full text-[22rem] font-extrabold text-purple-400/30 opacity-40 blur-sm scale-y-[-1] pointer-events-none select-none" style={{letterSpacing: '0.1em'}}>S</span>
          </motion.div>
          <div className="relative z-30 flex flex-col items-center mt-0 mb-8" style={{ marginTop: '-2rem' }}>
            <div className="flex gap-2 text-6xl md:text-7xl font-extrabold tracking-widest text-white drop-shadow-xl whitespace-nowrap items-center mb-32 justify-center w-full">
              <span className="text-gray-700">C O D E</span>
              <motion.img
                src={codeunityLogo}
                alt="CodeUnity Logo"
                initial={{ y: '-120vh', scale: 3, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1.2, type: 'spring', stiffness: 60, damping: 12 }}
                className="w-16 h-16 md:w-20 md:h-20 mx-2 rounded-full shadow-lg border-4 border-white/80 bg-white object-contain"
                style={{ boxShadow: '0 4px 32px rgba(80,0,120,0.18)' }}
              />
              <span className="text-white">U N I T Y</span>
            </div>
            <div className="w-full flex justify-center">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className="mt-32 px-8 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition text-lg backdrop-blur-lg border border-white/30"
                style={{ marginTop: '200px' }}
                onClick={() => document.getElementById('room-form')?.scrollIntoView({behavior: 'smooth'})}
              >
                Explore More
              </motion.button>
            </div>
          </div>
        </div>
        {/* Right: Sign Up block */}
        <div className="flex flex-col items-start bg-[#232335]/80 rounded-2xl shadow-xl p-10 min-w-[320px] max-w-sm w-full backdrop-blur-lg mr-8 mt-8">
          <h1 className="text-3xl font-bold mb-4 text-white">Sign Up</h1>
          <input
            className="border p-2 mb-2 rounded w-full focus:ring-2 focus:ring-purple-400 bg-[#232335] text-white placeholder-gray-400"
            placeholder="Email"
            type="email"
          />
          <input
            className="border p-2 mb-2 rounded w-full focus:ring-2 focus:ring-purple-400 bg-[#232335] text-white placeholder-gray-400"
            placeholder="Username"
            type="text"
          />
          <input
            className="border p-2 mb-2 rounded w-full focus:ring-2 focus:ring-purple-400 bg-[#232335] text-white placeholder-gray-400"
            placeholder="Password"
            type="password"
          />
          <button className="bg-purple-600 text-white px-4 py-2 mb-2 rounded shadow hover:bg-purple-700 transition w-full">
            Sign Up
          </button>
        </div>
      </div>
      {/* Socials and footer */}
      <div className="absolute bottom-6 left-10 flex gap-8 text-gray-400 text-xs z-40">
        <span>World wide Shipping & Support</span>
        <span>Customer Care</span>
      </div>
      <div className="absolute bottom-6 right-10 flex gap-8 text-gray-400 text-xs z-40">
        <span>Facebook</span>
        <span>Instagram</span>
        <span>Twitter</span>
      </div>
      {/* Animated floating label */}
      <motion.div
        className="absolute right-10 top-1/2 -translate-y-1/2 z-40 rotate-90 text-xs tracking-widest text-purple-400 font-bold"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
      >
        <span>EDITOR</span>
      </motion.div>
    </div>
  );
};

export default Home;
