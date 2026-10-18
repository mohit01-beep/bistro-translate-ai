/**
 * Test Suite for BistroTranslate AI API
 */

const { processMenuItem, auditAllergens } = require('../src/aiEngine');
const { SAMPLE_PRESETS } = require('../src/culinaryData');

async function runTests() {
  console.log('🧪 Starting BistroTranslate Test Suite...\n');

  // Test 1: Allergen Detection
  console.log('Test 1: Allergen & Dietary Audit');
  const sample1 = 'Spaghetti with pecorino cheese, black pepper, and butter';
  const audit1 = auditAllergens(sample1);
  console.log('Input:', sample1);
  console.log('Allergens Detected:', audit1.detected.map(a => a.name));
  console.log('Dietary Flags:', audit1.dietary);
  if (!audit1.detected.some(a => a.id === 'gluten') || !audit1.detected.some(a => a.id === 'dairy')) {
    throw new Error('Allergen audit failed to detect gluten and dairy!');
  }
  console.log('✅ Test 1 Passed.\n');

  // Test 2: Sichuan Chinese Idiomatic Nuance
  console.log('Test 2: Sichuan Idiom Nuance (夫妻肺片 & 蚂蚁上树)');
  const sichuanPreset = SAMPLE_PRESETS.find(p => p.id === 'sichuan-chinese');
  const dish1 = sichuanPreset.items[0]; // 夫妻肺片
  const dish2 = sichuanPreset.items[1]; // 蚂蚁上树

  const res1 = await processMenuItem(dish1, 'English', {
    restaurantName: sichuanPreset.restaurantName,
    cuisine: sichuanPreset.cuisine,
    sourceLanguage: sichuanPreset.sourceLanguage
  });

  console.log('Original Name:', res1.originalName);
  console.log('Localized Title:', res1.localizedTitle);
  console.log('Literal Meaning:', res1.literalNameMeaning);
  console.log('Cultural Context:', res1.culturalContext);
  console.log('Allergens:', res1.allergens.map(a => a.name));
  console.log('Staff Phrase:', res1.waiterHelpPhrase);

  if (res1.localizedTitle.toLowerCase().includes('lung') && !res1.localizedTitle.toLowerCase().includes('shank')) {
    throw new Error('Failed: Mistranslated literally as lungs without explanation!');
  }
  console.log('✅ Test 2 (夫妻肺片) Passed.\n');

  const res2 = await processMenuItem(dish2, 'English', {
    restaurantName: sichuanPreset.restaurantName,
    cuisine: sichuanPreset.cuisine,
    sourceLanguage: sichuanPreset.sourceLanguage
  });

  console.log('Original Name:', res2.originalName);
  console.log('Localized Title:', res2.localizedTitle);
  console.log('Literal Meaning:', res2.literalNameMeaning);
  console.log('✅ Test 2 (蚂蚁上树) Passed.\n');

  // Test 3: Mexican Huitlacoche Truffle & Italian Cacio e Pepe
  console.log('Test 3: Mexican Huitlacoche & Italian Cacio e Pepe');
  const mexicanPreset = SAMPLE_PRESETS.find(p => p.id === 'mexican-taqueria');
  const huitlacocheDish = mexicanPreset.items[0];
  const res3 = await processMenuItem(huitlacocheDish, 'English', {
    cuisine: 'Oaxacan Mexican',
    sourceLanguage: 'Spanish'
  });
  console.log('Dish:', res3.originalName);
  console.log('Localized Title:', res3.localizedTitle);
  console.log('Cultural Story:', res3.culturalContext);
  console.log('✅ Test 3 Passed.\n');

  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
