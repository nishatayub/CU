#!/usr/bin/env node

// MongoDB Connection Diagnostic Tool for CodeUnity
// Usage: node diagnose-db.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

console.log('🔍 CodeUnity MongoDB Diagnostic Tool');
console.log('=====================================');
console.log(`📅 Timestamp: ${new Date().toISOString()}`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 MongoDB URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
console.log('');

async function runDiagnostics() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Step 1: Testing MongoDB connection...');
    
    // Disable buffering for immediate feedback
    mongoose.set('bufferCommands', false);
    
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    };
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    const connectTime = Date.now() - startTime;
    console.log(`✅ Connected successfully in ${connectTime}ms`);
    console.log(`📊 Connection state: ${mongoose.connection.readyState}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    console.log(`📂 Database: ${mongoose.connection.name}`);
    console.log('');
    
    console.log('🔄 Step 2: Testing database ping...');
    const pingStart = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingTime = Date.now() - pingStart;
    console.log(`✅ Ping successful in ${pingTime}ms`);
    console.log('');
    
    console.log('🔄 Step 3: Testing collection access...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');
    
    console.log('🔄 Step 4: Testing files collection...');
    const filesCollection = mongoose.connection.db.collection('files');
    const fileCount = await filesCollection.countDocuments({});
    console.log(`📄 Files in database: ${fileCount}`);
    
    if (fileCount > 0) {
      const sampleFile = await filesCollection.findOne({});
      console.log(`📝 Sample file structure:`, {
        roomId: sampleFile.roomId,
        fileName: sampleFile.fileName,
        hasContent: !!sampleFile.content,
        contentLength: sampleFile.content?.length || 0,
        createdAt: sampleFile.createdAt,
        updatedAt: sampleFile.updatedAt
      });
    }
    console.log('');
    
    console.log('🔄 Step 5: Testing file operations...');
    const testRoomId = `diagnostic-${Date.now()}`;
    const testFileName = 'diagnostic-test.js';
    
    // Test insert
    const insertStart = Date.now();
    await filesCollection.insertOne({
      roomId: testRoomId,
      fileName: testFileName,
      content: '// Diagnostic test file',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const insertTime = Date.now() - insertStart;
    console.log(`✅ Insert operation completed in ${insertTime}ms`);
    
    // Test find
    const findStart = Date.now();
    const foundFile = await filesCollection.findOne({ roomId: testRoomId, fileName: testFileName });
    const findTime = Date.now() - findStart;
    console.log(`✅ Find operation completed in ${findTime}ms`);
    
    // Test update
    const updateStart = Date.now();
    await filesCollection.updateOne(
      { roomId: testRoomId, fileName: testFileName },
      { $set: { content: '// Updated diagnostic test file', updatedAt: new Date() } }
    );
    const updateTime = Date.now() - updateStart;
    console.log(`✅ Update operation completed in ${updateTime}ms`);
    
    // Test delete (cleanup)
    const deleteStart = Date.now();
    await filesCollection.deleteOne({ roomId: testRoomId, fileName: testFileName });
    const deleteTime = Date.now() - deleteStart;
    console.log(`✅ Delete operation completed in ${deleteTime}ms`);
    console.log('');
    
    const totalTime = Date.now() - startTime;
    console.log('🎉 All diagnostics completed successfully!');
    console.log(`⏱️ Total diagnostic time: ${totalTime}ms`);
    console.log('');
    console.log('📊 Performance Summary:');
    console.log(`   Connection: ${connectTime}ms`);
    console.log(`   Ping: ${pingTime}ms`);
    console.log(`   Insert: ${insertTime}ms`);
    console.log(`   Find: ${findTime}ms`);
    console.log(`   Update: ${updateTime}ms`);
    console.log(`   Delete: ${deleteTime}ms`);
    
    if (insertTime > 5000 || updateTime > 5000) {
      console.log('');
      console.log('⚠️  WARNING: Some operations took longer than 5 seconds.');
      console.log('   This may indicate network latency or database performance issues.');
    }
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error('');
    console.error('❌ Diagnostic failed!');
    console.error(`⏱️ Failed after: ${errorTime}ms`);
    console.error(`🔍 Error type: ${error.name}`);
    console.error(`📝 Error message: ${error.message}`);
    
    if (error.name === 'MongoTimeoutError' || error.message.includes('timeout')) {
      console.error('');
      console.error('💡 Timeout detected. This usually indicates:');
      console.error('   1. Network connectivity issues');
      console.error('   2. MongoDB Atlas cluster is starting up (cold start)');
      console.error('   3. Database is under heavy load');
      console.error('   4. Firewall blocking connection');
    } else if (error.name === 'MongoNetworkError') {
      console.error('');
      console.error('💡 Network error detected. This usually indicates:');
      console.error('   1. DNS resolution issues');
      console.error('   2. Network connectivity problems');
      console.error('   3. MongoDB service is down');
    } else if (error.name === 'MongoParseError') {
      console.error('');
      console.error('💡 Connection string error detected:');
      console.error('   1. Check MONGODB_URI format');
      console.error('   2. Verify credentials');
      console.error('   3. Check for special characters in password');
    }
    
    console.error('');
    console.error('🔧 Suggested actions:');
    console.error('   1. Wait 30-60 seconds and try again (for cold starts)');
    console.error('   2. Check MongoDB Atlas cluster status');
    console.error('   3. Verify network connectivity');
    console.error('   4. Check server logs for more details');
    
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connection closed');
    }
  }
}

runDiagnostics();
