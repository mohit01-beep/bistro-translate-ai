/**
 * BistroTranslate - Open-Weight Model Agent Pipeline
 * Supports:
 * 1. Local Ollama (llama3.2, qwen2.5, mistral, gemma2, etc.)
 * 2. Hugging Face / OpenRouter open weights
 * 3. Semantic Culinary Knowledge Engine (Zero-Latency Local Fallback)
 */

const { ALLERGEN_TAXONOMY, CULTURAL_EXPLANATIONS } = require('./culinaryData');

/**
 * Audit ingredients and descriptions against the 14-major allergen taxonomy
 */
function auditAllergens(textToScan) {
  if (!textToScan) return { detected: [], dietary: { vegetarian: true, vegan: true, halalFriendly: true, glutenFree: true } };

  const lower = textToScan.toLowerCase();
  const detected = [];

  for (const [key, meta] of Object.entries(ALLERGEN_TAXONOMY)) {
    const matchedIndicators = meta.indicators.filter(ind => lower.includes(ind));
    if (matchedIndicators.length > 0) {
      detected.push({
        id: key,
        name: meta.name,
        icon: meta.icon,
        matched: matchedIndicators.slice(0, 3)
      });
    }
  }

  // Dietary checks
  const meatIndicators = ['beef', 'pork', 'chicken', 'lamb', 'veal', 'tripe', 'tongue', 'bacon', 'ham', 'fish', 'tuna', 'salmon', 'octopus', 'shrimp', 'crab', 'anchovy', 'duck'];
  const dairyEggIndicators = ['milk', 'cream', 'cheese', 'butter', 'ghee', 'egg', 'pecorino', 'parmesan', 'mozzarella', 'paneer', 'mayo', 'mayonnaise'];
  const porkAlcoholIndicators = ['pork', 'bacon', 'ham', 'prosciutto', 'lard', 'wine', 'mirin', 'sake', 'beer', 'bourbon'];

  const hasMeat = meatIndicators.some(m => lower.includes(m));
  const hasDairyOrEgg = dairyEggIndicators.some(d => lower.includes(d));
  const hasPorkOrAlcohol = porkAlcoholIndicators.some(p => lower.includes(p));
  const hasGluten = detected.some(a => a.id === 'gluten');

  return {
    detected,
    dietary: {
      vegetarian: !hasMeat,
      vegan: !hasMeat && !hasDairyOrEgg,
      halalFriendly: !hasPorkOrAlcohol,
      glutenFree: !hasGluten
    }
  };
}

/**
 * Build the system prompt enforcing cultural nuance over literal translation
 */
function buildPrompt(item, targetLanguage, restaurantContext) {
  return `You are BistroTranslate AI, an expert cultural culinary translator and food safety sommelier.
Your mission is to translate and interpret local, traditional restaurant dishes for international tourists.

NEVER perform crude literal translations that confuse or repulse diners (e.g. do NOT translate "夫妻肺片" as "Husband and Wife Lungs", do NOT translate "蚂蚁上树" as "Ants Climbing a Tree" without explaining it is glass noodles with pork).

Restaurant Details:
- Name: ${restaurantContext.restaurantName || 'Local Bistro'}
- Cuisine: ${restaurantContext.cuisine || 'Traditional Regional'}
- Source Language: ${restaurantContext.sourceLanguage || 'Original'}
- Target Language for Tourists: ${targetLanguage || 'English'}

Dish Details:
- Original Name: ${item.originalName}
- Category: ${item.category}
- Price: ${item.price}
- Chef's Description: ${item.rawDescription || ''}
- Known Ingredients: ${item.ingredients || ''}

Respond STRICTLY with a valid JSON object with these keys:
{
  "localizedTitle": "A clear, appetizing and authentic title in ${targetLanguage}",
  "pronunciationGuide": "Phonetic pronunciation or romanization (e.g., Pinyin, Romaji) so tourists can speak to staff",
  "appetizingDescription": "A 2-3 sentence mouthwatering sensory description highlighting taste, texture, and cooking method",
  "literalNameMeaning": "Literal word-by-word meaning if distinct from the actual dish (or null if straightforward)",
  "culturalContext": "1-2 sentences on historical origin, region, or why locals love it",
  "flavorProfile": ["Array of 3-4 vivid tasting notes like 'Smoky', 'Umami', 'Crispy', 'Citrusy'"],
  "spiceLevel": "Mild | Medium | Hot | Extra Hot | None",
  "waiterHelpPhrase": "A short polite phrase in the restaurant's source language the tourist can point to or say, e.g. 'One order of this, please'"
}`;
}

/**
 * Call Local Ollama endpoint
 */
async function callOllama(prompt, model = 'llama3.2', host = 'http://localhost:11434') {
  const url = `${host.replace(/\/$/, '')}/api/generate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.3
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama responded with HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.response;
  return JSON.parse(text);
}

/**
 * Call Hugging Face Inference API with open-weight models
 */
async function callHuggingFace(prompt, model = 'Qwen/Qwen2.5-7B-Instruct', apiKey) {
  if (!apiKey) throw new Error('Hugging Face API key is required');
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 800,
        temperature: 0.3,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error (${response.status}): ${await response.text()}`);
  }

  const result = await response.json();
  const rawText = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;

  // Extract JSON block if surrounded by markdown code blocks
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Could not parse JSON response from Hugging Face model');
}

/**
 * Semantic Culinary Knowledge Engine (Zero-latency local fallback)
 * Uses the built-in culinary ontology when external daemon is offline.
 */
function localSemanticTranslate(item, targetLanguage = 'English', restaurantContext = {}) {
  const name = item.originalName.toLowerCase();
  const desc = (item.rawDescription || '').toLowerCase();
  const ing = (item.ingredients || '').toLowerCase();

  let matchedStory = null;
  for (const [key, val] of Object.entries(CULTURAL_EXPLANATIONS)) {
    if (name.includes(key.toLowerCase()) || desc.includes(key.toLowerCase()) || ing.includes(key.toLowerCase())) {
      matchedStory = val;
      break;
    }
  }

  // Generate localized titles and descriptions based on dish patterns
  let localizedTitle = item.originalName;
  let literalMeaning = matchedStory?.literalName || null;
  let culturalContext = matchedStory?.story || `A time-honored traditional recipe from ${restaurantContext.cuisine || 'local regional'} cuisine, crafted using authentic preparation methods.`;
  let flavorNotes = matchedStory?.flavorNotes ? matchedStory.flavorNotes.split(',').map(s => s.trim()) : ['Savory', 'Aromatic', 'Balanced'];
  let spiceLevel = 'Mild';
  let pronunciation = '';
  let waiterPhrase = `请来一份这个 (One order of this, please)`;

  if (item.originalName.includes('夫妻肺片')) {
    localizedTitle = targetLanguage === 'Spanish' ? 'Láminas de Ternera y Callos al Aceite de Chile Sichuan' :
                     targetLanguage === 'French' ? 'Émincé de Bœuf et Tripes à l\'Huile Pimentée du Sichuan' :
                     'Chilled Spiced Beef Shank & Honeycomb Tripe in Aromatic Sichuan Chili Oil';
    pronunciation = 'Foo-chee Fay-pyen';
    spiceLevel = 'Hot';
    flavorNotes = ['Mala Numbing', 'Toasted Sesame', 'Savory Crispy Peanuts', 'Deep Umami'];
    waiterPhrase = '请来一份夫妻肺片 (Qǐng lái yí fèn Fūqī Fèipiàn)';
  } else if (item.originalName.includes('蚂蚁上树')) {
    localizedTitle = targetLanguage === 'Spanish' ? 'Fideos de Soja Salteados con Carne de Cerdo y Pasta Doubanjiang' :
                     targetLanguage === 'French' ? 'Vermicelles Sautés au Porc Haché et Pâte de Soja Fermentée' :
                     'Stir-Fried Silky Glass Noodles with Savory Minced Pork & Chili Bean Glaze';
    pronunciation = 'Mah-yee Shahng Shoo';
    spiceLevel = 'Medium';
    flavorNotes = ['Springy Texture', 'Fermented Chili Warmth', 'Garlic Scallion', 'Rich Gravy'];
    waiterPhrase = '请来一份蚂蚁上树 (Qǐng lái yí fèn Mǎyǐ Shàng Shù)';
  } else if (item.originalName.includes('口水鸡')) {
    localizedTitle = targetLanguage === 'Spanish' ? 'Pollo Tierno Pochado en Salsa Intensa de Chiles y Granos de Sésamo' :
                     targetLanguage === 'French' ? 'Poulet Fermier Poché à l\'Huile de Piment Rouge et Sésame Doré' :
                     'Tender Poached Chicken in Fiery Sichuan Peppercorn & Roasted Peanut Sauce';
    pronunciation = 'Koe-shway Jee';
    spiceLevel = 'Hot';
    flavorNotes = ['Electric Peppercorn Tingle', 'Tender Chilled Chicken', 'Nutty Sesame', 'Zesty Black Vinegar'];
    waiterPhrase = '请来一份口水鸡 (Qǐng lái yí fèn Kǒushuǐ Jī)';
  } else if (item.originalName.includes('麻婆豆腐')) {
    localizedTitle = targetLanguage === 'Spanish' ? 'Tofu Sedoso Estofado con Ternera y Granos de Pimienta de Sichuan' :
                     targetLanguage === 'French' ? 'Tofu Soyeux Braisé au Bœuf Haché et Poivre de Sichuan' :
                     'Silken Tofu Braised with Minced Beef, Fermented Black Beans & Sichuan Peppercorn';
    pronunciation = 'Mah-paw Doe-foo';
    spiceLevel = 'Hot';
    flavorNotes = ['Velvety Soft Tofu', 'Spicy-Numbing Heat', 'Earthy Fermented Beans', 'Fragrant Scallions'];
    waiterPhrase = '请来一份麻婆豆腐 (Qǐng lái yí fèn Mápó Dòufu)';
  } else if (item.originalName.includes('Cacio e Pepe')) {
    localizedTitle = targetLanguage === 'Spanish' ? 'Spaghetti Artesanal con Emulsión de Pecorino Romano y Pimienta Negra' :
                     targetLanguage === 'French' ? 'Spaghetti aux Deux Poivres et Émulsion de Pecorino Romano AOP' :
                     'Bronze-Die Artisanal Spaghetti in Creamy Aged Pecorino Romano & Toasted Black Pepper Emulsion';
    pronunciation = 'KAH-choh eh PEH-peh';
    spiceLevel = 'Medium (Black Pepper Heat)';
    flavorNotes = ['Sharp Salty Pecorino', 'Toasted Peppery Punch', 'Silky Starch Emulsion', 'Al Dente Chew'];
    waiterPhrase = 'Vorrei un piatto di Cacio e Pepe, per favore';
  } else if (item.originalName.includes('Bistecca alla Fiorentina')) {
    localizedTitle = targetLanguage === 'Spanish' ? 'Chuleton T-Bone a la Parrilla de Roble con Aceite de Oliva Toscano' :
                     targetLanguage === 'French' ? 'Côte de Bœuf T-Bone Chianina Grillée au Feu de Bois de Chêne' :
                     'Wood-Fired Florentine T-Bone Steak with Tuscan Extra Virgin Olive Oil & Sea Salt';
    pronunciation = 'Bee-STEHK-kah AHL-lah Fee-ohr-ehn-TEE-nah';
    flavorNotes = ['Smoky Oak Char', 'Succulent Rare Beef', 'Peppery Olive Oil', 'Crisp Sea Salt Flakes'];
    waiterPhrase = 'Una Bistecca alla Fiorentina al sangue, per favore';
  } else if (item.originalName.includes('Huitlacoche')) {
    localizedTitle = targetLanguage === 'French' ? 'Tacos de Truffe de Maïs Sauvage et Fromage d\'Oaxaca Fondu' :
                     'Handmade Heirloom Corn Tacos with Braised Corn Truffle (Huitlacoche) & Melted Oaxaca Cheese';
    pronunciation = 'Weet-lah-KOH-cheh';
    flavorNotes = ['Earthy Wild Truffle', 'Sweet Charred Maize', 'Herbal Epazote', 'Melted Creamy Cheese'];
    waiterPhrase = 'Tres tacos de huitlacoche con queso, por favor';
  } else if (item.originalName.includes('Dosa')) {
    localizedTitle = targetLanguage === 'Spanish' ? 'Crepe Crujiente Fermentado con Mantequilla Ghee y Patatas Especiadas' :
                     'Golden Ghee-Crisped Fermented Rice Crepe Stuffed with Spiced Potatoes, Sambar & Coconut Chutney';
    pronunciation = 'Ghee Rohst Mah-SAH-lah DOH-sah';
    flavorNotes = ['Caramelized Ghee Aroma', 'Paper-Thin Lacy Crispness', 'Fragrant Curry Leaves', 'Tangy Tamarind Dip'];
    waiterPhrase = 'Oru Ghee Roast Masala Dosa koodunga (One Ghee Roast, please)';
  } else if (item.originalName.includes('Takoyaki') || item.originalName.includes('たこ焼き')) {
    localizedTitle = targetLanguage === 'Spanish' ? 'Esferas Crujientes de Pulpo con Salsa Glaseada y Copos de Bonito Ahumado' :
                     'Crispy Osaka-Style Dashi Batter Puffs with Tender Octopus, Kewpie Mayo & Dancing Bonito Flakes';
    pronunciation = 'Tah-ko-YAH-kee';
    flavorNotes = ['Crispy Shell', 'Lava-Creamy Savory Center', 'Sweet Umami Glaze', 'Dancing Bonito Smoke'];
    waiterPhrase = 'Takoyaki hitotsu kudasai (One order of Takoyaki, please)';
  } else {
    // Smart generic synthesizer
    localizedTitle = `${item.originalName} (${restaurantContext.cuisine || 'Specialty'})`;
    flavorNotes = ['Authentic', 'Hearty', 'Chef Prepared'];
  }

  const appetizingDesc = item.rawDescription
    ? `${item.rawDescription} Prepared fresh to order with authentic regional culinary techniques.`
    : `Freshly prepared using traditional ${restaurantContext.cuisine || 'regional'} methods, highlighting balanced spices, fresh herbs, and rich natural flavors.`;

  return {
    localizedTitle,
    pronunciationGuide: pronunciation || item.originalName,
    appetizingDescription: appetizingDesc,
    literalNameMeaning: literalMeaning,
    culturalContext: culturalContext,
    flavorProfile: flavorNotes,
    spiceLevel: spiceLevel,
    waiterHelpPhrase: waiterPhrase
  };
}

/**
 * Main translation handler orchestrating:
 * 1. Cultural Localization
 * 2. 14-Major Allergen & Dietary Audit
 * 3. Server Flashcard Generation
 */
async function processMenuItem(item, targetLanguage, restaurantContext, config = {}) {
  const allergenAudit = auditAllergens(`${item.originalName} ${item.rawDescription || ''} ${item.ingredients || ''}`);

  let aiTranslation = null;
  let engineUsed = 'Built-in Culinary Knowledge Engine';

  if (config.mode === 'ollama') {
    try {
      const prompt = buildPrompt(item, targetLanguage, restaurantContext);
      aiTranslation = await callOllama(prompt, config.model || 'llama3.2', config.ollamaHost || 'http://localhost:11434');
      engineUsed = `Ollama (${config.model || 'llama3.2'})`;
    } catch (err) {
      console.warn(`[BistroTranslate] Ollama call failed, falling back to local semantic engine: ${err.message}`);
      aiTranslation = localSemanticTranslate(item, targetLanguage, restaurantContext);
      engineUsed = `Local Culinary Engine (Fallback from Ollama)`;
    }
  } else if (config.mode === 'huggingface') {
    try {
      const prompt = buildPrompt(item, targetLanguage, restaurantContext);
      aiTranslation = await callHuggingFace(prompt, config.model || 'Qwen/Qwen2.5-7B-Instruct', config.hfApiKey);
      engineUsed = `Hugging Face Open Weights (${config.model || 'Qwen/Qwen2.5-7B-Instruct'})`;
    } catch (err) {
      console.warn(`[BistroTranslate] Hugging Face call failed, falling back to local semantic engine: ${err.message}`);
      aiTranslation = localSemanticTranslate(item, targetLanguage, restaurantContext);
      engineUsed = `Local Culinary Engine (Fallback from HF)`;
    }
  } else {
    // Default: ultra-fast zero latency local semantic engine
    aiTranslation = localSemanticTranslate(item, targetLanguage, restaurantContext);
    engineUsed = 'Native Open Culinary Semantic Engine';
  }

  // Generate localized customer allergen warning card for waitstaff
  const allergenNames = allergenAudit.detected.map(a => a.name).join(', ');
  const sourceLang = restaurantContext.sourceLanguage || 'Chinese';
  let staffAllergyWarning = '';

  if (allergenAudit.detected.length > 0) {
    if (sourceLang.toLowerCase().includes('chinese')) {
      staffAllergyWarning = `注意：我对以下食材过敏，请勿添加：${allergenAudit.detected.map(a => a.name).join('、')}`;
    } else if (sourceLang.toLowerCase().includes('italian')) {
      staffAllergyWarning = `Attenzione: sono allergico a: ${allergenNames}. Per favore senza questi ingredienti.`;
    } else if (sourceLang.toLowerCase().includes('spanish')) {
      staffAllergyWarning = `Atención: soy alérgico a: ${allergenNames}. Por favor sin estos ingredientes.`;
    } else if (sourceLang.toLowerCase().includes('japanese')) {
      staffAllergyWarning = `アレルギーがあります：${allergenAudit.detected.map(a => a.name).join('、')} 抜いていただけますか？`;
    } else {
      staffAllergyWarning = `Allergy Notice: Please ensure no ${allergenNames} is in this dish.`;
    }
  }

  return {
    id: item.id || Math.random().toString(36).substring(2, 9),
    originalName: item.originalName,
    category: item.category || 'Mains',
    price: item.price,
    ingredients: item.ingredients || '',
    localizedTitle: aiTranslation.localizedTitle || item.originalName,
    pronunciationGuide: aiTranslation.pronunciationGuide || '',
    appetizingDescription: aiTranslation.appetizingDescription || '',
    literalNameMeaning: aiTranslation.literalNameMeaning || null,
    culturalContext: aiTranslation.culturalContext || '',
    flavorProfile: Array.isArray(aiTranslation.flavorProfile) ? aiTranslation.flavorProfile : ['Savory', 'Authentic'],
    spiceLevel: aiTranslation.spiceLevel || 'Mild',
    waiterHelpPhrase: aiTranslation.waiterHelpPhrase || '',
    allergens: allergenAudit.detected,
    dietary: allergenAudit.dietary,
    staffAllergyWarning,
    engineUsed,
    processedAt: new Date().toISOString()
  };
}

module.exports = {
  auditAllergens,
  processMenuItem,
  callOllama,
  callHuggingFace,
  localSemanticTranslate
};
