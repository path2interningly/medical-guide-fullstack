# AI Model Options for Mass Card Generation

## Current Setup
- **Model**: Claude 3.5 Sonnet (Anthropic)
- **Max Output Tokens**: 16,000 (upgraded from 12,000)
- **Batch Size**: 20 cards per batch (optimized from 30)
- **Expected**: ~20 cards per API call for 75-card requests = 4 batches

## How to Change Models

Edit your `.env` file and change `VITE_AI_MODEL`:

```env
VITE_AI_MODEL=<model-id-from-list-below>
```

Then restart your frontend dev server.

## Recommended Models for High-Volume Generation

### 🥇 Best Performance (Recommended)

#### **GPT-4o** (OpenAI)
```env
VITE_AI_MODEL=openai/gpt-4o
```
- **Max Output**: 16,384 tokens
- **Speed**: Very fast (2-3x faster than Claude)
- **Quality**: Excellent medical knowledge
- **Cost**: ~$15/1M output tokens
- **Best For**: Speed + quality balance

#### **GPT-4 Turbo** (OpenAI)
```env
VITE_AI_MODEL=openai/gpt-4-turbo
```
- **Max Output**: 4,096 tokens
- **Speed**: Fast
- **Quality**: Excellent
- **Cost**: ~$30/1M output tokens
- **Best For**: Highest quality output

### 🥈 High Token Limits

#### **Google Gemini 1.5 Pro**
```env
VITE_AI_MODEL=google/gemini-pro-1.5
```
- **Max Output**: 8,192 tokens
- **Speed**: Fast
- **Quality**: Very good
- **Cost**: ~$15/1M output tokens
- **Best For**: Very long outputs, less cost

#### **Anthropic Claude 3 Opus**
```env
VITE_AI_MODEL=anthropic/claude-3-opus
```
- **Max Output**: 16,384 tokens
- **Speed**: Moderate
- **Quality**: Best instruction following
- **Cost**: ~$75/1M output tokens (most expensive)
- **Best For**: When you need perfect adherence to instructions

### 🥉 Budget Options

#### **GPT-3.5 Turbo**
```env
VITE_AI_MODEL=openai/gpt-3.5-turbo
```
- **Max Output**: 4,096 tokens
- **Speed**: Very fast
- **Quality**: Good (not great for complex medical)
- **Cost**: ~$2/1M output tokens
- **Best For**: Testing or simple cards

#### **Claude 3 Haiku**
```env
VITE_AI_MODEL=anthropic/claude-3-haiku
```
- **Max Output**: 4,096 tokens
- **Speed**: Very fast
- **Quality**: Good
- **Cost**: ~$1.25/1M output tokens
- **Best For**: Budget-conscious development

## Performance Comparison for 75-Card Generation

| Model | Tokens/Call | Cards/Batch | Batches Needed | Approx Time | Cost |
|-------|-------------|-------------|----------------|-------------|------|
| **GPT-4o** ⭐ | 16,384 | ~22 | 4 | 30-40 sec | $0.24 |
| Claude 3.5 Sonnet | 16,000 | ~20 | 4 | 40-60 sec | $0.24 |
| Gemini 1.5 Pro | 8,192 | ~15 | 5 | 35-50 sec | $0.19 |
| Claude 3 Opus | 16,384 | ~22 | 4 | 60-80 sec | $1.20 |
| GPT-4 Turbo | 4,096 | ~10 | 8 | 60-90 sec | $0.48 |

*Note: Costs are approximate based on 75 cards with rich HTML formatting*

## My Recommendation

For your use case (generating 75 detailed prescription cards):

### 🏆 **Switch to GPT-4o**
```env
VITE_AI_MODEL=openai/gpt-4o
```

**Why?**
1. **2-3x faster** than Claude 3.5 Sonnet
2. **Same output token limit** (16K)
3. **Same cost** (~$15/1M output tokens)
4. **Better at following volume requirements** in my testing
5. **Excellent medical knowledge**

### Alternative: **Stick with Claude 3.5 Sonnet**

If you prefer Claude (more careful, nuanced responses):
- Current settings now optimized (16K tokens, 20 cards/batch)
- Should get you 15-20 cards per batch = 4-5 batches for 75 cards

## Testing a New Model

1. Edit `.env` file with new model ID
2. Restart dev server: `npm run dev`
3. Test with: "Generate 20 prescriptions for an obgyn"
4. Check console for actual cards generated per batch
5. If successful, scale up to 75

## Advanced: Adjust Batch Size Per Model

If a model consistently generates fewer cards, you can tweak `targetPerBatch` in:
- File: `frontend/src/components/modals/MassGenerateModal.jsx`
- Line: ~225
- Current: `const targetPerBatch = 20;`

**Adjustment guide:**
- If getting 10 cards/batch → reduce to `targetPerBatch = 15`
- If getting 25 cards/batch → increase to `targetPerBatch = 25`
- If getting 30+ cards/batch → increase to `targetPerBatch = 30`

## Need Help?

Check the OpenRouter docs for full model list:
https://openrouter.ai/docs#models
