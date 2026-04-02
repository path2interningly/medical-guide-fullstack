const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getAiProviderConfig(requestedModel) {
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: requestedModel || process.env.OPENROUTER_MODEL || 'openai/gpt-4o'
    };
  }

  if (process.env.OPENAI_API_KEY) {
    const fallbackModel = process.env.OPENAI_MODEL || 'gpt-4o';
    const normalizedModel = requestedModel?.startsWith('openai/')
      ? requestedModel.replace('openai/', '')
      : requestedModel?.includes('/')
        ? fallbackModel
        : (requestedModel || fallbackModel);

    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: normalizedModel
    };
  }

  return null;
}

// AI Proxy (OpenRouter) - NO AUTH NEEDED FOR DEVELOPMENT
router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('AI proxy error: No messages provided', req.body);
      return res.status(400).json({ error: 'Messages are required' });
    }

    const aiConfig = getAiProviderConfig(model);

    if (!aiConfig) {
      console.error('AI proxy error: Missing OPENROUTER_API_KEY and OPENAI_API_KEY');
      return res.status(503).json({
        error: 'AI service not configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY in the backend environment.'
      });
    }

    if (aiConfig.provider === 'openrouter') {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiConfig.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'Med in a Pocket'
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages,
          temperature: typeof temperature === 'number' ? temperature : 0.7,
          max_tokens: typeof max_tokens === 'number' ? max_tokens : 4000,
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message = error.error?.message || error.message || 'AI request failed';

        console.error('AI proxy error: Bad OpenRouter response', {
          status: response.status,
          statusText: response.statusText,
          error,
          model: aiConfig.model
        });

        return res.status(response.status).json({ error: message });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return res.json({ content, provider: aiConfig.provider, model: aiConfig.model });
    }

    const client = new OpenAI({ apiKey: aiConfig.apiKey });
    const completion = await client.chat.completions.create({
      model: aiConfig.model,
      messages,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      max_tokens: typeof max_tokens === 'number' ? max_tokens : 4000
    });

    const content = completion.choices?.[0]?.message?.content || '';
    return res.json({ content, provider: aiConfig.provider, model: aiConfig.model });
  } catch (error) {
    const status = error.status || error.code || 500;
    console.error('AI proxy error (exception):', error, req.body);
    return res.status(typeof status === 'number' ? status : 500).json({
      error: error.message || 'AI request failed'
    });
  }
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.template.findMany();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const template = await prisma.template.create({ data: req.body });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Entries
router.get('/entries', async (req, res) => {
  try {
    const entries = await prisma.entry.findMany();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/entries', async (req, res) => {
  try {
    const entry = await prisma.entry.create({ data: req.body });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Medical Cards
router.get('/medical-cards', async (req, res) => {
  try {
    const { specialty, section } = req.query;
    const where = { userId: req.userId };
    if (specialty) where.specialty = specialty;
    if (section) where.section = section;
    
    const cards = await prisma.medicalCard.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/medical-cards', async (req, res) => {
  try {
    const card = await prisma.medicalCard.create({ 
      data: {
        ...req.body,
        userId: req.userId
      }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/medical-cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure user can only update their own cards
    const existing = await prisma.medicalCard.findFirst({
      where: { id, userId: req.userId }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const card = await prisma.medicalCard.update({
      where: { id },
      data: req.body
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/medical-cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure user can only delete their own cards
    const existing = await prisma.medicalCard.findFirst({
      where: { id, userId: req.userId }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    await prisma.medicalCard.delete({ where: { id } });
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Links
router.get('/links', async (req, res) => {
  try {
    const links = await prisma.link.findMany();
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
