#!/usr/bin/env node

// Production Debug Endpoint for CodeUnity
// This creates a special debug endpoint to help diagnose production issues

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Debug endpoint that doesn't depend on MongoDB
app.get('/debug', async (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      mongodb_uri_exists: !!process.env.MONGODB_URI,
      mongodb_uri_preview: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@').substring(0, 80) + '...' : 
        'NOT_SET'
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    mongoose: {
      version: mongoose.version,
      connection_state: mongoose.connection.readyState,
      connection_states: {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
      }
    }
  };

  // Try to test MongoDB connection without blocking
  try {
    if (process.env.MONGODB_URI) {
      const connectionTest = mongoose.connection.readyState;
      debugInfo.mongodb_test = {
        ready_state: connectionTest,
        host: mongoose.connection.host || 'not_connected',
        name: mongoose.connection.name || 'not_connected'
      };

      // Only try ping if connected
      if (connectionTest === 1) {
        try {
          await mongoose.connection.db.admin().ping();
          debugInfo.mongodb_test.ping = 'success';
        } catch (pingError) {
          debugInfo.mongodb_test.ping = `failed: ${pingError.message}`;
        }
      } else {
        debugInfo.mongodb_test.ping = 'not_attempted_not_connected';
      }
    } else {
      debugInfo.mongodb_test = 'MONGODB_URI_not_set';
    }
  } catch (error) {
    debugInfo.mongodb_test = `error: ${error.message}`;
  }

  res.json(debugInfo);
});

// Simple health endpoint that doesn't require DB
app.get('/simple-health', (req, res) => {
  res.json({
    status: 'server_running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// MongoDB connection attempt (non-blocking)
if (process.env.MONGODB_URI) {
  console.log('🔄 Attempting MongoDB connection...');
  
  const mongooseOptions = {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    bufferCommands: false,
    maxPoolSize: 5,
    minPoolSize: 1,
    retryWrites: true,
    w: 'majority'
  };

  mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      // Don't exit - we still want the debug endpoints to work
    });

  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected event');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected');
  });
} else {
  console.error('❌ MONGODB_URI not set in environment');
}

// Add the main routes back
app.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  res.json({
    message: "CodeUnity API Server",
    status: "running",
    mongodb: mongoStatus === 1 ? "connected" : "disconnected"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Production debug server running on port ${PORT}`);
  console.log(`🔍 Debug endpoint: http://localhost:${PORT}/debug`);
  console.log(`💚 Simple health: http://localhost:${PORT}/simple-health`);
});
