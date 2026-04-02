# 🔐 Setting Up AI API Keys

The app sends AI requests through the backend at `/api/ai/chat`. The API key belongs in the backend environment, not in the frontend bundle.

## Method 1: Backend .env File (Recommended)

1. **Open** the `.env` file in the `backend/` folder
2. **Get your API key** from [openrouter.ai/keys](https://openrouter.ai/keys) or OpenAI
3. **Paste it** as one of these variables:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   OPENROUTER_MODEL=openai/gpt-4o
   ```

   or

   ```env
   OPENAI_API_KEY=sk-your-key-here
   OPENAI_MODEL=gpt-4o
   ```
4. **Save** the file and restart the backend server
5. **Done!** The AI features will now work

### Security Notes:
- ✅ The secret stays server-side
- ✅ The frontend never needs direct access to the provider key
- ✅ Never commit real keys to git

## Method 2: Settings UI (Alternative)

For production hosting, set `OPENROUTER_API_KEY` or `OPENAI_API_KEY` in the backend service environment variables instead of committing them.

## Testing Without API Key

You can explore the UI without an API key - it will show an error message when you try to generate content.

## Getting an API Key

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up/login with GitHub or Google
3. Navigate to [Keys](https://openrouter.ai/keys)
4. Create a new API key
5. **Free tier available** with rate limits
6. Pay-as-you-go pricing: ~$0.003 per request

## Changing the AI Model

Edit `.env` to use a different model:
```env
OPENROUTER_MODEL=openai/gpt-4o
```

Popular options:
- `openai/gpt-4o` (recommended default)
- `anthropic/claude-3.5-sonnet` (via OpenRouter)
- `anthropic/claude-3-opus` (via OpenRouter)
- `anthropic/claude-3-haiku` (via OpenRouter)
