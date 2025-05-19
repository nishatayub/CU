import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import codeunityLogo from '../assets/CodeUnity.png';
import heroImage from '../assets/pic.jpg';
import Unknown from '../assets/Unknown.jpg';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs for scroll functionality
  const joinRoomRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const useCodeUnityRef = useRef(null);
  const reviewsRef = useRef(null);
  const learnMoreRef = useRef(null);
  const connectRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMenuOpen(false);
  };

  const createRoom = () => {
    const id = uuidv4();
    setRoomId(id);
    // Smooth scroll to join room section
    joinRoomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const joinRoom = () => {
    if (!roomId || !username) return alert('Both Room ID and Username required');
    navigate(`/editor/${roomId}`, { state: { username } });
  };


  const features = [
    {
      tag: "Real-time",
      title: "Live Collaboration",
      description: "Code together seamlessly with developers worldwide in real-time with perfect synchronization"
    },
    {
      tag: "AI-Powered",
      title: "Intelligent Assistant",
      description: "Get smart code suggestions and real-time assistance from our advanced AI system"
    },
    {
      tag: "Premium",
      title: "Code Execution",
      description: "Run and test your code directly in the browser with support for multiple languages"
    },
    {
      tag: "New",
      title: "Version Control",
      description: "Built-in version control to track changes and manage code collaboratively"
    },
    {
      tag: "Security",
      title: "Secure Sharing",
      description: "End-to-end encryption for secure code sharing and collaboration"
    },
    {
      tag: "Integration",
      title: "AI Integration",
      description: "Seamless integration with popular AI models for enhanced development"
    }
  ];

  const reviews = [
    {
      name: "Alex Chen",
      role: "Senior Developer",
      review: "CodeUnity has revolutionized how our team collaborates. The real-time features are incredible!"
    },
    {
      name: "Sarah Johnson",
      role: "Tech Lead",
      review: "The AI assistance is like having an extra team member. It's increased our productivity significantly."
    },
    {
      name: "Mike Brown",
      role: "Full Stack Developer",
      review: "Best collaborative coding platform I've used. The interface is intuitive and features are powerful."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <motion.div 
                className="h-8 cursor-pointer overflow-hidden rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={codeunityLogo} alt="CodeUnity" className="h-full object-contain" />
              </motion.div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                {[
                  { name: 'About', ref: aboutRef },
                  { name: 'Features', ref: featuresRef },
                  { name: 'Use CodeUnity', ref: useCodeUnityRef },
                  { name: 'Reviews', ref: reviewsRef },
                  { name: 'Contact', ref: connectRef }
                ].map((item) => (
                  <motion.span
                    key={item.name}
                    className="relative cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => scrollToSection(item.ref)}
                    initial={false}
                  >
                    <span className="relative z-10">{item.name}</span>
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <motion.div
                    animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                    className="h-0.5 w-full bg-white origin-left"
                  />
                  <motion.div
                    animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="h-0.5 w-full bg-white"
                  />
                  <motion.div
                    animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                    className="h-0.5 w-full bg-white origin-left"
                  />
                </div>
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="hidden md:block px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-medium"
              onClick={() => scrollToSection(joinRoomRef)}
            >
              Start Coding →
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={false}
            animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="py-4 space-y-4">
              {[
                { name: 'About', ref: aboutRef },
                { name: 'Features', ref: featuresRef },
                { name: 'Use CodeUnity', ref: useCodeUnityRef },
                { name: 'Reviews', ref: reviewsRef },
                { name: 'Contact', ref: connectRef }
              ].map((item) => (
                <motion.div
                  key={item.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(item.ref)}
                  className="px-4 py-2 hover:bg-white/5 rounded-lg cursor-pointer"
                >
                  {item.name}
                </motion.div>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => scrollToSection(joinRoomRef)}
                className="w-full px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-medium"
              >
                Start Coding →
              </motion.button>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                AI-Powered<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  CODE UNITY
                </span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl">
                Experience the future of collaborative coding. Our AI-powered platform brings developers together, 
                enhancing creativity and productivity through real-time collaboration.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-medium"
                  onClick={createRoom}
                >
                  Create Room →
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10"
                  onClick={() => scrollToSection(aboutRef)}
                >
                  Learn More
                </motion.button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-600/30 blur-3xl"></div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-black to-gray-900"
              >
                <div className="aspect-square relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-600/20 mix-blend-overlay"></div>
                  <img 
                    src={heroImage} 
                    alt="CodeUnity AI" 
                    className="relative z-10 w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* About Section */}
          <div ref={aboutRef} className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-2xl">👋</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold">About Us</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">
                  Empowering Developers with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    AI-Enhanced Collaboration
                  </span>
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  CodeUnity is more than just a collaborative coding platform. We're building the future of software development 
                  by combining real-time collaboration with advanced AI capabilities. Our mission is to make coding more 
                  accessible, efficient, and enjoyable for developers worldwide.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-600/10 backdrop-blur-xl border border-white/10">
                    <h4 className="font-semibold mb-1">1000+</h4>
                    <p className="text-sm text-gray-400">Active Users</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-600/10 backdrop-blur-xl border border-white/10">
                    <h4 className="font-semibold mb-1">50K+</h4>
                    <p className="text-sm text-gray-400">Lines of Code</p>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-600/30 blur-3xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative rounded-3xl overflow-hidden">
                  <img src={Unknown} alt="About CodeUnity" className="w-full object-cover rounded-3xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div ref={featuresRef} className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Features</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 border border-white/10 text-sm mb-4">
                      {feature.tag}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Use CodeUnity Section */}
          <div ref={useCodeUnityRef} className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Use CodeUnity</h2>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-600/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold">Get Started in Minutes</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Create a Room</h4>
                        <p className="text-gray-400">Click "Create Room" to start a new coding session</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Share Room ID</h4>
                        <p className="text-gray-400">Share the room ID with your team members</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Start Coding</h4>
                        <p className="text-gray-400">Begin coding together in real-time with AI assistance</p>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToSection(joinRoomRef)}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-medium"
                  >
                    Start Now →
                  </motion.button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <pre className="text-sm text-gray-300">
                      <code>{`// Example of real-time collaboration
function calculateSum(a, b) {
  return a + b;
}

// AI suggests optimization
const optimizedSum = (a, b) => a + b;

// Live coding session
// Team members can edit simultaneously
// AI provides suggestions in real-time`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div ref={reviewsRef} className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Reviews</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                    </div>
                    <p className="text-gray-400 mb-4">{review.review}</p>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Join Room Section */}
          <motion.div
            ref={joinRoomRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-600/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-6">Join Room</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={joinRoom}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-medium hover:opacity-90 transition"
              >
                Join Room →
              </motion.button>
            </div>
          </motion.div>

          {/* Features Section - Learn More */}
          <div ref={learnMoreRef} className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Learn More</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                    <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 border border-white/10 text-sm mb-4">
                      {feature.tag}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div ref={connectRef} className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-2xl">📬</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Connect With Me</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.a
                href="mailto:nishatayub702@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex items-center gap-4">
                  <MdEmail className="text-3xl text-cyan-400" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-gray-400">nishatayub702@gmail.com</p>
                  </div>
                </div>
              </motion.a>

              <motion.a
                href="https://linkedin.com/in/nishatayub"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex items-center gap-4">
                  <FaLinkedin className="text-3xl text-blue-400" />
                  <div>
                    <h3 className="font-semibold">LinkedIn</h3>
                    <p className="text-sm text-gray-400">nishatayub</p>
                  </div>
                </div>
              </motion.a>

              <motion.a
                href="https://github.com/nishatayub"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex items-center gap-4">
                  <FaGithub className="text-3xl text-purple-400" />
                  <div>
                    <h3 className="font-semibold">GitHub</h3>
                    <p className="text-sm text-gray-400">nishatayub</p>
                  </div>
                </div>
              </motion.a>

              <motion.a
                href="https://instagram.com/nishatayub"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex items-center gap-4">
                  <FaInstagram className="text-3xl text-gradient-to-r from-purple-400 to-pink-400" />
                  <div>
                    <h3 className="font-semibold">Instagram</h3>
                    <p className="text-sm text-gray-400">nishatayub</p>
                  </div>
                </div>
              </motion.a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="font-medium">CodeUnity</span>
              </div>
              <p className="text-sm text-gray-400">
                Empowering developers with AI-enhanced collaborative coding solutions.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <div className="flex flex-col space-y-2 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <span>© 2025 CodeUnity. All rights reserved.</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Connect With Me</h3>
              <div className="flex flex-col space-y-2 text-sm text-gray-400">
                <a href="mailto:nishatayub702@gmail.com" className="hover:text-white transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  nishatayub702@gmail.com
                </a>
                <a href="https://linkedin.com/in/nishatayub" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"></path>
                  </svg>
                  LinkedIn
                </a>
                <a href="https://github.com/nishatayub" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 .333A9.911 9.911 0 000 10.333c0 4.54 2.94 8.39 7.02 9.75.51.1.7-.22.7-.49v-1.71c-2.87.62-3.48-1.35-3.48-1.35-.47-1.19-1.14-1.51-1.14-1.51-.93-.64.07-.62.07-.62 1.03.07 1.57 1.06 1.57 1.06.91 1.57 2.39 1.12 2.98.86.09-.66.36-1.12.65-1.37-2.29-.26-4.7-1.14-4.7-5.09 0-1.13.4-2.05 1.06-2.77-.11-.26-.46-1.31.1-2.73 0 0 .87-.28 2.84 1.06a9.85 9.85 0 012.6-.35c.88 0 1.77.12 2.6.35 1.97-1.34 2.84-1.06 2.84-1.06.56 1.42.21 2.47.1 2.73.66.72 1.06 1.64 1.06 2.77 0 3.96-2.41 4.83-4.71 5.08.37.32.7.95.7 1.91v2.83c0 .27.19.59.71.49 4.07-1.36 7.01-5.21 7.01-9.75A9.911 9.911 0 0010 .333z" clipRule="evenodd"></path>
                  </svg>
                  GitHub
                </a>
                <a href="https://instagram.com/nishatayub" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2.685c2.377 0 2.658.01 3.598.052.867.04 1.338.185 1.65.307.415.161.712.354 1.024.666.312.312.505.609.666 1.024.122.312.267.783.307 1.65.042.94.052 1.221.052 3.598s-.01 2.658-.052 3.598c-.04.867-.185 1.338-.307 1.65-.161.415-.354.712-.666 1.024-.312.312-.609.505-1.024.666-.312.122-.783.267-1.65.307-.94.042-1.221.052-3.598.052s-2.658-.01-3.598-.052c-.867-.04-1.338-.185-1.65-.307-.415-.161-.712-.354-1.024-.666-.312-.312-.505-.609-.666-1.024-.122-.312-.267-.783-.307-1.65-.042-.94-.052-1.221-.052-3.598s.01-2.658.052-3.598c.04-.867.185-1.338.307-1.65.161-.415.354-.712.666-1.024.312-.312.609-.505 1.024-.666.312-.122.783-.267 1.65-.307.94-.042 1.221-.052 3.598-.052M10 1c-2.445 0-2.75.01-3.71.054-.958.044-1.612.196-2.185.419A4.412 4.412 0 002.525 2.525 4.412 4.412 0 001.473 4.105c-.223.573-.375 1.227-.419 2.185C1.01 7.25 1 7.555 1 10s.01 2.75.054 3.71c.044.958.196 1.612.419 2.185.23.595.538 1.1 1.052 1.614.514.514 1.019.822 1.614 1.052.573.223 1.227.375 2.185.419.96.044 1.265.054 3.71.054s2.75-.01 3.71-.054c.958-.044 1.612-.196 2.185-.419a4.412 4.412 0 001.614-1.052c.514-.514.822-1.019 1.052-1.614.223-.573.375-1.227.419-2.185.044-.96.054-1.265.054-3.71s-.01-2.75-.054-3.71c-.044-.958-.196-1.612-.419-2.185a4.412 4.412 0 00-1.052-1.614A4.412 4.412 0 0015.895 1.473c-.573-.223-1.227-.375-2.185-.419C12.75 1.01 12.445 1 10 1z"></path>
                    <path d="M10 5.351A4.649 4.649 0 005.351 10 4.649 4.649 0 0010 14.649 4.649 4.649 0 0014.649 10 4.649 4.649 0 0010 5.351zm0 7.665A3.016 3.016 0 016.984 10 3.016 3.016 0 0110 6.984 3.016 3.016 0 0113.016 10 3.016 3.016 0 0110 13.016zm3.878-6.976a1.087 1.087 0 100-2.174 1.087 1.087 0 000 2.174z"></path>
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
