import React from 'react';
import { motion } from 'framer-motion';
import codeunityLogo from '../assets/CodeUnity.png';

function MobileError() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center">
            <img src={codeunityLogo} alt="CodeUnity" className="h-16" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">
              Desktop Experience Required
            </h1>
            <p className="text-gray-400">
              CodeUnity's collaborative features are optimized for desktop devices. 
              Please switch to a desktop browser to access the full editor experience.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-600/20 blur-xl"></div>
            <motion.div 
              className="relative bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-600/10 backdrop-blur-xl rounded-xl p-6 border border-white/10"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-300">
                For the best experience, use a desktop or laptop computer with a modern web browser.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MobileError;
