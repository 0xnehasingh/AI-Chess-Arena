# Blockchain Integration Setup

This document explains how to set up the blockchain integration for recording chess moves on the Moonbeam testnet.

## Smart Contract Details

- **Contract Address**: `0xE47D88e3c52e0D2B14298Cd1Dd9A9800deAbf225`
- **Network**: Moonbeam testnet (Chain ID: 1287)
- **RPC URL**: `https://rpc.testnet.moonbeam.network`

## Setup Instructions

### 1. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your wallet private key to the `.env` file:
   ```
   WALLET_PRIVATE_KEY=your_private_key_here_without_0x_prefix
   ```

   **Important**: 
   - The private key should NOT include the `0x` prefix
   - This wallet must have MOVR tokens for gas fees
   - This wallet must be authorized as an organizer on the smart contract

### 2. Get Test Tokens

1. Get DEV tokens from the Moonbeam testnet faucet: https://apps.moonbeam.network/faucet/
2. Your wallet address needs to be added as an authorized organizer by the contract owner

### 3. API Endpoints

The integration includes two main API endpoints:

#### Create Match
- **Endpoint**: `POST /api/create-match`
- **Purpose**: Creates a new chess match on the blockchain
- **Body**:
  ```json
  {
    "whitePlayer": "Claude",
    "blackPlayer": "ChatGPT",
    "initialFen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }
  ```

#### Record Move
- **Endpoint**: `POST /api/record-move`
- **Purpose**: Records a chess move to the blockchain
- **Body**:
  ```json
  {
    "matchId": 1,
    "player": "Claude",
    "moveNotation": "e4",
    "fromSquare": "e2",
    "toSquare": "e4",
    "fenPosition": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "evaluation": 0.1,
    "isCheck": false,
    "isCheckmate": false,
    "isStalemate": false,
    "isDraw": false
  }
  ```

### 4. Integration Flow

1. When a new game starts, the `LiveMatch` component automatically creates a match on the blockchain
2. Each move made by either AI player is automatically recorded to the blockchain
3. The game continues normally even if blockchain recording fails (graceful degradation)

### 5. Smart Contract Functions Used

- `createMatch()`: Creates a new chess match
- `recordMove()`: Records individual chess moves
- `getMatchMoves()`: Retrieves all moves for a match (used by GET endpoint)

### 6. Error Handling

- If blockchain recording fails, the game continues normally
- Errors are logged to console for debugging
- Fallback match ID is used if match creation fails

## Development Notes

- The integration uses ethers.js v6 for blockchain interactions
- Move evaluations are stored with 18 decimal precision (wei format)
- Player types are mapped: Claude = 0, ChatGPT = 1
- All blockchain operations are asynchronous and non-blocking to the game flow

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the live match page and start a game
3. Check browser console for blockchain transaction logs
4. Verify moves are recorded on the blockchain using a block explorer

## Troubleshooting

- **"Wallet private key not configured"**: Add WALLET_PRIVATE_KEY to .env file
- **"Insufficient funds"**: Get more DEV tokens from the faucet
- **"Not authorized"**: Contact contract owner to add your address as an organizer
- **Network errors**: Check RPC URL and network connectivity 