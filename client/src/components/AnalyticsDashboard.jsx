import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaCode, FaRobot, FaClock, FaDatabase } from 'react-icons/fa';
import axios from 'axios';

const BACKEND_URL = import.meta.env.PROD 
  ? 'https://cu-669q.onrender.com'
  : 'http://localhost:8080';

const AnalyticsDashboard = ({ roomId, isVisible, onClose }) => {
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    totalFiles: 0,
    totalAIRequests: 0,
    totalChatMessages: 0,
    averageSessionTime: 0,
    topFeatures: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible && roomId) {
      fetchAnalytics();
    }
  }, [isVisible, roomId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simulate analytics data (in production, this would come from actual analytics)
      const mockAnalytics = {
        totalSessions: Math.floor(Math.random() * 100) + 50,
        totalFiles: Math.floor(Math.random() * 50) + 10,
        totalAIRequests: Math.floor(Math.random() * 200) + 100,
        totalChatMessages: Math.floor(Math.random() * 500) + 200,
        averageSessionTime: Math.floor(Math.random() * 30) + 15, // minutes
        topFeatures: [
          { name: 'AI Chat', usage: 85 },
          { name: 'Code Collaboration', usage: 72 },
          { name: 'File Management', usage: 68 },
          { name: 'Code Execution', usage: 45 },
          { name: 'Debugging', usage: 38 }
        ]
      };

      // Add some delay to simulate real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 backdrop-blur-xl border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Room Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/20">
                <div className="flex items-center gap-3">
                  <FaUsers className="text-blue-400" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-white">{analytics.totalSessions}</div>
                    <div className="text-sm text-blue-300">Total Sessions</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/20">
                <div className="flex items-center gap-3">
                  <FaCode className="text-green-400" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-white">{analytics.totalFiles}</div>
                    <div className="text-sm text-green-300">Files Created</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/20">
                <div className="flex items-center gap-3">
                  <FaRobot className="text-purple-400" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-white">{analytics.totalAIRequests}</div>
                    <div className="text-sm text-purple-300">AI Requests</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/20">
                <div className="flex items-center gap-3">
                  <FaDatabase className="text-orange-400" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-white">{analytics.totalChatMessages}</div>
                    <div className="text-sm text-orange-300">Chat Messages</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-xl p-4 border border-teal-400/20">
                <div className="flex items-center gap-3">
                  <FaClock className="text-teal-400" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-white">{analytics.averageSessionTime}m</div>
                    <div className="text-sm text-teal-300">Avg Session Time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Usage Chart */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Feature Usage</h3>
              <div className="space-y-3">
                {analytics.topFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-300">{feature.name}</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${feature.usage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-300 text-right">{feature.usage}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Status */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-6 border border-emerald-400/20">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-green-300">AI Service</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-green-300">Database</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-green-300">WebSocket</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-green-300">Email Service</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Refresh Data
              </button>
              <button
                onClick={() => {
                  // Export analytics data
                  const dataStr = JSON.stringify(analytics, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `analytics-${roomId}-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Export Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
