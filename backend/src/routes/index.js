const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');

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
