const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

async function testAnthropicAPI() {
  console.log('🤖 Testing Anthropic (Claude) API...\n');
  console.log('=' .repeat(50));
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in .env.local');
    return false;
  }

  console.log('📋 API Key Info:');
  console.log(`   Key starts with: ${apiKey.substring(0, 20)}...`);
  console.log(`   Key length: ${apiKey.length} characters`);
  console.log(`   Format check: ${apiKey.startsWith('sk-ant-') ? '✅ Valid format' : '❌ Invalid format'}`);
  
  console.log('\n' + '─'.repeat(50));
  console.log('\n📡 Testing API connection...\n');

  try {
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Test 1: Simple message
    console.log('Test 1: Simple message...');
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "Hello, I am Claude and I can play chess!" in exactly those words.'
      }]
    });

    console.log('✅ Response:', message.content[0].text);

    // Test 2: Chess-specific test
    console.log('\nTest 2: Chess move generation...');
    const chessMessage = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'In chess notation, what is the best opening move for white? Reply with just the move notation like "e4" or "d4".'
      }]
    });

    console.log('✅ Chess move:', chessMessage.content[0].text.trim());

    // Test 3: Test with chess position (like the app would use)
    console.log('\nTest 3: Analyzing chess position...');
    const positionMessage = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',  // Using Sonnet for better chess analysis
      max_tokens: 100,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `You are playing chess as Black. The current board position in FEN notation is:
rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1

What is your move? Reply with only the move in standard algebraic notation (e.g., "e5", "Nf6").`
      }]
    });

    const move = positionMessage.content[0].text.trim();
    console.log('✅ Claude\'s move:', move);

    console.log('\n' + '=' .repeat(50));
    console.log('\n✅ All Anthropic API tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - API key is valid');
    console.log('   - Claude can respond to messages');
    console.log('   - Claude can generate chess moves');
    console.log('   - Claude can analyze board positions');
    
    return true;

  } catch (error) {
    console.log('\n❌ Anthropic API test failed!');
    console.log('\nError details:');
    
    if (error.status === 401) {
      console.log('   - Authentication failed (invalid API key)');
      console.log('   - Please check your ANTHROPIC_API_KEY in .env.local');
    } else if (error.status === 429) {
      console.log('   - Rate limit exceeded');
      console.log('   - Wait a moment and try again');
    } else if (error.status === 400) {
      console.log('   - Bad request:', error.message);
    } else {
      console.log('   - Error:', error.message);
      console.log('   - Status:', error.status);
    }
    
    return false;
  }
}

async function testChessEndpoint() {
  console.log('\n\n🎮 Testing Chess Move Endpoint...\n');
  console.log('=' .repeat(50));
  
  try {
    // Check if server is running
    const healthCheck = await fetch('http://localhost:3004/');
    if (!healthCheck.ok) {
      console.log('❌ Development server not running on port 3004');
      console.log('   Run: npm run dev');
      return;
    }

    console.log('✅ Server is running on http://localhost:3004');
    
    // Check if ai-move endpoint exists
    const fs = require('fs');
    const path = require('path');
    const endpointPath = path.join(process.cwd(), 'app/api/ai-move/route.ts');
    
    if (fs.existsSync(endpointPath)) {
      console.log('✅ AI move endpoint exists at app/api/ai-move/route.ts');
      
      // Read the file to check implementation
      const content = fs.readFileSync(endpointPath, 'utf-8');
      
      console.log('\n📄 Endpoint implementation check:');
      if (content.includes('ANTHROPIC_API_KEY')) {
        console.log('   ✅ Uses ANTHROPIC_API_KEY');
      }
      if (content.includes('claude-3')) {
        console.log('   ✅ Uses Claude 3 model');
      }
      if (content.includes('chess')) {
        console.log('   ✅ Has chess-specific logic');
      }
    } else {
      console.log('⚠️  AI move endpoint not found');
    }
    
  } catch (error) {
    console.log('❌ Error testing endpoint:', error.message);
  }
}

// Run tests
async function main() {
  const apiWorks = await testAnthropicAPI();
  
  if (apiWorks) {
    await testChessEndpoint();
    
    console.log('\n\n🎉 Claude is ready to play chess!');
    console.log('\nNext steps:');
    console.log('1. Get a valid OpenAI API key for ChatGPT player');
    console.log('2. Update OPENAI_API_KEY in .env.local');
    console.log('3. Both AI players will be able to play!');
  } else {
    console.log('\n\n⚠️  Fix the Anthropic API key first!');
  }
}

main().catch(console.error);