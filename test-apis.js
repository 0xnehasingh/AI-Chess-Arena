require('dotenv').config({ path: '.env.local' });

async function testOpenAI() {
  console.log('🤖 Testing OpenAI API...');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY not found in environment');
    return false;
  }

  // Check if it looks like an Anthropic key (common mistake)
  if (apiKey.includes('sk-ant')) {
    console.log('❌ OPENAI_API_KEY appears to be an Anthropic key!');
    console.log('   You have: ' + apiKey.substring(0, 15) + '...');
    console.log('   OpenAI keys should start with: sk-...');
    console.log('   Anthropic keys start with: sk-ant-...');
    return false;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.status === 401) {
      console.log('❌ OpenAI API key is invalid (401 Unauthorized)');
      console.log('   Key starts with:', apiKey.substring(0, 20) + '...');
      return false;
    }

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API key is valid!');
      console.log('   Available models:', data.data.slice(0, 3).map(m => m.id).join(', '), '...');
      return true;
    } else {
      console.log('❌ OpenAI API error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to test OpenAI API:', error.message);
    return false;
  }
}

async function testAnthropic() {
  console.log('\n🤖 Testing Anthropic API...');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment');
    return false;
  }

  // Check if it's actually an Anthropic key
  if (!apiKey.includes('sk-ant')) {
    console.log('⚠️  ANTHROPIC_API_KEY doesn\'t look like an Anthropic key');
    console.log('   Expected format: sk-ant-api...');
    console.log('   You have: ' + apiKey.substring(0, 15) + '...');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });

    if (response.status === 401) {
      console.log('❌ Anthropic API key is invalid (401 Unauthorized)');
      console.log('   Key starts with:', apiKey.substring(0, 25) + '...');
      return false;
    }

    if (response.ok) {
      console.log('✅ Anthropic API key is valid!');
      const data = await response.json();
      console.log('   Model responded successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Anthropic API error:', response.status);
      console.log('   Details:', errorText.substring(0, 100));
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to test Anthropic API:', error.message);
    return false;
  }
}

async function checkAPIUsageInApp() {
  console.log('\n📱 Checking API usage in application...\n');
  
  // Check which files use the APIs
  const fs = require('fs');
  const path = require('path');
  
  const apiRoutes = [
    'app/api/chess-move/route.ts',
    'app/api/ai-move/route.ts'
  ];

  for (const route of apiRoutes) {
    const filePath = path.join(process.cwd(), route);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`📄 ${route}:`);
      if (content.includes('OPENAI_API_KEY')) {
        console.log('   Uses OpenAI API ✓');
      }
      if (content.includes('ANTHROPIC_API_KEY')) {
        console.log('   Uses Anthropic API ✓');
      }
      if (content.includes('openai')) {
        console.log('   Imports OpenAI SDK ✓');
      }
      if (content.includes('@anthropic-ai/sdk')) {
        console.log('   Imports Anthropic SDK ✓');
      }
    } else {
      console.log(`📄 ${route}: Not found`);
    }
  }
}

async function main() {
  console.log('🔧 AI Chess Arena - API Key Validation\n');
  console.log('=' .repeat(50));
  
  const openaiValid = await testOpenAI();
  const anthropicValid = await testAnthropic();
  
  await checkAPIUsageInApp();
  
  console.log('\n' + '=' .repeat(50));
  console.log('\n📊 Summary:');
  console.log('─'.repeat(50));
  
  if (!openaiValid && !anthropicValid) {
    console.log('❌ Both API keys are invalid or incorrect!');
    console.log('\n🔧 How to fix:');
    console.log('1. Get a valid OpenAI API key from: https://platform.openai.com/api-keys');
    console.log('2. Get a valid Anthropic API key from: https://console.anthropic.com/');
    console.log('3. Update your .env.local file with the correct keys');
    console.log('\nMake sure:');
    console.log('- OpenAI key starts with: sk-...');
    console.log('- Anthropic key starts with: sk-ant-api...');
  } else if (!openaiValid) {
    console.log('❌ OpenAI API key needs to be fixed');
    console.log('✅ Anthropic API key is working');
  } else if (!anthropicValid) {
    console.log('✅ OpenAI API key is working');
    console.log('❌ Anthropic API key needs to be fixed');
  } else {
    console.log('✅ Both API keys are valid and working!');
    console.log('\nYour AI chess players should be able to make moves.');
  }
}

main().catch(console.error);