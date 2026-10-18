# 🍲 BistroTranslate AI
> **Cultural Menu Translator, Culinary Nuance Engine & 14-Major Allergen Sentinel for Independent Restaurants**  
> *Built for Hacktoberfest 2026: Week 2 DEV Challenge — Theme: Side Hustle*

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026%20Week%202-orange.svg)](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Open-Weight AI](https://img.shields.io/badge/AI-Open--Weight%20Models-blue.svg)](https://ollama.com)
[![Status: Production Ready](https://img.shields.io/badge/Status-Tested%20%26%20Verified-brightgreen.svg)]()

---

## 💡 The Problem: Why Restaurants Lose Paying Tourists Every Single Day

Independent ethnic restaurants, neighborhood trattorias, taco stands, sushi bars, and family cafes operate on razor-thin 3%–5% margins. When international tourists visit, restaurants face two massive hurdles:

1. **Catastrophic Literal Translations**:
   - Chinese classic **夫妻肺片** (*Fūqī Fèipiàn*) literally translates to *"Husband and Wife Lung Slices"*, terrifying foreign diners even though no lungs are used.
   - Sichuan **蚂蚁上树** (*Mǎyǐ Shàng Shù*) becomes *"Ants Climbing a Tree"*, rather than savory braised glass noodles with minced pork.
   - Mexican **Huitlacoche** gets mistranslated as *"Corn Smut"* instead of the prized Mexican corn truffle delicacy it truly is.
   - Italian **Cacio e Pepe** gets stripped of its Roman shepherd origin and described simply as *"Macaroni with cheese"*.
2. **Allergen Anxieties & Language Barriers**:
   - Diners with celiac disease, nut allergies, or dairy sensitivities walk away because waiters cannot translate complex ingredient questions on a busy Friday night.
3. **Agency Translations Cost Too Much**:
   - Professional agency menu translations cost **$500 to $1,500** per language. Restaurants cannot afford this every time they update seasonal specials.

---

## 🚀 The Solution: BistroTranslate AI

**BistroTranslate AI** is an open-source, open-weight AI agent pipeline built for small restaurateurs and food entrepreneurs. It transforms raw dish names and recipes into:
- **Culturally Localized, Mouthwatering Titles & Descriptions**: Highlights flavors, aromas, and culinary heritage instead of literal mistranslations.
- **Literal Name & Heritage Breakdown**: Explains the history or poetry behind traditional dish names (e.g., 1930s Chengdu origins, Roman shepherd staples).
- **Automated 14-Major Allergen & Dietary Audit**: Audits dishes for Gluten, Peanuts, Tree Nuts, Dairy, Shellfish, Soy, Sesame, Fish, and tags Vegan, Vegetarian, Halal-friendly, and Gluten-free options.
- **Waitstaff Pocket Flashcards**: Translates exact dietary warnings into the kitchen's native language so allergic diners can show their phone directly to the waiter (e.g. `注意：我对以下食材过敏...` / `Attenzione: sono allergico a...`).
- **Commercial Multi-Format Outputs**:
  - 🖨️ **Printable Table Menu**: High-resolution, classical bilingual menu layout with print-ready CSS (`window.print()`).
  - 📱 **Interactive Tourist Mobile QR Menu**: Generates table QR codes for tourists to scan and view responsive bilingual menus on their smartphones.
  - 💾 **POS Data Export**: JSON and CSV export ready for Square, Toast, Clover, and digital menu boards.

---

## 💼 The Side Hustle: Who Pays For This & How It Makes Money

| Customer Segment | Pain Point | BistroTranslate Value | Price Point |
| :--- | :--- | :--- | :--- |
| **Independent Ethnic Restaurants** (Chinese, Indian, Mexican, Thai, Japanese, Italian) | Losing tourist foot traffic; negative TripAdvisor reviews over confusing translations. | Generates complete localized bilingual menus in minutes. | **$29/month** or **$99 one-time pack** |
| **Boutique Hotels & B&Bs** | International guests asking for English/local restaurant recommendations and menu explanations. | White-label concierge digital menu with QR stands. | **$49/month** |
| **Food Tour Operators & Culinary Guides** | Anxious guests with dietary restrictions slowing down group tours. | Instant mobile dish scanner and allergen card. | **$19/month** |

> **Economics**: Because BistroTranslate runs on **open-weight models locally** (or low-cost open endpoints), the marginal cost per translation is virtually **$0.00**. A developer charging $29/month per restaurant with 100 restaurant clients makes **$2,900/month in pure recurring revenue** with near-zero API overhead!

---

## 🌟 Why Open Innovation Matters for BistroTranslate

The DEV Challenge prompt asks: *"Why does open innovation matter for what you built? What did it make possible that a closed API wouldn't?"*

1. **Zero Marginal Cost for Thin-Margin Businesses**:
   Closed proprietary APIs charge per token. A busy restaurant with 80 dishes translated into 5 tourist languages would incur ongoing meter costs. Open-weight models (such as **Llama 3.2**, **Qwen 2.5**, or **Mistral 7B**) can run on a restaurateur's laptop or local POS machine via Ollama with **zero token fees**.
2. **Proprietary Recipe & Margin Privacy**:
   Chefs guard family recipes, proprietary spice blends, and secret sauces. With local open inference, confidential formulations never leave the restaurant's premises or get logged on cloud servers.
3. **Cultural Grounding Over Western Censorship**:
   Generic closed cloud models often apply aggressive sanitization filters or westernize traditional recipes. Open-weight models allow granular system framing and local culinary ontologies that honor ancestral dishes and precise allergen taxonomies without generic blandness.

---

## 🛠️ Architecture & Open AI Multi-Stage Pipeline

```
[ Raw Restaurant Menu / Seasonal Specials ]
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│  STAGE 1: Culinary Parser & Ingredient Dissector         │
│  - Categorizes course (Primi, Mains, Dim Sum, Tiffin)    │
│  - Extracts proteins, sauces, cooking methods, spices    │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  STAGE 2: Cultural Localization & Nuance Engine          │
│  - Open-Weight Model (Llama 3.2 / Qwen 2.5 via Ollama)   │
│  - Dissects "Literal vs Culinary" naming poetry          │
│  - Generates sensory descriptions & cultural history     │
│  - Produces waiter flashcards in restaurant's language   │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  STAGE 3: 14-Major Allergen & Dietary Sentinel           │
│  - Audits ingredients against EU/FDA allergen taxonomy   │
│  - Tags Vegan, Vegetarian, Halal, Gluten-Free options    │
│  - Generates waiter safety alert in native language      │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  STAGE 4: Commercial Delivery Engine                     │
│  - 🖨️ Printable Table Menu Cards (window.print() ready)   │
│  - 📱 Mobile Tourist Web View & Dynamic Table QR Codes   │
│  - 💾 POS Export Format (JSON / CSV)                     │
└──────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js (v18+)
- *(Optional for Local Open-Weight Inference)*: [Ollama](https://ollama.com) running `llama3.2` or `qwen2.5`. *(BistroTranslate also includes a zero-latency built-in Culinary Knowledge Engine that works out-of-the-box without any installed daemons!)*

### 1. Clone & Install
```bash
git clone https://github.com/your-username/bistro-translate.git
cd bistro-translate
npm install
```

### 2. Run Test Suite
```bash
node test/test_api.js
```
*Tests allergen audits (gluten, dairy, shellfish, peanuts, sesame), Sichuan idiom resolution (夫妻肺片, 蚂蚁上树), Mexican huitlacoche history, and Italian cacio e pepe emulsion.*

### 3. Start the Server
```bash
node server.js
```
Open **`http://localhost:3000`** in your browser.

---

## 🎯 Supported Open-Weight Models & Modes

| Backend Mode | How It Works | Recommended Use Case |
| :--- | :--- | :--- |
| **Native Open Culinary Engine** | Built-in zero-latency culinary ontology & semantic parser. | Instant testing, demoing, and offline laptops with no GPU. |
| **Local Ollama** | Connects to `http://localhost:11434` running `llama3.2`, `qwen2.5`, `mistral`. | 100% offline, privacy-first production deployments on restaurant POS. |
| **Hugging Face Open Weights** | Connects to open models like `Qwen/Qwen2.5-7B-Instruct` via Inference API. | Cloud-hosted deployments (e.g. Render, Backboard, DigitalOcean). |

---

## 🧪 Pre-loaded Authentic Culinary Presets

- 🥢 **Authentic Sichuan Chinese**: 夫妻肺片 (*Husband and Wife Lung Slices*), 蚂蚁上树 (*Ants Climbing a Tree*), 口水鸡 (*Mouthwatering Chicken*), 麻婆豆腐 (*Mapo Tofu*).
- 🍝 **Tuscan Italian Trattoria**: Cacio e Pepe al Mattarello, Bistecca alla Fiorentina, Ossobuco alla Milanese, Panna Cotta ai Frutti di Bosco.
- 🌮 **Oaxacan Mexican Taquería**: Tacos de Huitlacoche con Queso Oaxaca, Cochinita Pibil en Hoja de Plátano, Mole Negro.
- 🍛 **South Indian Tiffin**: Ghee Roast Masala Dosa, Medu Vada with Gunpowder, Chettinad Pepper Chicken.
- 🍢 **Tokyo Izakaya**: Takoyaki Osaka Style, Chawanmushi with Uni, Negima Yakitori.

---

## 📄 License

MIT License — Feel free to fork, customize, and commercialize for your local restaurant community!
