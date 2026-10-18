/**
 * BistroTranslate - Culinary Knowledge Base & Allergen Ontology
 * Contains structured cultural profiles, literal-to-culinary mappings,
 * allergen taxonomies, and multi-cuisine presets.
 */

const ALLERGEN_TAXONOMY = {
  gluten: {
    name: 'Gluten / Wheat',
    icon: '🌾',
    indicators: ['flour', 'wheat', 'bread', 'pasta', 'spaghetti', 'penne', 'linguine', 'fettuccine', 'macaroni', 'lasagna', 'tagliatelle', 'ravioli', 'gnocchi', 'couscous', 'soy sauce', 'semolina', 'barley', 'rye', 'malt', 'croutons', 'dough', 'batter', 'noodles', 'wonton', 'dumpling wrapper']
  },
  crustaceans: {
    name: 'Crustaceans / Shellfish',
    icon: '🦐',
    indicators: ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'langoustine', 'shrimp paste', 'dried shrimp']
  },
  eggs: {
    name: 'Eggs',
    icon: '🥚',
    indicators: ['egg', 'mayo', 'mayonnaise', 'meringue', 'custard', 'brioche', 'egg wash', 'aioli', 'hollandaise', 'carbonara']
  },
  fish: {
    name: 'Fish',
    icon: '🐟',
    indicators: ['fish', 'salmon', 'tuna', 'anchovy', 'fish sauce', 'dashi', 'bonito', 'cod', 'bass', 'halibut', 'tilapia', 'roe']
  },
  peanuts: {
    name: 'Peanuts',
    icon: '🥜',
    indicators: ['peanut', 'groundnut', 'peanut oil', 'peanut butter', 'satay', 'arachis']
  },
  soy: {
    name: 'Soybeans',
    icon: '🌱',
    indicators: ['soy', 'tofu', 'soy sauce', 'edamame', 'miso', 'tempeh', 'tamari', 'shoyu', 'bean curd', 'doubanjiang']
  },
  dairy: {
    name: 'Milk / Dairy',
    icon: '🥛',
    indicators: ['milk', 'cream', 'cheese', 'butter', 'ghee', 'yogurt', 'parmesan', 'mozzarella', 'paneer', 'ricotta', 'whey', 'pecorino', 'curd']
  },
  tree_nuts: {
    name: 'Tree Nuts',
    icon: '🌰',
    indicators: ['walnut', 'almond', 'cashew', 'pistachio', 'hazelnut', 'pecan', 'pine nut', 'macadamia', 'praline', 'marzipan']
  },
  celery: {
    name: 'Celery',
    icon: '🥬',
    indicators: ['celery', 'celeriac', 'celery salt', 'mirepoix']
  },
  mustard: {
    name: 'Mustard',
    icon: '🌿',
    indicators: ['mustard', 'dijon', 'mustard seed', 'mustard oil']
  },
  sesame: {
    name: 'Sesame',
    icon: '🫘',
    indicators: ['sesame', 'tahini', 'sesame oil', 'sesame seed', 'gomashio']
  },
  molluscs: {
    name: 'Molluscs',
    icon: '🦪',
    indicators: ['clam', 'mussel', 'oyster', 'squid', 'calamari', 'octopus', 'scallop', 'snail', 'escargot', 'oyster sauce']
  }
};

const SAMPLE_PRESETS = [
  {
    id: 'sichuan-chinese',
    restaurantName: 'Chuan Xiang Yuan (川香苑)',
    cuisine: 'Authentic Sichuan Chinese',
    sourceLanguage: 'Chinese (Simplified)',
    currency: '$',
    items: [
      {
        originalName: '夫妻肺片 (Fūqī Fèipiàn)',
        category: 'Appetizers',
        price: '14.50',
        rawDescription: '薄切牛肉、牛舌、牛肚，佐以秘制红油、花椒、熟芝麻和碎花生。',
        ingredients: 'Beef slices, beef tongue, beef tripe, chili oil, Sichuan peppercorn, roasted peanuts, sesame seeds, cilantro'
      },
      {
        originalName: '蚂蚁上树 (Mǎyǐ Shàng Shù)',
        category: 'Mains',
        price: '16.00',
        rawDescription: '粉丝与猪肉末煸炒，色泽红亮，豆瓣酱浓郁入味。',
        ingredients: 'Mung bean glass noodles, minced pork, Pixian doubanjiang (fermented chili bean paste), garlic, scallions, ginger, soy sauce'
      },
      {
        originalName: '口水鸡 (Kǒushuǐ Jī)',
        category: 'Cold Dishes',
        price: '13.50',
        rawDescription: '嫩滑三黄鸡块浸泡于红油、花椒油、蒜泥、芝麻与碎花生调制的香浓料汁中。',
        ingredients: 'Poached tender chicken, chili oil, roasted Sichuan peppercorn oil, garlic, crushed peanuts, white sesame, soy sauce, black vinegar'
      },
      {
        originalName: '麻婆豆腐 (Mápó Dòufu)',
        category: 'Mains',
        price: '15.00',
        rawDescription: '嫩豆腐与牛绞肉在豆瓣酱与花椒油中红烧，撒上香浓汉源花椒面。',
        ingredients: 'Soft silken tofu, minced beef, Pixian doubanjiang, fermented black beans, Sichuan peppercorn powder, scallions'
      }
    ]
  },
  {
    id: 'italian-trattoria',
    restaurantName: 'Trattoria Da Nonna Rosa',
    cuisine: 'Classic Tuscan Italian',
    sourceLanguage: 'Italian',
    currency: '€',
    items: [
      {
        originalName: 'Cacio e Pepe al Mattarello',
        category: 'Primi Piatti',
        price: '16.00',
        rawDescription: 'Spaghettoni freschi trafilati al bronzo con Pecorino Romano DOP stagionato e pepe nero Sarawak tostato in padella.',
        ingredients: 'Fresh durum wheat spaghetti, Pecorino Romano cheese (sheep milk), freshly toasted black peppercorns, cooking water emulsion'
      },
      {
        originalName: 'Bistecca alla Fiorentina',
        category: 'Secondi Piatti',
        price: '48.00',
        rawDescription: 'Taglio T-bone di Chianina cotta su brace di quercia viva, servita al sangue con olio evo toscano e sale grosso di Cervia.',
        ingredients: 'Dry-aged Chianina beef T-bone, extra virgin olive oil, rosemary sprig, Cervia sea salt'
      },
      {
        originalName: 'Ossobuco alla Milanese con Gremolada',
        category: 'Secondi Piatti',
        price: '26.00',
        rawDescription: 'Stinco di vitello brasato lentamente al vino bianco con trito fresco di prezzemolo, limone e acciughe.',
        ingredients: 'Cross-cut veal shank, white wine, carrots, celery, onion, lemon zest, flat-leaf parsley, anchovy fillet'
      },
      {
        originalName: 'Panna Cotta ai Frutti di Bosco',
        category: 'Dolci',
        price: '8.50',
        rawDescription: 'Crema di latte cotta con baccello di vaniglia Bourbon del Madagascar, coulis fresca di mirtilli e lamponi selvatici.',
        ingredients: 'Fresh dairy cream, whole milk, sugar, gelatin, Bourbon vanilla bean, wild blackberries, raspberries'
      }
    ]
  },
  {
    id: 'mexican-taqueria',
    restaurantName: 'Taquería El Corazón Oaxaqueño',
    cuisine: 'Traditional Oaxacan Mexican',
    sourceLanguage: 'Spanish',
    currency: '$',
    items: [
      {
        originalName: 'Tacos de Huitlacoche con Queso Oaxaca',
        category: 'Especialidades',
        price: '14.00',
        rawDescription: 'Huitlacoche fresco guisado con epazote y cebolla en tortilla de maíz nixtamalizado hecha a mano con queso hebra derretido.',
        ingredients: 'Fresh huitlacoche (corn truffle mushroom), fresh epazote, hand-pressed heirloom corn tortillas, Oaxaca string cheese, white onion'
      },
      {
        originalName: 'Cochinita Pibil en Hoja de Plátano',
        category: 'Platos Fuertes',
        price: '18.50',
        rawDescription: 'Pierna de cerdo marinada en achiote artesanal y jugo de naranja agria, envuelta en hoja de plátano y cocida a fuego lento.',
        ingredients: 'Pork shoulder, Yucatan achiote paste, Seville bitter orange juice, banana leaf, pickled red onions with habanero'
      },
      {
        originalName: 'Mole Negro con Pollo de Rancho',
        category: 'Platos Fuertes',
        price: '21.00',
        rawDescription: 'Salsa ancestral de más de 30 ingredientes incluyendo chiles chilhuacle, chocolate amargo de metate, pasas y ajonjolí tostado.',
        ingredients: 'Free-range chicken, chilhuacle negro chilies, Mexican raw dark chocolate, sesame seeds, almonds, raisins, plantains, spices'
      }
    ]
  },
  {
    id: 'south-indian-cafe',
    restaurantName: 'Madras Filter Coffee & Tiffin Co.',
    cuisine: 'Authentic South Indian',
    sourceLanguage: 'Tamil / English',
    currency: '₹',
    items: [
      {
        originalName: 'Ghee Roast Masala Dosa with Drumstick Sambar',
        category: 'Tiffin Specials',
        price: '180',
        rawDescription: 'Crispy fermented rice and lentil crepe smeared with golden Desi cow ghee, spiced potato masala, coconut chutney and tangy tamarind broth.',
        ingredients: 'Fermented rice and urad dal batter, A2 cow ghee, boiled potatoes, mustard seeds, curry leaves, green chilies, pigeon pea dal, drumstick pods, tamarind'
      },
      {
        originalName: 'Medu Vada with Gunpowder & Ghee',
        category: 'Snacks & Starters',
        price: '120',
        rawDescription: 'Golden deep-fried fluffy lentil doughnuts served with idli podi roasted in ghee and freshly ground mint-coconut chutney.',
        ingredients: 'Black gram lentil (urad dal), black pepper, ginger, curry leaves, hing (asafoetida), roasted lentil podi spices, ghee'
      },
      {
        originalName: 'Chettinad Pepper Chicken Fry',
        category: 'Signature Gravies',
        price: '280',
        rawDescription: 'Tender country chicken braised in stone-ground tellicherry black pepper, fennel seeds, star anise and toasted coconut paste.',
        ingredients: 'Chicken cuts, freshly crushed black pepper, fennel seeds, coconut paste, curry leaves, shallots, sesame oil'
      }
    ]
  },
  {
    id: 'tokyo-izakaya',
    restaurantName: 'Ebisu Nomitomo Izakaya (恵比寿 飲み友)',
    cuisine: 'Japanese Izakaya & Robata',
    sourceLanguage: 'Japanese',
    currency: '¥',
    items: [
      {
        originalName: 'たこ焼き (Takoyaki Osaka Style)',
        category: 'Small Plates',
        price: '780',
        rawDescription: '出汁を効かせた生地に真蛸と紅生姜を入れ、特製ソース、マヨネーズ、青海苔、踊る鰹節をトッピング。',
        ingredients: 'Dashi-infused flour batter, tender octopus pieces, pickled red ginger, tenkasu tempura scraps, sweet takoyaki fruit sauce, Japanese kewpie mayonnaise, bonito flakes (katsuobushi)'
      },
      {
        originalName: '茶碗蒸し (Chawanmushi with Uni & Truffle)',
        category: 'Comfort Dishes',
        price: '950',
        rawDescription: '昆布と鰹の一番出汁で仕立てた滑らかな蒸し卵に、北海道産生雲丹と三つ葉をあしらいました。',
        ingredients: 'Eggs, primary bonito and kombu dashi broth, Hokkaido sea urchin (uni), shiitake mushroom, mitsuba herb, mirin, light soy sauce'
      },
      {
        originalName: 'ねぎま炭火焼き鳥 (Negima Yakitori with Tare)',
        category: 'Kushiyaki',
        price: '620',
        rawDescription: '国産地鶏の腿肉と甘みのある千住葱を交互に刺し、秘伝の熟成タレで香ばしく炭火焼きに。',
        ingredients: 'Free-range chicken thigh skewers, Senju scallions (negi), aged tare glaze (soy sauce, mirin, sake, roasted chicken bone stock)'
      }
    ]
  }
];

const CULTURAL_EXPLANATIONS = {
  '夫妻肺片': {
    literalName: 'Husband and Wife Lung Slices',
    story: 'Invented in the 1930s by a Chengdu couple (Guo Chaohua & his wife). Although historically called "lung slices", it is made from thinly cut beef shank, tongue, and honeycomb tripe tossed in toasted chili oil and numbing Sichuan pepper. No lungs are actually used today!',
    flavorNotes: 'Mala (numbing & spicy), fragrant toasted sesame, deeply savory, crisp texture from tripe'
  },
  '蚂蚁上树': {
    literalName: 'Ants Climbing a Tree',
    story: 'A famous classic dish named for its visual poetry: the tiny bits of seasoned minced pork cling to thin translucent glass noodle strands like industrious ants climbing tree twigs. It is deeply comforting and savory.',
    flavorNotes: 'Rich umami, springy noodles, mild warmth from fermented chili bean paste (doubanjiang)'
  },
  '口水鸡': {
    literalName: 'Saliva Chicken / Mouthwatering Chicken',
    story: 'Poet Guo Moruo coined the term: the aroma of fresh Sichuan peppercorn oil, toasted sesame paste, and chili crisps is so intoxicating that one’s mouth literally waters before the first bite. It is served chilled or at room temperature.',
    flavorNotes: 'Tender chilled poultry, electrifying Sichuan peppercorn tingle, nutty toasted peanut crunch'
  },
  '麻婆豆腐': {
    literalName: 'Pockmarked Old Woman\'s Tofu',
    story: 'Originated in 1862 at a small tavern near Chengdu\'s Wanfu Bridge run by Mrs. Chen, affectionately known as Chen Mapo (pockmarked grandmother Chen). Her spicy, bubbling tofu stew became one of China\'s most beloved national treasures.',
    flavorNotes: 'Silky melt-in-mouth tofu, spicy-numbing beef sauce, aromatic fermented black beans'
  },
  'huitlacoche': {
    literalName: 'Corn Smut / Mexican Truffle',
    story: 'A revered culinary delicacy dating back to the Aztec Empire. This natural organic corn mushroom develops inside maize husks, delivering an earthy, smoky, sweet fungal profile similar to black truffles or morels.',
    flavorNotes: 'Deeply earthy, sweet corn undertones, rich mushroom aroma, unctuous with melted Oaxaca cheese'
  },
  'cacio e pepe': {
    literalName: 'Cheese and Pepper',
    story: 'An ancient Roman shepherd\'s staple: shepherds grazed flocks in the Apennine pastures carrying dry aged sheep cheese (Pecorino Romano), black peppercorns, and dry pasta. Cooking water creates a glossy emulsion without any added cream or butter.',
    flavorNotes: 'Pungent, sharp sheep\'s milk saltiness, fiery heat of toasted black pepper, silky creaminess'
  },
  'takoyaki': {
    literalName: 'Octopus Balls',
    story: 'Born in Osaka street stalls in 1935, popularized by street vendor Tomekichi Endo. Spherical wheat flour cakes crisped on a cast-iron dimpled pan with tender octopus, brushed with savory sweet glaze and dancing shaved bonito flakes that flutter with rising steam.',
    flavorNotes: 'Crispy exterior, piping hot creamy custard center, savory sweet glaze, smoky umami fish flakes'
  },
  'ghee roast': {
    literalName: 'Ghee Roasted',
    story: 'A signature coastal Karnataka and Tamil Nadu cooking technique where the fermented crepe or meat is slow-basted in clarified golden butter until blistering and hazelnut-brown, creating an unforgettable caramel aroma.',
    flavorNotes: 'Nutty clarified butter, crisp lacy wafer edges, comforting spiced potato center'
  }
};

module.exports = {
  ALLERGEN_TAXONOMY,
  SAMPLE_PRESETS,
  CULTURAL_EXPLANATIONS
};
