/**
 * BistroTranslate Server - Express API & Static Server
 * Hacktoberfest 2026: Week 2 DEV Challenge (Side Hustle)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { SAMPLE_PRESETS, ALLERGEN_TAXONOMY } = require('./src/culinaryData');
const { processMenuItem } = require('./src/aiEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Supported target languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇦🇪' }
];

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BistroTranslate AI',
    version: '1.0.0',
    theme: 'Hacktoberfest 2026 Week 2: Side Hustle',
    timestamp: new Date().toISOString()
  });
});

// Presets endpoint
app.get('/api/presets', (req, res) => {
  res.json(SAMPLE_PRESETS);
});

// Allergen taxonomy endpoint
app.get('/api/allergens', (req, res) => {
  res.json(ALLERGEN_TAXONOMY);
});

// Languages endpoint
app.get('/api/languages', (req, res) => {
  res.json(SUPPORTED_LANGUAGES);
});

// Ollama connectivity check endpoint
app.post('/api/check-ollama', async (req, res) => {
  const host = req.body.host || 'http://localhost:11434';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${host.replace(/\/$/, '')}/api/tags`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const models = data.models ? data.models.map(m => m.name) : [];
      return res.json({ connected: true, models, host });
    }
    return res.json({ connected: false, error: `Ollama returned HTTP ${response.status}`, host });
  } catch (err) {
    return res.json({ connected: false, error: err.message, host });
  }
});

// Main translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { items, targetLanguage = 'English', restaurantContext = {}, config = {} } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of menu items to translate' });
    }

    const translatedItems = [];
    for (const item of items) {
      const processed = await processMenuItem(item, targetLanguage, restaurantContext, config);
      translatedItems.push(processed);
    }

    res.json({
      success: true,
      restaurantName: restaurantContext.restaurantName || 'Bistro Menu',
      cuisine: restaurantContext.cuisine || 'Regional Cuisine',
      targetLanguage,
      totalDishes: translatedItems.length,
      engine: translatedItems[0]?.engineUsed || 'Built-in Culinary Knowledge Engine',
      items: translatedItems
    });
  } catch (err) {
    console.error('Error in /api/translate:', err);
    res.status(500).json({ error: 'Failed to translate menu items', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🍽️  BistroTranslate AI - Hacktoberfest Week 2: Side Hustle`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`💡 Mode: Open-Weight Models & Culinary Knowledge Engine`);
  console.log(`=======================================================`);
});
