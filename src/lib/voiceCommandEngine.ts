import { Product, Store, CartItem } from '../types.ts';

// تعريف واجهات Web Speech API المعيارية لضمان التوافق التام مع TypeScript
export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
}

export type VoiceIntent =
  | 'ADD_TO_CART'
  | 'SEARCH'
  | 'NAVIGATE'
  | 'CLEAR_CART'
  | 'SHOW_DEAL_SCORE'
  | 'UNKNOWN';

export interface ParsedVoiceCommand {
  rawTranscript: string;
  intent: VoiceIntent;
  matchedProduct?: Product;
  quantity: number;
  searchQuery?: string;
  targetTab?: 'home' | 'cart' | 'matrix' | 'coupons' | 'maps' | 'history' | 'quicklist' | 'image-search' | 'alerts';
  spokenResponseText: string;
  confidenceScore: number;
  cheapestStore?: Store;
  cheapestPrice?: number;
}

// فحص توفر Web Speech API في متصفح المستخدم الحالي
export function isWebSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

// إنشاء نسخة جديدة من محرك التعرف على الكلام
export function createSpeechRecognitionInstance(): ISpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  const SpeechRecognitionConstructor =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) return null;

  try {
    const recognition: ISpeechRecognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA'; // اللهجة العربية السعودية كافتراض أساسي
    recognition.maxAlternatives = 3;
    return recognition;
  } catch (err) {
    console.warn('SpeechRecognition initialization error:', err);
    return null;
  }
}

// معالجة النصوص العربية وتوحيد الحروف لتسهيل المطابقة الدقيقة
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    // إزالة التشكيل والحركات
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // إزالة التطويل
    .replace(/\u0640/g, '')
    // توحيد الألف
    .replace(/[أإآٱ]/g, 'ا')
    // توحيد التاء المربوطة
    .replace(/ة/g, 'ه')
    // توحيد الياء
    .replace(/ى/g, 'ي')
    // توحيد الهمزات
    .replace(/[ؤئ]/g, 'ء')
    // إزالة علامات الترقيم والأقواس
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،]/g, ' ')
    // توحيد المسافات
    .replace(/\s+/g, ' ')
    .trim();
}

// استخراج الكمية من النص العربي
export function extractVoiceQuantity(normalizedText: string): number {
  // أرقام لاتينية أو عربية مباشرة
  const numberMatch = normalizedText.match(/\b([0-9]+|[٠-٩]+)\b/);
  if (numberMatch) {
    const rawNum = numberMatch[1];
    // تحويل الأرقام المشرقية إلى غربية
    const converted = rawNum.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const parsed = parseInt(converted, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
      return parsed;
    }
  }

  // كلمات تدل على الكميات
  if (/\b(حبتين|اثنين|اثنان|زوج)\b/.test(normalizedText)) return 2;
  if (/\b(ثلاث|ثلاثه|ثلاثة)\b/.test(normalizedText)) return 3;
  if (/\b(اربع|اربعه|اربعة)\b/.test(normalizedText)) return 4;
  if (/\b(خمس|خمسه|خمسة)\b/.test(normalizedText)) return 5;
  if (/\b(ست|سته|ستة)\b/.test(normalizedText)) return 6;
  if (/\b(سبع|سبعه|سبعة)\b/.test(normalizedText)) return 7;
  if (/\b(ثمان|ثمانيه|ثمانية)\b/.test(normalizedText)) return 8;
  if (/\b(تسع|تسعه|تسعة)\b/.test(normalizedText)) return 9;
  if (/\b(عشر|عشره|عشرة)\b/.test(normalizedText)) return 10;
  if (/\b(كرتون|كرتونين)\b/.test(normalizedText)) return 2;
  if (/\b(درزن)\b/.test(normalizedText)) return 12;
  if (/\b(نصف درزن)\b/.test(normalizedText)) return 6;

  return 1;
}

// مطابقة السلعة مع قاعدة المنتجات السعودية
export function matchProductFromVoiceText(
  normalizedText: string,
  products: Product[]
): { product: Product; score: number } | null {
  let bestMatch: Product | null = null;
  let highestScore = 0;

  // خريطة الكلمات الدلالية الخاصة بالسوق السعودي
  const synonymMap: Record<string, string[]> = {
    p1: ['حليب', 'لبن', 'المراعي', 'مراعي', 'حليب مراعي', 'حليب كامل الدسم', 'حليب طازج'],
    p2: ['ارز', 'رز', 'الشعلان', 'شعلان', 'بسمتي', 'سيلا', 'رز الشعلان', 'ارز الشعلان'],
    p3: ['زيت', 'عافيه', 'عافية', 'زيت ذره', 'زيت عافيه', 'زيت قلي', 'زيت طبخ'],
    p4: ['بيض', 'الوطنيه', 'الوطنية', 'طبق بيض', 'كرتون بيض', 'بيض طازج'],
    p5: ['سكر', 'الاسره', 'الأسرة', 'اسره', 'سكر ابيض', 'سكر ناعم'],
    p6: ['دجاج', 'التنميه', 'التنمية', 'دجاج مبرد', 'دجاج طازج', 'فروج', 'دجاجه'],
    p7: ['اريال', 'أريال', 'صابون', 'مسحوق غسيل', 'منظف', 'داوني', 'تايد'],
    p8: ['شاي', 'ربيع', 'شاي ربيع', 'اوراق الشاي', 'شاي احمر'],
    p9: ['تمر', 'سكري', 'القصيم', 'رطب', 'تمر سكري', 'سكري القصيم'],
    p10: ['مناديل', 'كلينكس', 'فاين', 'محارم', 'مناديل وجه', 'كلينكس كلاسيك'],
    'h-alt-milk': ['حليب قليل الدسم', 'قليل الدسم', 'نادك قليل الدسم', 'حليب خالي الدسم'],
    'h-alt-oats': ['شوفان', 'كويكر', 'شوفان حبوب كامله'],
    'h-alt-oil': ['زيت زيتون', 'زيتون الجوف', 'زيت زيتون بكر'],
    'h-alt-rice': ['ارز بني', 'رز اسمر', 'ارز اسمر'],
    'h-alt-sugar': ['ستيفيا', 'سكر دايت', 'سكر ستيفيا'],
    'h-alt-chicken': ['صدور دجاج', 'فيليه دجاج', 'صدور مبرده'],
  };

  for (const prod of products) {
    let score = 0;
    const prodNameNorm = normalizeArabicText(prod.nameAr);
    const prodCategoryNorm = normalizeArabicText(prod.category);

    // 1. فحص الكلمات الدلالية والاسم الشائع
    const synonyms = synonymMap[prod.id] || [];
    for (const syn of synonyms) {
      const synNorm = normalizeArabicText(syn);
      if (normalizedText.includes(synNorm)) {
        score = Math.max(score, synNorm.split(' ').length * 15 + 20);
      }
    }

    // 2. فحص مطابقة الكلمات المباشرة
    const textWords = normalizedText.split(' ').filter(w => w.length > 2);
    for (const word of textWords) {
      if (prodNameNorm.includes(word)) {
        score += 10;
      }
      if (prodCategoryNorm.includes(word)) {
        score += 4;
      }
      if (prod.tags && prod.tags.some(t => normalizeArabicText(t).includes(word))) {
        score += 8;
      }
    }

    // 3. تطابق كامل
    if (normalizedText.includes(prodNameNorm)) {
      score += 40;
    }

    if (score > highestScore && score >= 10) {
      highestScore = score;
      bestMatch = prod;
    }
  }

  if (bestMatch) {
    return { product: bestMatch, score: highestScore };
  }
  return null;
}

// العثور على أرخص سعر ومتجر للمنتج
export function findCheapestStoreForProduct(
  product: Product,
  stores: Store[]
): { store: Store; price: number } {
  let cheapestPrice = Infinity;
  let cheapestStore = stores[0];

  Object.entries(product.prices).forEach(([storeId, info]) => {
    if (info && info.inStock && info.priceInclVat < cheapestPrice) {
      cheapestPrice = info.priceInclVat;
      const found = stores.find(s => s.id === storeId);
      if (found) cheapestStore = found;
    }
  });

  return { store: cheapestStore, price: cheapestPrice === Infinity ? 0 : cheapestPrice };
}

// محلل الأوامر الصوتية الذكي باللغة العربية
export function parseVoiceCommand(
  rawTranscript: string,
  products: Product[],
  stores: Store[]
): ParsedVoiceCommand {
  const normalized = normalizeArabicText(rawTranscript);
  const quantity = extractVoiceQuantity(normalized);

  // أنماط إضافة إلى السلة
  const addToCartPatterns = [
    /^(اضف|أضف|ضيف|حط|ضع|اشتري|اشتر|سجل|ابي|ابغى|اريد|زوّد|زود)\b/,
    /\b(في السله|في السلة|للسله|للسلة|بالسله|بالسلة)\b/,
    /\b(اضفه للسله|ضيفه للسله|حطه بالسله)\b/,
  ];

  // أنماط مسح وتفريغ السلة
  const clearCartPatterns = [
    /\b(افراغ السله|تفريغ السله|تفريغ السلة|مسح السله|مسح السلة|حذف السله|حذف كل السله|امسح السله|احذف السله)\b/,
  ];

  // أنماط التنقل
  const navCartPatterns = [/\b(افتح السله|افتح السلة|ورني السله|عرض السله|شوف السله|احسب السله|سلة المشتريات)\b/];
  const navMapsPatterns = [/\b(افتح الخريطه|افتح الخريطة|المتاجر القريبه|وين الفروع|خريطتي|الخريطه)\b/];
  const navCouponsPatterns = [/\b(الكوبونات|كود خصم|اكواد الخصم|عروض الكوبونات|ورني الكوبونات)\b/];
  const navMatrixPatterns = [/\b(مصفوفة الاسعار|مصفوفه الاسعار|قارن المتاجر|جدول الاسعار|المقارنه الشامله)\b/];
  const navHistoryPatterns = [/\b(تاريخ الاسعار|سجل الاسعار|مخطط الاسعار|مؤشر الاسعار)\b/];
  const navQuickListPatterns = [/\b(القائمه السريعه|القائمة السريعة|قائمتي|قائمة المشتريات)\b/];
  const navImageSearchPatterns = [/\b(بحث بالصوره|ابحث بصوره|كاميرا|صوره المنتج)\b/];
  const navAlertsPatterns = [/\b(التنبيهات|المفضله|تنبيهات الاسعار|قائمة المفضله)\b/];

  // أنماط البحث ومقارنة الأسعار
  const searchPatterns = [
    /\b(ابحث عن|دور لي|وين ارخص|أرخص|ارخص|كم سعر|سعر|قارن سعر|ورني|اعطني|ابحث)\b/,
  ];

  // 1. فحص مسح السلة
  if (clearCartPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'CLEAR_CART',
      quantity: 1,
      spokenResponseText: 'تم تفريغ سلة المشتريات بنجاح.',
      confidenceScore: 0.95,
    };
  }

  // 2. فحص التنقل بين التبويبات
  if (navCartPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'NAVIGATE',
      targetTab: 'cart',
      quantity: 1,
      spokenResponseText: 'تم فتح سلة المشتريات وتفاصيل التوفير الذكي.',
      confidenceScore: 0.95,
    };
  }
  if (navMapsPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'NAVIGATE',
      targetTab: 'maps',
      quantity: 1,
      spokenResponseText: 'تم فتح خريطة فروع المتاجر السعودية القريبة.',
      confidenceScore: 0.95,
    };
  }
  if (navCouponsPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'NAVIGATE',
      targetTab: 'coupons',
      quantity: 1,
      spokenResponseText: 'تم الانتقال إلى صفحة كوبونات الخصم النشطة.',
      confidenceScore: 0.95,
    };
  }
  if (navMatrixPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'NAVIGATE',
      targetTab: 'matrix',
      quantity: 1,
      spokenResponseText: 'تم فتح مصفوفة مقارنة الأسعار بين جميع المتاجر.',
      confidenceScore: 0.95,
    };
  }
  if (navHistoryPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'NAVIGATE',
      targetTab: 'history',
      quantity: 1,
      spokenResponseText: 'تم فتح تاريخ ومؤشرات تغير أسعار السلع.',
      confidenceScore: 0.95,
    };
  }
  if (navQuickListPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'NAVIGATE',
      targetTab: 'quicklist',
      quantity: 1,
      spokenResponseText: 'تم فتح القائمة السريعة للمشتريات.',
      confidenceScore: 0.95,
    };
  }
  if (navImageSearchPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'NAVIGATE',
      targetTab: 'image-search',
      quantity: 1,
      spokenResponseText: 'تم الانتقال لخدمة البحث البصري بالصور.',
      confidenceScore: 0.95,
    };
  }
  if (navAlertsPatterns.some(p => p.test(normalized))) {
    return {
      rawTranscript,
      intent: 'NAVIGATE',
      targetTab: 'alerts',
      quantity: 1,
      spokenResponseText: 'تم فتح قائمة التنبيهات والسلع المفضلة لديك.',
      confidenceScore: 0.95,
    };
  }

  // 3. فحص إضافة السلعة للسلة
  const isAddIntent = addToCartPatterns.some(p => p.test(normalized));
  const productMatch = matchProductFromVoiceText(normalized, products);

  if (isAddIntent && productMatch) {
    const prod = productMatch.product;
    const { store, price } = findCheapestStoreForProduct(prod, stores);
    const qtyText = quantity > 1 ? `(${quantity} حبات)` : '';

    return {
      rawTranscript,
      intent: 'ADD_TO_CART',
      matchedProduct: prod,
      quantity,
      cheapestStore: store,
      cheapestPrice: price,
      spokenResponseText: `تمت إضافة ${prod.nameAr} ${qtyText} إلى السلة. أقل سعر في ${store.name} بـ ${price.toFixed(2)} ر.س`,
      confidenceScore: Math.min(0.98, productMatch.score / 50),
    };
  }

  // 4. إذا ذُكر اسم المنتج مع نية بحث أو سؤال عن السعر
  const isSearchIntent = searchPatterns.some(p => p.test(normalized));
  if (productMatch) {
    const prod = productMatch.product;
    const { store, price } = findCheapestStoreForProduct(prod, stores);

    if (isSearchIntent || normalized.includes('ارخص') || normalized.includes('كم سعر') || normalized.includes('وين')) {
      return {
        rawTranscript,
        intent: 'SEARCH',
        matchedProduct: prod,
        quantity: 1,
        searchQuery: prod.nameAr,
        cheapestStore: store,
        cheapestPrice: price,
        spokenResponseText: `أرخص سعر لـ ${prod.nameAr} متوفر في ${store.name} بسعر ${price.toFixed(2)} ر.س شامل الضريبة.`,
        confidenceScore: 0.92,
      };
    }

    // إذا قال المستخدم اسم السلعة فقط بدون فعل صريح، نفترض الإضافة السريعة مع إعلام المستخدم
    return {
      rawTranscript,
      intent: 'ADD_TO_CART',
      matchedProduct: prod,
      quantity,
      cheapestStore: store,
      cheapestPrice: price,
      spokenResponseText: `تمت إضافة ${prod.nameAr} إلى سلتك بـ ${price.toFixed(2)} ر.س من ${store.name}.`,
      confidenceScore: 0.88,
    };
  }

  // 5. بحث عام بدون مطابقة منتج محدد
  let cleanedQuery = normalized
    .replace(/^(ابحث عن|ابحث|دور لي|وين|ارخص|أرخص|كم سعر|سعر|قارن)\b/g, '')
    .trim();

  if (!cleanedQuery) cleanedQuery = rawTranscript.trim();

  return {
    rawTranscript,
    intent: 'SEARCH',
    searchQuery: cleanedQuery,
    quantity: 1,
    spokenResponseText: `جاري البحث عن "${cleanedQuery}" عبر جميع المتاجر السعودية...`,
    confidenceScore: 0.75,
  };
}

// تشغيل الرد الصوتي الطبيعي باستخدام Web Speech Synthesis API
export function speakVoiceFeedback(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // إيقاف أي قراءة صوتية جارية حالياً
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // محاولة اختيار صوت عربي أنثوي أو رجالي إن وجد في المتصفح
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar') || v.name.includes('Arabic'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
}

// تشغيل نغمة لطيفة عند بدء الاستماع أو نجاح التعرف
export function playVoiceBeep(type: 'start' | 'success' | 'error' = 'start'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (_) {
    // تجاهل أخطاء تشغيل الصوت إذا كان المتصفح مقيداً
  }
}

// قائمة الأوامر الصوتية الشائعة للاقتراحات والتجربة السريعة
export const SAMPLE_VOICE_COMMANDS = [
  {
    title: 'أضف حليب المراعي للسلة',
    command: 'أضف حليب المراعي كامل الدسم للسلة',
    badge: 'إضافة سلة',
    icon: '🥛',
  },
  {
    title: 'أضف أرز الشعلان حبتين',
    command: 'أضف أرز الشعلان حبتين للسلة',
    badge: 'كمية متعددة',
    icon: '🍚',
  },
  {
    title: 'وين أرخص زيت عافية؟',
    command: 'وين أرخص زيت عافية',
    badge: 'مقارنة أسعار',
    icon: '🛢️',
  },
  {
    title: 'أضف دجاج التنمية مبرد',
    command: 'أضف دجاج التنمية مبرد للسلة',
    badge: 'إضافة سلة',
    icon: '🍗',
  },
  {
    title: 'كم سعر طبق بيض الوطنية؟',
    command: 'كم سعر بيض الوطنية',
    badge: 'فحص سعر',
    icon: '🥚',
  },
  {
    title: 'أضف مسحوق غسيل أريال',
    command: 'أضف مسحوق غسيل أريال للسلة',
    badge: 'إضافة سلة',
    icon: '🧺',
  },
  {
    title: 'افتح سلة المشتريات',
    command: 'افتح السلة',
    badge: 'تنقل ذكي',
    icon: '🛒',
  },
  {
    title: 'افتح خريطة المتاجر',
    command: 'افتح الخريطة',
    badge: 'فروع ومسافات',
    icon: '🗺️',
  },
];
