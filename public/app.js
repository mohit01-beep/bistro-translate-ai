/**
 * BistroTranslate Client Application
 * Handles presets, interactive dish management, open model translation requests,
 * QR code generation, and multi-view rendering.
 */

let currentPresets = [];
let stagedItems = [];
let lastTranslationResult = null;
let currentEngineMode = 'builtin';

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();
  setupEngineTabs();
  setupViewTabs();
  setupEventListeners();
  await loadPresets();
});

// Setup Engine Mode Switcher
function setupEngineTabs() {
  const tabs = document.querySelectorAll('.engine-tab');
  const ollamaBox = document.getElementById('ollamaConfigBox');
  const hfBox = document.getElementById('hfConfigBox');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentEngineMode = tab.dataset.mode;

      if (currentEngineMode === 'ollama') {
        ollamaBox.classList.remove('hidden');
        hfBox.classList.add('hidden');
      } else if (currentEngineMode === 'huggingface') {
        hfBox.classList.remove('hidden');
        ollamaBox.classList.add('hidden');
      } else {
        ollamaBox.classList.add('hidden');
        hfBox.classList.add('hidden');
      }
    });
  });
}

// Setup Output View Tabs
function setupViewTabs() {
  const tabs = document.querySelectorAll('.view-tab');
  const panes = {
    studio: document.getElementById('tabContentStudio'),
    printable: document.getElementById('tabContentPrintable'),
    mobile: document.getElementById('tabContentMobile'),
    export: document.getElementById('tabContentExport')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active', 'bg-stone-900', 'text-white');
        t.classList.add('bg-white', 'text-stone-700');
      });
      tab.classList.add('active', 'bg-stone-900', 'text-white');
      tab.classList.remove('bg-white', 'text-stone-700');

      const target = tab.dataset.tab;
      Object.keys(panes).forEach(key => {
        if (key === target) {
          panes[key].classList.remove('hidden');
        } else {
          panes[key].classList.add('hidden');
        }
      });

      if (target === 'mobile' || target === 'printable') {
        renderQrCodes();
      }
      if (window.lucide) lucide.createIcons();
    });
  });
}

// Event Listeners for buttons and preset cards
function setupEventListeners() {
  document.getElementById('translateAllBtn').addEventListener('click', runTranslation);
  document.getElementById('addDishRowBtn').addEventListener('click', addCustomDish);

  document.getElementById('testOllamaBtn').addEventListener('click', checkOllama);
  document.getElementById('copyJsonBtn').addEventListener('click', copyJson);
  document.getElementById('downloadJsonBtn').addEventListener('click', downloadJson);

  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const presetId = card.dataset.preset;
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      applyPreset(presetId);
    });
  });
}

// Load presets from backend API
async function loadPresets() {
  try {
    const res = await fetch('/api/presets');
    currentPresets = await res.json();
    if (currentPresets.length > 0) {
      applyPreset(currentPresets[0].id);
    }
  } catch (err) {
    console.error('Failed to load presets:', err);
  }
}

// Apply selected preset
function applyPreset(presetId) {
  const preset = currentPresets.find(p => p.id === presetId);
  if (!preset) return;

  document.getElementById('restaurantName').value = preset.restaurantName;
  document.getElementById('cuisineType').value = preset.cuisine;
  document.getElementById('currencySymbol').value = preset.currency;
  document.getElementById('sourceLanguage').value = preset.sourceLanguage;

  stagedItems = JSON.parse(JSON.stringify(preset.items));
  renderStagedItemsTable();

  // Run translation automatically on preset load
  runTranslation();
}

// Render the staged items in the editor table
function renderStagedItemsTable() {
  const tbody = document.getElementById('menuItemsTableBody');
  document.getElementById('itemsCountBadge').textContent = stagedItems.length;
  tbody.innerHTML = '';

  stagedItems.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-stone-50 transition-colors';
    tr.innerHTML = `
      <td class="p-3">
        <input type="text" class="w-full text-xs font-semibold px-2 py-1 border border-stone-200 rounded" value="${escapeHtml(item.originalName)}" data-index="${index}" data-field="originalName">
      </td>
      <td class="p-3">
        <input type="text" class="w-full text-xs px-2 py-1 border border-stone-200 rounded" value="${escapeHtml(item.category)}" data-index="${index}" data-field="category">
      </td>
      <td class="p-3">
        <input type="text" class="w-full text-xs font-mono px-2 py-1 border border-stone-200 rounded text-center" value="${escapeHtml(item.price)}" data-index="${index}" data-field="price">
      </td>
      <td class="p-3">
        <input type="text" class="w-full text-xs px-2 py-1 border border-stone-200 rounded" value="${escapeHtml(item.ingredients || item.rawDescription || '')}" data-index="${index}" data-field="ingredients">
      </td>
      <td class="p-3 text-center">
        <button type="button" class="text-rose-600 hover:text-rose-800 p-1" onclick="deleteStagedItem(${index})" title="Delete Dish">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach change listeners to live update stagedItems
  tbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      const field = e.target.dataset.field;
      if (stagedItems[idx]) {
        stagedItems[idx][field] = e.target.value;
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

// Delete item
window.deleteStagedItem = function(index) {
  stagedItems.splice(index, 1);
  renderStagedItemsTable();
};

// Add custom dish row
function addCustomDish() {
  stagedItems.push({
    originalName: 'New Specialty Dish',
    category: 'Mains',
    price: '15.00',
    rawDescription: 'Traditional recipe prepared with seasonal ingredients.',
    ingredients: 'Fresh herbs, garlic, olive oil, spices'
  });
  renderStagedItemsTable();
}

// Check Ollama status
async function checkOllama() {
  const host = document.getElementById('ollamaHostInput').value;
  const badge = document.getElementById('ollamaStatusBadge');
  badge.textContent = 'Checking...';
  badge.className = 'text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800';

  try {
    const res = await fetch('/api/check-ollama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host })
    });
    const data = await res.json();
    if (data.connected) {
      badge.textContent = `Connected (${data.models.length} models)`;
      badge.className = 'text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800';

      const select = document.getElementById('ollamaModelSelect');
      if (data.models.length > 0) {
        select.innerHTML = '';
        data.models.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          select.appendChild(opt);
        });
      }
    } else {
      badge.textContent = 'Not Reachable';
      badge.className = 'text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800';
    }
  } catch (err) {
    badge.textContent = 'Error';
    badge.className = 'text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800';
  }
}

// Run Translation & Localization Pipeline
async function runTranslation() {
  const btn = document.getElementById('translateAllBtn');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> Processing through Open AI...`;
  btn.disabled = true;

  const restaurantContext = {
    restaurantName: document.getElementById('restaurantName').value,
    cuisine: document.getElementById('cuisineType').value,
    sourceLanguage: document.getElementById('sourceLanguage').value,
    currency: document.getElementById('currencySymbol').value
  };

  const targetLanguage = document.getElementById('targetLanguage').value;

  const config = {
    mode: currentEngineMode,
    model: currentEngineMode === 'ollama' ? document.getElementById('ollamaModelSelect').value :
           currentEngineMode === 'huggingface' ? document.getElementById('hfModelInput').value : 'builtin',
    ollamaHost: document.getElementById('ollamaHostInput').value,
    hfApiKey: document.getElementById('hfApiKeyInput').value
  };

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: stagedItems,
        targetLanguage,
        restaurantContext,
        config
      })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Translation failed');

    lastTranslationResult = result;
    renderAllViews(result, restaurantContext);
  } catch (err) {
    alert(`Error translating menu: ${err.message}`);
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    if (window.lucide) lucide.createIcons();
  }
}

// Render all views
function renderAllViews(result, context) {
  renderStudioCards(result, context);
  renderPrintableMenu(result, context);
  renderMobileGuestMenu(result, context);
  renderJsonPreview(result);
  renderQrCodes();
}

// Tab 1: Render Studio Dish Cards
function renderStudioCards(result, context) {
  const grid = document.getElementById('dishesGrid');
  grid.innerHTML = '';

  result.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'dish-card bg-white rounded-xl border border-stone-200 shadow-sm p-6 flex flex-col justify-between space-y-4';

    // Allergen chips
    let allergenBadges = '';
    if (item.allergens && item.allergens.length > 0) {
      allergenBadges = item.allergens.map(a => `
        <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200" title="Contains ${a.name}">
          <span>${a.icon}</span> ${a.name}
        </span>
      `).join('');
    } else {
      allergenBadges = `<span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">✅ No Common Allergens Flagged</span>`;
    }

    // Dietary badges
    const dietaryBadges = [];
    if (item.dietary.vegetarian) dietaryBadges.push(`<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">🌱 Vegetarian</span>`);
    if (item.dietary.vegan) dietaryBadges.push(`<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">🍃 Vegan</span>`);
    if (item.dietary.glutenFree) dietaryBadges.push(`<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">🌾 Gluten-Free Option</span>`);
    if (item.dietary.halalFriendly) dietaryBadges.push(`<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">☪️ Halal-Friendly</span>`);

    // Literal translation breakdown if present
    let literalMeaningBox = '';
    if (item.literalNameMeaning) {
      literalMeaningBox = `
        <div class="bg-amber-50/70 rounded-lg p-2.5 border border-amber-200 text-xs">
          <div class="font-bold text-amber-900 flex items-center gap-1.5">
            <span>🔍 Literal Name Meaning:</span>
            <span class="italic font-semibold text-amber-800">"${escapeHtml(item.literalNameMeaning)}"</span>
          </div>
          <p class="text-[11px] text-amber-800 mt-1 leading-relaxed">
            ${escapeHtml(item.culturalContext)}
          </p>
        </div>
      `;
    } else if (item.culturalContext) {
      literalMeaningBox = `
        <div class="bg-stone-50 rounded-lg p-2.5 border border-stone-200 text-xs">
          <span class="font-bold text-stone-700">📖 Cultural Context:</span>
          <p class="text-[11px] text-stone-600 mt-0.5">${escapeHtml(item.culturalContext)}</p>
        </div>
      `;
    }

    // Flavor tags
    const flavorBadges = item.flavorProfile.map(f => `
      <span class="text-[10px] font-semibold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">#${escapeHtml(f)}</span>
    `).join(' ');

    // Waiter flashcard
    let waiterBox = '';
    if (item.waiterHelpPhrase || item.staffAllergyWarning) {
      waiterBox = `
        <div class="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-1.5 bg-brand-50/50 p-2.5 rounded-lg border border-brand-100 text-xs">
          <div class="flex items-center justify-between text-brand-900 font-bold text-[11px]">
            <span class="flex items-center gap-1">🗣️ Speak to Staff (${context.sourceLanguage})</span>
            <span class="text-[10px] font-normal text-stone-500">Show phone to waiter</span>
          </div>
          <p class="font-medium text-stone-900 text-sm font-sans tracking-wide">
            ${escapeHtml(item.waiterHelpPhrase)}
          </p>
          ${item.staffAllergyWarning ? `<p class="text-[11px] text-rose-700 font-semibold">${escapeHtml(item.staffAllergyWarning)}</p>` : ''}
        </div>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">${escapeHtml(item.category)}</span>
              ${item.pronunciationGuide ? `<span class="text-xs font-medium text-stone-500">(${escapeHtml(item.pronunciationGuide)})</span>` : ''}
            </div>
            <h3 class="font-extrabold text-lg text-stone-900 mt-1 leading-snug">${escapeHtml(item.localizedTitle)}</h3>
            <p class="text-xs text-stone-400 font-medium">${escapeHtml(item.originalName)}</p>
          </div>
          <span class="font-bold text-base text-stone-900 font-mono shrink-0">${context.currency}${escapeHtml(item.price)}</span>
        </div>

        <p class="text-xs text-stone-700 leading-relaxed mt-3">${escapeHtml(item.appetizingDescription)}</p>

        <div class="mt-3 space-y-2">
          ${literalMeaningBox}
        </div>

        <div class="mt-3 flex flex-wrap gap-1.5 items-center">
          ${flavorBadges}
        </div>
      </div>

      <div class="space-y-3 pt-3 border-t border-stone-100">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Dietary & Allergens</span>
          <div class="flex flex-wrap gap-1.5 items-center">
            ${dietaryBadges.join(' ')}
            ${allergenBadges}
          </div>
        </div>

        ${waiterBox}
      </div>
    `;

    grid.appendChild(card);
  });
}

// Tab 2: Render Printable Menu Layout
function renderPrintableMenu(result, context) {
  document.getElementById('printRestaurantName').textContent = context.restaurantName;
  document.getElementById('printCuisineTag').textContent = `${context.cuisine} · Bilingual Guest Menu`;

  const container = document.getElementById('printableDishesList');
  container.innerHTML = '';

  // Group by category
  const categories = {};
  result.items.forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  for (const [catName, items] of Object.entries(categories)) {
    const section = document.createElement('div');
    section.className = 'space-y-4';
    section.innerHTML = `
      <h3 class="font-bold text-sm tracking-widest uppercase border-b border-stone-300 pb-1 text-stone-800">${escapeHtml(catName)}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${items.map(it => `
          <div class="space-y-1">
            <div class="flex items-baseline justify-between gap-2 border-b border-dotted border-stone-300 pb-0.5">
              <span class="font-bold text-sm text-stone-900">${escapeHtml(it.localizedTitle)}</span>
              <span class="font-mono font-bold text-sm text-stone-900">${context.currency}${escapeHtml(it.price)}</span>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
              <span>${escapeHtml(it.originalName)}</span>
              ${it.pronunciationGuide ? `<span>(${escapeHtml(it.pronunciationGuide)})</span>` : ''}
            </div>
            <p class="text-[11px] text-stone-600 leading-snug">${escapeHtml(it.appetizingDescription)}</p>
            ${it.allergens.length > 0 ? `
              <p class="text-[10px] text-rose-700 font-semibold">Allergens: ${it.allergens.map(a => a.name).join(', ')}</p>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(section);
  }
}

// Tab 3: Render Mobile Guest Simulation
function renderMobileGuestMenu(result, context) {
  document.getElementById('mobileRestaurantName').textContent = context.restaurantName;
  document.getElementById('mobileLanguageIndicator').textContent = `Translated to ${result.targetLanguage}`;

  const container = document.getElementById('mobileDishesList');
  container.innerHTML = '';

  result.items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl p-3 shadow-2xs border border-stone-200 space-y-2';

    let allergenPills = '';
    if (item.allergens.length > 0) {
      allergenPills = item.allergens.map(a => `
        <span class="text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-100">${a.icon} ${a.name}</span>
      `).join('');
    }

    div.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="text-[9px] font-bold uppercase text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">${escapeHtml(item.category)}</span>
          <h5 class="font-bold text-xs text-stone-900 mt-0.5">${escapeHtml(item.localizedTitle)}</h5>
          <span class="text-[10px] text-stone-400 font-medium">${escapeHtml(item.originalName)}</span>
        </div>
        <span class="font-bold font-mono text-xs text-stone-900">${context.currency}${escapeHtml(item.price)}</span>
      </div>

      <p class="text-[10px] text-stone-600 leading-relaxed">${escapeHtml(item.appetizingDescription)}</p>

      ${item.literalNameMeaning ? `
        <div class="bg-amber-50 p-1.5 rounded text-[9px] text-amber-900 border border-amber-200/60 leading-tight">
          <strong>Literal Name:</strong> "${escapeHtml(item.literalNameMeaning)}"
        </div>
      ` : ''}

      <div class="flex flex-wrap gap-1 items-center pt-1 border-t border-stone-100">
        ${allergenPills}
      </div>
    `;
    container.appendChild(div);
  });
}

// Tab 4: Render JSON preview
function renderJsonPreview(result) {
  document.getElementById('jsonPreviewBox').textContent = JSON.stringify(result, null, 2);
}

// Render QR code
function renderQrCodes() {
  const url = window.location.origin;
  const liveQr = document.getElementById('liveQrCode');
  const printQr = document.getElementById('printQrCodeContainer');

  if (window.QRCode) {
    liveQr.innerHTML = '';
    printQr.innerHTML = '';

    new QRCode(liveQr, {
      text: `${url}#tourist-menu`,
      width: 140,
      height: 140,
      colorDark: '#1c1917',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

    new QRCode(printQr, {
      text: `${url}#tourist-menu`,
      width: 58,
      height: 58,
      colorDark: '#1c1917',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

// Copy JSON
function copyJson() {
  if (!lastTranslationResult) return;
  navigator.clipboard.writeText(JSON.stringify(lastTranslationResult, null, 2));
  alert('Menu JSON copied to clipboard!');
}

// Download JSON
function downloadJson() {
  if (!lastTranslationResult) return;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lastTranslationResult, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${(document.getElementById('restaurantName').value || 'bistro').replace(/\s+/g, '_')}_translated_menu.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
