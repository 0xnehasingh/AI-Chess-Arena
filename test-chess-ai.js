require('dotenv').config({ path: '.env.local' });

async function testClaudeChessMove() {
  console.log('♟️  Testing Claude Chess AI...\n');
  console.log('=' .repeat(50));
  
  const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const afterE4Position = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
  
  try {
    // Test the API endpoint
    const response = await fetch('http://localhost:3004/api/ai-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen: afterE4Position,
        champion: 'Claude'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ API call failed:', response.status);
      console.log('   Error:', error);
      return false;
    }

    const data = await response.json();
    console.log('✅ Claude made a move!');
    console.log('   New position FEN:', data.fen);
    console.log('   Move reasoning:', data.reasoning || 'Not provided');
    
    // Parse the move
    const Chess = require('chess.js').Chess;
    const chess = new Chess(afterE4Position);
    const beforeMoves = chess.moves();
    
    chess.load(data.fen);
    console.log('   Legal moves were:', beforeMoves.slice(0, 10).join(', '), '...');
    
    return true;
    
  } catch (error) {
    console.log('❌ Error testing Claude:', error.message);
    return false;
  }
}

async function testDirectAnthropicCall() {
  console.log('\n\n🔧 Testing Direct Anthropic Call...\n');
  console.log('=' .repeat(50));
  
  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',  // Latest model
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'In chess, what is a good response to 1.e4? Just name the move in algebraic notation.'
      }]
    });

    console.log('✅ Direct API call successful!');
    console.log('   Claude suggests:', response.content[0].text);
    return true;
    
  } catch (error) {
    if (error.status === 404) {
      console.log('❌ Model not available. Trying fallback model...');
      
      // Try with haiku model
      try {
        const response2 = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: 'In chess, what is a good response to 1.e4? Just name the move.'
          }]
        });
        
        console.log('✅ Fallback model works!');
        console.log('   Claude (Haiku) suggests:', response2.content[0].text);
        console.log('\n⚠️  Note: Update ai-move/route.ts to use claude-3-haiku-20240307');
        return true;
      } catch (err) {
        console.log('❌ Both models failed:', err.message);
        return false;
      }
    }
    
    console.log('❌ API error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎮 AI Chess Arena - Anthropic Integration Test\n');
  
  // Check if server is running
  try {
    const health = await fetch('http://localhost:3004/');
    if (!health.ok) throw new Error('Server not responding');
    console.log('✅ Development server is running\n');
  } catch (error) {
    console.log('❌ Server not running. Start it with: npm run dev');
    console.log('   Then run this test again.\n');
    
    // Still test direct API
    await testDirectAnthropicCall();
    return;
  }
  
  // Test Claude chess move
  const chessWorks = await testClaudeChessMove();
  
  // Test direct API call
  const directWorks = await testDirectAnthropicCall();
  
  console.log('\n\n📊 Summary:');
  console.log('=' .repeat(50));
  
  if (chessWorks && directWorks) {
    console.log('✅ Anthropic/Claude is fully working!');
    console.log('   - API key is valid');
    console.log('   - Claude can make chess moves');
    console.log('   - Integration is functional');
  } else if (directWorks && !chessWorks) {
    console.log('⚠️  Anthropic API works but chess endpoint has issues');
    console.log('   - Check /api/ai-move endpoint');
    console.log('   - May need to update model name');
  } else {
    console.log('❌ Anthropic integration needs fixing');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Get a valid OpenAI API key');
  console.log('2. Update OPENAI_API_KEY in .env.local');
  console.log('3. Both AI players will work!');
}

main().catch(console.error);