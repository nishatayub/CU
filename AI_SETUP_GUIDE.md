# AI Integration Troubleshooting Guide

## 🚨 Common Issues and Solutions

### ❌ "OpenAI API key not set" Error

**Problem**: The `.env` file still contains the placeholder text.

**Solution**:
1. Open `server/.env`
2. Replace `your_openai_api_key_here` with your actual API key from OpenAI
3. Restart the server: `npm run dev`

### ❌ "Invalid API Key" Error

**Problem**: The API key is incorrect or malformed.

**Solutions**:
1. **Double-check the key**: Go to [OpenAI API Keys](https://platform.openai.com/api-keys) and create a new one
2. **Check for spaces**: Make sure there are no extra spaces before/after the key
3. **Regenerate**: Delete the old key and create a new one

### ❌ "Insufficient Quota" Error

**Problem**: Your OpenAI account doesn't have billing set up or credits.

**Solutions**:
1. Go to [OpenAI Billing](https://platform.openai.com/account/billing)
2. Add a payment method (credit card)
3. Add some credits ($5-10 is usually enough to start)
4. Set spending limits to control costs

### ❌ "Request failed with status code 429" Error

**Problem**: You've hit the rate limit for API requests.

**Solutions**:
1. Wait a minute and try again
2. Upgrade your OpenAI plan for higher rate limits
3. The error should resolve automatically after a short wait

### ❌ AI Panel Shows "Error: AI service error"

**Problem**: The backend can't connect to OpenAI.

**Solutions**:
1. Check your internet connection
2. Verify the API key is correctly set in `.env`
3. Restart the server: `npm run dev`
4. Check the server logs for specific error messages

## 🧪 Testing Your Setup

Run this command in the `server` directory to test your OpenAI integration:

```bash
node test-openai.js
```

This will verify:
- ✅ API key is set correctly
- ✅ Connection to OpenAI works
- ✅ Your account has credits
- ✅ The AI responds correctly

## 💰 Cost Management

**Typical Usage Costs**:
- Simple code explanation: ~$0.001-0.002
- Code generation: ~$0.002-0.005
- Complex debugging: ~$0.005-0.010

**Cost Control Tips**:
1. Set spending limits in OpenAI dashboard
2. Use GPT-3.5-turbo instead of GPT-4 (10x cheaper)
3. Keep prompts concise
4. Monitor usage in OpenAI dashboard

## 📞 Getting Help

If you're still having issues:

1. **Check server logs**: Look for error messages in the terminal
2. **Test API key**: Run `node test-openai.js` in the server directory
3. **OpenAI Status**: Check [https://status.openai.com](https://status.openai.com)
4. **API Documentation**: [https://platform.openai.com/docs](https://platform.openai.com/docs)

## 🎯 Quick Setup Checklist

- [ ] Created OpenAI account
- [ ] Generated API key
- [ ] Added billing information
- [ ] Updated `.env` file with real API key
- [ ] Restarted server
- [ ] Tested with `node test-openai.js`
- [ ] Verified AI panel works in the app
