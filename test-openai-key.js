async function testOpenAIKey(apiKey) {
  console.log('🤖 Testing OpenAI API Key...\n');
  console.log('=' .repeat(50));
  
  console.log('📋 Key Info:');
  console.log(`   Key starts with: ${apiKey.substring(0, 15)}...`);
  console.log(`   Key length: ${apiKey.length} characters`);
  console.log(`   Format: ${apiKey.startsWith('sk-') ? '✅ Valid format' : '❌ Invalid format'}`);
  
  console.log('\n📡 Testing API connection...\n');

  try {
    // Test 1: Check models endpoint
    console.log('Test 1: Checking API access...');
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.status === 401) {
      console.log('❌ API key is invalid (401 Unauthorized)');
      return false;
    }

    if (!response.ok) {
      console.log(`❌ API error: ${response.status} ${response.statusText}`);
      const error = await response.text();
      console.log('   Details:', error.substring(0, 200));
      return false;
    }

    const data = await response.json();
    console.log('✅ API key is valid!');
    console.log(`   Found ${data.data.length} available models`);
    
    // Show some available models
    const importantModels = data.data
      .filter(m => m.id.includes('gpt'))
      .slice(0, 5)
      .map(m => m.id);
    console.log('   GPT models:', importantModels.join(', '));

    // Test 2: Make a simple completion
    console.log('\nTest 2: Testing chat completion...');
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "Hello, I am ChatGPT and I can play chess!"' }
        ],
        max_tokens: 50
      })
    });

    if (!chatResponse.ok) {
      const error = await chatResponse.text();
      console.log('❌ Chat completion failed:', chatResponse.status);
      console.log('   Error:', error.substring(0, 200));
      return false;
    }

    const chatData = await chatResponse.json();
    console.log('✅ Chat completion works!');
    console.log('   Response:', chatData.choices[0].message.content);

    // Test 3: Chess-specific test
    console.log('\nTest 3: Testing chess move generation...');
    const chessResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'user', 
            content: 'In chess, what is the best opening move for white? Reply with just the move like "e4" or "d4".' 
          }
        ],
        max_tokens: 10,
        temperature: 0.3
      })
    });

    if (chessResponse.ok) {
      const chessData = await chessResponse.json();
      console.log('✅ Chess move generation works!');
      console.log('   ChatGPT suggests:', chessData.choices[0].message.content.trim());
    }

    console.log('\n' + '=' .repeat(50));
    console.log('\n✅ OpenAI API key is fully functional!');
    return true;

  } catch (error) {
    console.log('\n❌ Error testing API:', error.message);
    return false;
  }
}

// Test the provided key
const apiKey = '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';

testOpenAIKey(apiKey).then(success => {
  if (success) {
    console.log('\n✅ This OpenAI key works!');
    console.log('\nNext step: Update your .env.local file');
    console.log('Replace the OPENAI_API_KEY line with:');
    console.log(`OPENAI_API_KEY=${apiKey}`);
  } else {
    console.log('\n❌ This OpenAI key does not work.');
    console.log('Please check the key and try again.');
  }
}).catch(console.error);