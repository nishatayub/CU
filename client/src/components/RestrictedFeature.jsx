import React from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaCrown } from 'react-icons/fa';

const RestrictedFeature = ({ 
  featureName, 
  children, 
  onUpgrade, 
  remainingUsage,
  isAuthenticated = false 
}) => {
  return (
    <div className="relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-purple-900/30 to-black/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl max-w-sm"
        >
          <div className="mb-4">
            <FaLock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-lg mb-2">
              {featureName} Locked
            </h3>
            <p className="text-gray-300 text-sm">
              {isAuthenticated 
                ? "Upgrade to unlock this feature"
                : `Free usage limit reached. ${remainingUsage} sessions remaining.`
              }
            </p>
          </div>
          
          <button
            onClick={onUpgrade}
            className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaCrown className="w-4 h-4" />
            {isAuthenticated ? 'Upgrade Now' : 'Sign Up Free'}
          </button>
        </motion.div>
      </div>
      
      {/* Blurred Content */}
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default RestrictedFeature;