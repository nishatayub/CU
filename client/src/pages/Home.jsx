import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import codeunityLogo from '../assets/CodeUnity.png';
import bgImage from '../assets/bg.jpg';
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
  const howToUseRef = useRef(null);
  const testimonialsRef = useRef(null);
  const faqRef = useRef(null);
  const connectRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMenuOpen(false);
  };

  const createRoom = () => {
    const id = uuidv4();
    setRoomId(id);
    joinRoomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const joinRoom = () => {
    if (!roomId || !username) return alert('Both Room ID and Username required');
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/80 to-cyan-800/70"></div>
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large Cyan Circle - Top Right */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/20 blur-xl"
        />
        
        {/* Medium Purple Ring - Bottom Right */}
        <motion.div
          animate={{ 
            rotate: [360, 0],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-64 h-64 rounded-full border-4 border-purple-400/30"
          style={{
            background: 'radial-gradient(circle, transparent 60%, rgba(168, 85, 247, 0.2) 70%)'
          }}
        />

        {/* Small Yellow Dot - Top Left */}
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 left-20 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
        />

        {/* Glass Sphere - Bottom Left */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-16 w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-cyan-400/30 backdrop-blur-sm border border-white/20"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 lg:px-12 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={codeunityLogo} 
              alt="CodeUnity" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-white font-bold text-xl">CODE UNITY</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'HOME', ref: null, active: true },
              { name: 'FEATURES', ref: featuresRef },
              { name: 'HOW TO USE', ref: howToUseRef },
              { name: 'TESTIMONIALS', ref: testimonialsRef },
              { name: 'FAQ', ref: faqRef },
              { name: 'CONTACT', ref: connectRef }
            ].map((item) => (
              <motion.button
                key={item.name}
                className={`text-xs font-medium tracking-wider transition-colors ${
                  item.active ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => item.ref && scrollToSection(item.ref)}
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="pt-6 pb-4 space-y-4">
            {[
              { name: 'HOME', ref: null },
              { name: 'FEATURES', ref: featuresRef },
              { name: 'HOW TO USE', ref: howToUseRef },
              { name: 'TESTIMONIALS', ref: testimonialsRef },
              { name: 'FAQ', ref: faqRef },
              { name: 'CONTACT', ref: connectRef }
            ].map((item) => (
              <motion.button
                key={item.name}
                className="block w-full text-left text-white/70 hover:text-white text-sm font-medium tracking-wider"
                whileTap={{ scale: 0.95 }}
                onClick={() => item.ref && scrollToSection(item.ref)}
              >
                {item.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 lg:px-12 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Main Heading */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-5xl lg:text-7xl font-bold leading-tight"
                >
                  <span className="text-white">
                    AI-Powered Code<br />
                    Collaboration
                  </span>
                </motion.h1>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-white/80 text-lg leading-relaxed max-w-lg"
              >
                Experience the future of collaborative coding. Our AI-powered platform brings 
                developers together, enhancing creativity and productivity through seamless 
                real-time collaboration and intelligent code assistance.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-shadow"
                  onClick={createRoom}
                >
                  START CODING
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Side - Floating Elements Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative h-96 lg:h-[500px]"
            >
              {/* This space showcases the floating geometric elements */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Join Room Section */}
      <div className="relative z-10 px-6 lg:px-12 pb-24">
        <div className="max-w-md mx-auto">
          <motion.div
            ref={joinRoomRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Join Room</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={joinRoom}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:shadow-lg transition-shadow"
              >
                Join Room →
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="relative z-10 px-6 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* About Section */}
          <div ref={aboutRef} className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-16"
            >
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-white">About CodeUnity</h2>
                <p className="text-white/80 text-lg max-w-4xl mx-auto leading-relaxed">
                  CodeUnity is a revolutionary AI-powered collaborative coding platform that transforms how developers work together. 
                  Built for the modern era of remote development, we bridge the gap between individual creativity and team productivity 
                  through seamless real-time collaboration and intelligent code assistance.
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-left"
                >
                  <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-8 border border-white/15 h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">🎯</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Our Mission</h3>
                    </div>
                    <p className="text-white/70 leading-relaxed">
                      To democratize collaborative coding by providing developers worldwide with cutting-edge tools that enhance creativity, 
                      boost productivity, and foster innovation. We believe that great code emerges when brilliant minds work together seamlessly, 
                      regardless of geographical boundaries.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-left"
                >
                  <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-8 border border-white/15 h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">🚀</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Our Vision</h3>
                    </div>
                    <p className="text-white/70 leading-relaxed">
                      To become the global standard for collaborative development environments, where every line of code written is enhanced by AI, 
                      every collaboration is frictionless, and every developer can reach their full potential through the power of unified teamwork 
                      and intelligent assistance.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-3xl font-bold text-white mb-8">Why Choose CodeUnity?</h3>
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        icon: "⚡",
                        title: "Real-Time Synchronization",
                        description: "Experience lightning-fast real-time code synchronization with zero conflicts. Watch your team's changes appear instantly with our advanced operational transformation algorithms."
                      },
                      {
                        icon: "🤖",
                        title: "AI-Powered Intelligence",
                        description: "Leverage GitHub Copilot integration for intelligent code suggestions, automated debugging, and context-aware assistance that learns from your coding patterns."
                      },
                      {
                        icon: "🌐",
                        title: "Universal Language Support",
                        description: "Support for 100+ programming languages with syntax highlighting, auto-completion, and language-specific optimizations for every major framework and library."
                      },
                      {
                        icon: "🔒",
                        title: "Enterprise Security",
                        description: "Bank-grade encryption, secure room management, and privacy-first architecture ensure your code remains protected while enabling seamless collaboration."
                      },
                      {
                        icon: "📱",
                        title: "Cross-Platform Access",
                        description: "Access your coding environment from any device with our responsive web interface, optimized for desktop development with mobile monitoring capabilities."
                      },
                      {
                        icon: "🎨",
                        title: "Beautiful Interface",
                        description: "Stunning, distraction-free interface designed for developers, featuring customizable themes, intuitive layouts, and eye-friendly color schemes."
                      }
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                      >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          {benefit.icon}
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3">{benefit.title}</h4>
                        <p className="text-white/70 leading-relaxed text-sm">{benefit.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Technical Excellence */}
              <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/15 to-cyan-800/20 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-bold text-white">Built with Modern Technology</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      {
                        category: "Frontend",
                        technologies: ["React 18", "Vite", "Tailwind CSS", "Framer Motion"]
                      },
                      {
                        category: "Backend", 
                        technologies: ["Node.js", "Express", "Socket.IO", "MongoDB"]
                      },
                      {
                        category: "AI Integration",
                        technologies: ["GitHub Copilot", "Monaco Editor", "Language Servers", "Code Analysis"]
                      },
                      {
                        category: "Infrastructure",
                        technologies: ["Real-time Sync", "Cloud Deployment", "CDN", "Load Balancing"]
                      }
                    ].map((tech, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.4 + index * 0.1 }}
                        className="text-center"
                      >
                        <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 mb-4">
                          {tech.category}
                        </h4>
                        <ul className="space-y-2">
                          {tech.technologies.map((item, idx) => (
                            <li key={idx} className="text-white/70 text-sm">{item}</li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.6 }}
                className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-8 border border-white/15"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Development Workflow?</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Join thousands of developers who have revolutionized their coding experience with CodeUnity. 
                  Start collaborating smarter, coding faster, and building better software today.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createRoom}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Coding Now →
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Features Section */}
          <div ref={featuresRef} className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className="text-4xl font-bold text-white">Features</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Real-time Collaboration",
                    description: "Code together seamlessly with perfect synchronization"
                  },
                  {
                    title: "AI-Powered Assistant",
                    description: "Get intelligent code suggestions and bug fixes"
                  },
                  {
                    title: "Multi-language Support",
                    description: "Support for all major programming languages"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* How to Use Section */}
          <div ref={howToUseRef} className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className="text-4xl font-bold text-white">How to Use CodeUnity</h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  {
                    step: "01",
                    title: "Create or Join Room",
                    description: "Start by creating a new coding room or join an existing one with a room ID"
                  },
                  {
                    step: "02", 
                    title: "Invite Your Team",
                    description: "Share the room ID with your team members to collaborate in real-time"
                  },
                  {
                    step: "03",
                    title: "Code Together",
                    description: "Write, edit, and debug code together with AI assistance and live synchronization"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
                      <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-4">
                        {item.step}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-white/70 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Testimonials Section */}
          <div ref={testimonialsRef} className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className="text-4xl font-bold text-white">What Developers Say</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    name: "Sarah Chen",
                    role: "Senior Frontend Developer",
                    company: "TechCorp",
                    quote: "CodeUnity has revolutionized how our team collaborates. The AI assistance is incredibly helpful!",
                    rating: 5
                  },
                  {
                    name: "Marcus Rodriguez", 
                    role: "Full Stack Engineer",
                    company: "StartupLab",
                    quote: "Real-time collaboration has never been this smooth. It's like having the whole team in one room.",
                    rating: 5
                  },
                  {
                    name: "Emily Johnson",
                    role: "DevOps Engineer", 
                    company: "CloudTech",
                    quote: "The AI-powered suggestions have saved us countless hours of debugging. Absolutely love it!",
                    rating: 5
                  },
                  {
                    name: "David Kim",
                    role: "Backend Developer",
                    company: "DataFlow",
                    quote: "Perfect for remote teams. The synchronization is flawless and the interface is intuitive.",
                    rating: 5
                  },
                  {
                    name: "Lisa Thompson",
                    role: "Mobile Developer",
                    company: "AppStudio",
                    quote: "CodeUnity has become an essential tool for our development workflow. Highly recommended!",
                    rating: 5
                  },
                  {
                    name: "Alex Morgan",
                    role: "Tech Lead",
                    company: "InnovateLab",
                    quote: "The best collaborative coding platform I've used. The AI features are game-changing.",
                    rating: 5
                  }
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  >
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-white/80 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="text-center">
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-white/60 text-sm">{testimonial.role}</p>
                      <p className="text-cyan-400 text-sm">{testimonial.company}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <div ref={faqRef} className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto space-y-6">
                {[
                  {
                    question: "How many people can collaborate in one room?",
                    answer: "CodeUnity supports up to 50 concurrent users in a single room, making it perfect for teams of any size."
                  },
                  {
                    question: "What programming languages are supported?",
                    answer: "We support over 100 programming languages including JavaScript, Python, Java, C++, React, Node.js, and many more."
                  },
                  {
                    question: "Is my code secure and private?",
                    answer: "Yes! All code is encrypted in transit and at rest. We use enterprise-grade security to protect your intellectual property."
                  },
                  {
                    question: "Can I use CodeUnity for free?",
                    answer: "Yes, we offer a free tier with basic features. Premium plans are available for advanced AI features and larger teams."
                  },
                  {
                    question: "Does CodeUnity work offline?",
                    answer: "CodeUnity requires an internet connection for real-time collaboration, but you can work locally and sync when reconnected."
                  },
                  {
                    question: "How does the AI assistance work?",
                    answer: "Our AI analyzes your code in real-time to provide suggestions, detect bugs, optimize performance, and help with documentation."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-left"
                  >
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Contact Section */}
          <div ref={connectRef} className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold text-white">Connect With Us</h2>
              <div className="flex justify-center gap-6">
                <motion.a
                  href="mailto:nishatayub702@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <MdEmail className="text-xl text-white" />
                </motion.a>
                <motion.a
                  href="https://linkedin.com/in/nishatayub"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <FaLinkedin className="text-xl text-white" />
                </motion.a>
                <motion.a
                  href="https://github.com/nishatayub"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <FaGithub className="text-xl text-white" />
                </motion.a>
                <motion.a
                  href="https://instagram.com/nishatayub"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <FaInstagram className="text-xl text-white" />
                </motion.a>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
            
            {/* CodeUnity Brand & Quote */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={codeunityLogo} 
                  alt="CodeUnity" 
                  className="h-10 w-auto object-contain"
                />
                <span className="text-white font-bold text-xl">CODE UNITY</span>
              </motion.div>
              
              <blockquote className="text-white/70 italic text-sm leading-relaxed">
                "Code is like humor. When you have to explain it, it's bad."<br />
                <span className="text-cyan-400 not-italic">- Cory House</span>
              </blockquote>
              
              <p className="text-white/60 text-sm leading-relaxed">
                Empowering developers worldwide with AI-enhanced collaborative coding solutions. 
                Building the future of software development, one line of code at a time.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-white font-semibold text-lg">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Home', ref: null },
                  { name: 'Features', ref: featuresRef },
                  { name: 'How to Use', ref: howToUseRef },
                  { name: 'Testimonials', ref: testimonialsRef },
                  { name: 'FAQ', ref: faqRef }
                ].map((link, index) => (
                  <li key={index}>
                    <motion.button
                      onClick={() => link.ref ? scrollToSection(link.ref) : window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-white/70 hover:text-cyan-400 transition-colors text-sm"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product */}
            <div className="space-y-6">
              <h3 className="text-white font-semibold text-lg">Product</h3>
              <ul className="space-y-3">
                {[
                  'Real-time Collaboration',
                  'AI Code Assistant',
                  'Multi-language Support',
                  'Code Execution',
                  'Team Management',
                  'Version Control'
                ].map((feature, index) => (
                  <li key={index} className="text-white/70 text-sm">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="space-y-6">
              <h3 className="text-white font-semibold text-lg">Connect With Us</h3>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <motion.a
                  href="mailto:nishatayub702@gmail.com"
                  className="flex items-center gap-3 text-white/70 hover:text-cyan-400 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <MdEmail className="text-lg" />
                  <span className="text-sm">nishatayub702@gmail.com</span>
                </motion.a>
                
                <div className="flex items-center gap-3 text-white/70">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Remote • Worldwide</span>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <p className="text-white/60 text-sm mb-4">Follow us on social media</p>
                <div className="flex gap-4">
                  <motion.a
                    href="https://linkedin.com/in/nishatayub"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 hover:bg-blue-600/20 hover:border-blue-400/50 transition-all"
                  >
                    <FaLinkedin className="text-lg text-white" />
                  </motion.a>
                  <motion.a
                    href="https://github.com/nishatayub"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 hover:bg-gray-600/20 hover:border-gray-400/50 transition-all"
                  >
                    <FaGithub className="text-lg text-white" />
                  </motion.a>
                  <motion.a
                    href="https://instagram.com/nishatayub"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 hover:bg-pink-600/20 hover:border-pink-400/50 transition-all"
                  >
                    <FaInstagram className="text-lg text-white" />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-white/60 text-sm">
                © 2024 CodeUnity. All rights reserved. Built with ❤️ for developers.
              </div>
              
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">
                  Cookie Policy
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
