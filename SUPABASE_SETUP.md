# Supabase Database Setup Guide

This guide will help you set up Supabase for your AI Chess Arena betting application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your Supabase project created

## Step 1: Install Dependencies

First, install the required Supabase dependencies:

```bash
npm install @supabase/supabase-js
```

## Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (something like `https://your-project.supabase.co`)
   - **Public anon key** (starts with `eyJ...`)
   - **Service role key** (starts with `eyJ...`) - **Keep this secret!**

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
   ```

## Step 4: Set Up the Database Schema

### Option A: Using the API Route (Recommended for Development)

1. Make sure your environment is set to development:
   ```env
   NODE_ENV=development
   ```

2. Start your development server:
   ```bash
   npm run dev
   ```

3. Call the setup API endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/setup-database
   ```

   Or visit `http://localhost:3000/api/setup-database` in your browser and use the POST method.

### Option B: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and execute the SQL in the editor

## Step 5: Verify the Setup

1. Check that the database is set up correctly:
   ```bash
   curl http://localhost:3000/api/setup-database
   ```

2. Or visit the Supabase dashboard:
   - Go to **Table Editor**
   - You should see the following tables:
     - `profiles`
     - `matches`
     - `bets`
     - `tournaments`
     - `match_moves`

## Database Schema Overview

### Tables Created

1. **profiles** - User profiles and betting statistics
2. **tournaments** - Chess tournaments (DeFi Core, Moonbeam, NodeOps)
3. **matches** - Individual chess matches between AI champions
4. **bets** - User bets on match outcomes
5. **match_moves** - Individual moves in chess games

### Sample Data

The setup includes sample tournaments:
- AI Chess Championship 2024 (DeFi Core)
- Moonbeam AI Tournament (Moonbeam Foundation)
- NodeOps Challenge (NodeOps)

## Security Features

- **Row Level Security (RLS)** enabled on sensitive tables
- Users can only access their own profile and bets
- Public read access to matches, tournaments, and moves
- Secure authentication through Supabase Auth

## Real-time Features

The database is configured for real-time updates:
- Live match updates
- Real-time betting pool changes
- Live move-by-move game updates

## API Integration

Use the database utilities in `lib/database.ts` for:
- Profile management
- Match operations
- Betting functionality
- Tournament data
- Statistics and leaderboards

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure `.env.local` is in the root directory
2. **API connection errors**: Verify your Supabase URL and keys
3. **RLS policies blocking access**: Check that authentication is properly set up
4. **Migration errors**: Run the SQL manually via Supabase dashboard

### Test Database Connection

```javascript
// Test in your browser console or API route
import { supabase } from './lib/supabase'

const test = await supabase.from('tournaments').select('*')
console.log(test)
```

## Next Steps

After setup is complete:

1. Set up authentication (Supabase Auth)
2. Configure real-time subscriptions
3. Implement betting logic with blockchain integration
4. Set up automated match creation and management

## Development vs Production

- The setup API route only works in development mode
- For production, use Supabase migrations or manual SQL execution
- Always use environment variables for credentials
- Consider setting up staging and production Supabase projects

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify environment variables are correctly set
3. Review the API route responses for detailed error messages
4. Consult the Supabase documentation at [docs.supabase.com](https://docs.supabase.com) 