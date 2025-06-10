#!/usr/bin/env node
/**
 * OpenAI API Key Test Script
 * Run this to verify your OpenAI API key is working correctly
 */

require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAIKey() {
  console.log('🤖 Testing OpenAI API Key...\n');
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('❌ Error: OpenAI API key not set!');
    console.log('📝 Please update your .env file with a valid OpenAI API key.');
    console.log('🔗 Get your key from: https://platform.openai.com/api-keys\n');
    return;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('🔑 API Key found, testing connection...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Say 'Hello from CodeUnity!' if you can hear me." }
      ],
      max_tokens: 20
    });

    const response = completion.choices[0].message.content;
    console.log('✅ Success! OpenAI API is working correctly.');
    console.log('🤖 AI Response:', response);
    console.log('💰 Tokens used:', completion.usage.total_tokens);
    console.log('\n🎉 Your AI integration is ready to use!');
    
  } catch (error) {
    console.log('❌ Error testing OpenAI API:', error.message);
    
    if (error.code === 'invalid_api_key') {
      console.log('🔑 Your API key appears to be invalid. Please check:');
      console.log('   1. Copy the key correctly from OpenAI dashboard');
      console.log('   2. Make sure there are no extra spaces');
      console.log('   3. Verify the key hasn\'t been revoked');
    } else if (error.code === 'insufficient_quota') {
      console.log('💳 Your OpenAI account doesn\'t have enough credits.');
      console.log('   Add billing information at: https://platform.openai.com/account/billing');
    } else {
      console.log('🔍 Check your internet connection and try again.');
    }
  }
}

// Run the test
testOpenAIKey();
