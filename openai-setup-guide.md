# OpenAI API Key Setup Guide

## Getting a Valid OpenAI API Key

### Step 1: Create/Verify OpenAI Account
1. Go to https://platform.openai.com/signup
2. Sign up or log in with your account
3. Verify your email if needed

### Step 2: Add Payment Method (Required)
1. Go to https://platform.openai.com/settings/organization/billing
2. Click "Add payment method"
3. Add a credit card
4. Set up a monthly budget (even $5 is enough to start)

### Step 3: Create API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a name like "AI Chess Arena"
4. **IMPORTANT**: Copy the key immediately (you won't see it again!)

### Step 4: Verify the Key Format
Your key should:
- Start with `sk-proj-` (new format) or `sk-` (old format)
- Be around 50-200 characters long
- Contain only letters, numbers, and hyphens

### Common Issues and Solutions

#### ❌ 401 Unauthorized
- **No credits**: Add payment method and credits
- **Expired key**: Create a new one
- **Wrong key**: Double-check you copied it correctly

#### ❌ 429 Rate Limit
- **Free tier limit**: Upgrade to paid tier
- **Too many requests**: Wait a bit and try again

#### ❌ 403 Forbidden
- **API access disabled**: Check account settings
- **Region restrictions**: Some regions blocked

### Testing Your Key
Once you have a key, test it:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY_HERE"
```

If it works, you'll see a list of models.

### Minimal Working Example
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_KEY_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }],
    max_tokens: 50
  })
});
```

## Alternative: Use Only Claude

If you can't get an OpenAI key, the app can work with just Claude:
1. Both players will use Anthropic's API
2. Modify the code to use Claude for both sides
3. This is actually fine for testing!

## Quick Fix for Testing

To make both players use Claude (Anthropic), we can modify the AI move endpoint to always use Anthropic regardless of the champion selected.