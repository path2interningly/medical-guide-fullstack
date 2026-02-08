# 🔐 Setting Up OpenRouter API Key

## Method 1: .env File (Recommended for Development)

1. **Open** the `.env` file in the `frontend/` folder
2. **Get your API key** from [openrouter.ai/keys](https://openrouter.ai/keys)
3. **Paste it** after `VITE_OPENROUTER_API_KEY=`
   ```env
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
4. **Save** the file - the dev server will auto-restart
5. **Done!** The AI features will now work

### Security Notes:
- ✅ `.env` is already in `.gitignore` - won't be committed to git
- ✅ Key stays on your local machine only
- ✅ Never share your `.env` file

## Method 2: Settings UI (Alternative)

If you prefer not to use `.env`:
1. Open the app
2. Click **⚙️ Settings**
3. Scroll to **🤖 AI Configuration**
4. Paste your API key
5. The key will be saved to browser localStorage

**Note:** .env method is more secure and takes priority over localStorage.

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
VITE_AI_MODEL=anthropic/claude-3.5-sonnet
```

Popular options:
- `anthropic/claude-3.5-sonnet` (best for medical content, default)
- `anthropic/claude-3-opus` (highest quality, more expensive)
- `anthropic/claude-3-haiku` (fastest, cheapest)
- `openai/gpt-4-turbo` (OpenAI alternative)
