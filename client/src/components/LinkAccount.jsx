import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaGithub, FaDiscord, FaTimes, FaLink, FaUser, FaCrown } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const LinkAccount = ({ isOpen, onClose, username }) => {
  const { linkAccount, user, isAuthenticated } = useAuth();
  const [linking, setLinking] = useState(false);
  const [linkingProvider, setLinkingProvider] = useState(null);

  const handleLinkProvider = async (provider) => {
    // Validate username before proceeding
    if (!username || username === 'undefined' || username === 'null') {
      alert('Username is required to link accounts. Please refresh the page and try again.');
      return;
    }

    setLinking(true);
    setLinkingProvider(provider);

    try {
      // Simulate OAuth flow (in real implementation, this would redirect to OAuth provider)
      // For demo purposes, we'll create mock provider data
      const mockProviderData = {
        google: {
          id: `google_${Date.now()}`,
          email: `${username}@gmail.com`,
          name: username,
          picture: `https://ui-avatars.com/api/?name=${username}&background=4285f4&color=fff`
        },
        github: {
          id: `github_${Date.now()}`,
          username: username,
          email: `${username}@github.local`,
          avatar_url: `https://ui-avatars.com/api/?name=${username}&background=333&color=fff`
        },
        discord: {
          id: `discord_${Date.now()}`,
          username: username,
          email: `${username}@discord.local`,
          avatar: `https://ui-avatars.com/api/?name=${username}&background=5865f2&color=fff`
        }
      };

      const result = await linkAccount(username, provider, mockProviderData[provider]);
      
      if (result.success) {
        // Close modal on success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        alert(result.message || 'Failed to link account');
      }
    } catch (error) {
      console.error('Error linking account:', error);
      alert('Failed to link account');
    } finally {
      setLinking(false);
      setLinkingProvider(null);
    }
  };

  if (isAuthenticated) {
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
              className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-cyan-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <FaUser className="text-green-400" />
                  Account Linked
                </h3>
                <button
                  onClick={onClose}
                  className="text-white/50 hover:text-white/80 transition-colors p-1"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                  <FaCrown className="text-white text-2xl" />
                </div>
                <h4 className="text-white font-medium mb-2">Welcome back, {user.username}!</h4>
                <p className="text-white/70 text-sm">
                  Your account is already linked and your rooms are saved.
                </p>
                {user.subscription && (
                  <div className="mt-4 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-full inline-block">
                    <span className="text-purple-300 text-sm font-medium capitalize">
                      {user.subscription} Plan
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

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
            className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-cyan-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <FaLink className="text-cyan-400" />
                Link Account
              </h3>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white/80 transition-colors p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/80 text-sm mb-4">
                Link your CodeUnity session to save your rooms, preferences, and unlock premium features.
              </p>
              
              <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-3 mb-4">
                <p className="text-cyan-300 text-xs">
                  💡 <strong>Benefits:</strong> Save room history, sync across devices, unlock AI features, and more!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleLinkProvider('google')}
                disabled={linking}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGoogle className="text-lg" />
                <span className="flex-1">
                  {linking && linkingProvider === 'google' ? 'Linking...' : 'Continue with Google'}
                </span>
                {linking && linkingProvider === 'google' && (
                  <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>

              <button
                onClick={() => handleLinkProvider('github')}
                disabled={linking}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-500/20 border border-gray-400/30 text-gray-300 hover:bg-gray-500/30 hover:border-gray-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGithub className="text-lg" />
                <span className="flex-1">
                  {linking && linkingProvider === 'github' ? 'Linking...' : 'Continue with GitHub'}
                </span>
                {linking && linkingProvider === 'github' && (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>

              <button
                onClick={() => handleLinkProvider('discord')}
                disabled={linking}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDiscord className="text-lg" />
                <span className="flex-1">
                  {linking && linkingProvider === 'discord' ? 'Linking...' : 'Continue with Discord'}
                </span>
                {linking && linkingProvider === 'discord' && (
                  <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-white/50 text-xs">
                Your session will continue normally if you choose not to link an account.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkAccount;
