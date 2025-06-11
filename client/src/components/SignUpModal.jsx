import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGoogle, FaGithub, FaEnvelope, FaLock, FaUser, FaCrown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SignUpModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store auth token
      localStorage.setItem('codeunity_token', 'demo-auth-token');
      localStorage.setItem('codeunity_user', JSON.stringify({
        username: formData.username || formData.email,
        email: formData.email,
        plan: 'free'
      }));

      onSuccess();
      onClose();
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    // Simulate social auth
    localStorage.setItem('codeunity_token', 'demo-auth-token');
    localStorage.setItem('codeunity_user', JSON.stringify({
      username: `user_${provider}`,
      email: `user@${provider}.com`,
      plan: 'free'
    }));
    onSuccess();
    onClose();
  };

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-cyan-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-xl">
                  🚀 Continue Using CodeUnity
                </h3>
                <button
                  onClick={onClose}
                  className="text-white/50 hover:text-white/80 transition-colors p-1"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Usage Limit Message */}
              <div className="mb-6 p-4 bg-orange-500/20 border border-orange-400/30 rounded-lg">
                <h4 className="text-orange-300 font-medium mb-2">Free Usage Limit Reached</h4>
                <p className="text-orange-200 text-sm">
                  You've used your 3 free sessions! Sign up to continue using all features, or upgrade for unlimited access.
                </p>
              </div>

              {/* Benefits */}
              <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
                <h4 className="text-cyan-300 font-medium mb-3">What you'll get:</h4>
                <ul className="space-y-2 text-cyan-200 text-sm">
                  <li className="flex items-center gap-2">
                    <FaCrown className="w-3 h-3 text-yellow-400" />
                    Unlimited room usage
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCrown className="w-3 h-3 text-yellow-400" />
                    Access to AI assistant
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCrown className="w-3 h-3 text-yellow-400" />
                    Chat & collaboration features
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCrown className="w-3 h-3 text-yellow-400" />
                    File management & sharing
                  </li>
                </ul>
              </div>

              {/* Quick Upgrade Option */}
              <div className="mb-6">
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                >
                  🚀 Upgrade to Pro - $9/month
                </button>
                <p className="text-gray-400 text-xs text-center mt-2">
                  Or sign up for free account below
                </p>
              </div>

              {/* Auth Toggle */}
              <div className="flex mb-6 bg-black/30 rounded-lg p-1">
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    isSignUp
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    !isSignUp
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Social Auth */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialAuth('google')}
                  className="w-full flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                >
                  <FaGoogle className="w-5 h-5 text-red-400" />
                  Continue with Google
                </button>
                <button
                  onClick={() => handleSocialAuth('github')}
                  className="w-full flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                >
                  <FaGithub className="w-5 h-5" />
                  Continue with GitHub
                </button>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="px-3 text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    isSignUp ? 'Create Free Account' : 'Sign In'
                  )}
                </button>
              </form>

              <p className="text-gray-400 text-xs text-center mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignUpModal;