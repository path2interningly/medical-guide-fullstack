const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all public cards
router.get('/', async (req, res) => {
  try {
    const cards = await prisma.medicalCard.findMany({ where: { isPublic: true } });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make a card public
router.post('/make-public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const card = await prisma.medicalCard.update({
      where: { id },
      data: { isPublic: true }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
