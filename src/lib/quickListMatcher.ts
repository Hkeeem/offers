import { Product, Store, QuickListMatchedItem } from '../types.ts';
import { getProductLowestPrice } from './priceAlertsManager.ts';

// تطبيع النصوص العربية لتسهيل البحث والمطابقة الذكية
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // إزالة التشكيل والحركات
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // توحيد الألفات
    .replace(/[أإآ]/g, 'ا')
    // توحيد التاء المربوطة
    .replace(/ة/g, 'ه')
    // توحيد الياء
    .replace(/ى/g, 'ي')
    // إزالة الأقواس والرموز الزائدة
    .replace(/[()\[\]{}،,.-]/g, ' ')
    // توحيد المسافات
    .replace(/\s+/g, ' ');
}

// استخراج الكمية إن وُجدت من سطر النص (مثل "2 حليب" أو "حليب المراعي 3")
export function extractQuantityAndQuery(rawLine: string): { quantity: number; query: string } {
  let text = rawLine.trim();
  let quantity = 1;

  // فحص الأنماط مثل "2x حليب" أو "2 حليب" أو "حليب x2"
  const startNumberMatch = text.match(/^(\d+)\s*(?:x|×|حبات|حبة|علب|علبة|أكياس|كيس|كرتون)?\s+(.+)$/i);
  if (startNumberMatch) {
    const num = parseInt(startNumberMatch[1], 10);
    if (!isNaN(num) && num > 0 && num < 100) {
      quantity = num;
      text = startNumberMatch[2].trim();
    }
  } else {
    // فحص في النهاية "حليب المراعي 2"
    const endNumberMatch = text.match(/^(.+?)\s+(\d+)\s*(?:حبات|حبة|علب|علبة|أكياس|كيس|كرتون|x|×)?$/i);
    if (endNumberMatch) {
      const num = parseInt(endNumberMatch[2], 10);
      if (!isNaN(num) && num > 0 && num < 100) {
        quantity = num;
        text = endNumberMatch[1].trim();
      }
    }
  }

  return { quantity, query: text };
}

// مطابقة عنصر مع قاعدة بيانات السلع
export function matchItemWithDatabase(
  rawInput: string,
  products: Product[],
  stores: Store[],
  cartProductIds: string[] = []
): QuickListMatchedItem {
  const { quantity, query } = extractQuantityAndQuery(rawInput);
  const normalizedQuery = normalizeArabicText(query);
  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 1);

  const scoredProducts: { product: Product; score: number }[] = [];

  for (const product of products) {
    const normNameAr = normalizeArabicText(product.nameAr);
    const normNameEn = product.nameEn.toLowerCase();
    const normCategory = normalizeArabicText(product.category);
    const normTags = product.tags.map(t => normalizeArabicText(t));

    let score = 0;

    // تطابق تام مع الاسم
    if (normNameAr === normalizedQuery || normNameEn === query.toLowerCase()) {
      score += 100;
    }
    // الاسم يحتوي العبارة بالكامل
    else if (normNameAr.includes(normalizedQuery)) {
      score += 60;
    }
    // أحد الكلمات الدلالية تطابق العبارة
    else if (normTags.some(t => t === normalizedQuery)) {
      score += 50;
    }

    // مطابقة بالكلمات المنفردة
    for (const word of queryWords) {
      if (normNameAr.includes(word)) {
        score += 20;
      }
      if (normTags.some(t => t.includes(word))) {
        score += 15;
      }
      if (normCategory.includes(word)) {
        score += 8;
      }
    }

    if (score > 0) {
      scoredProducts.push({ product, score });
    }
  }

  // فرز المنتجات تنازلياً حسب درجة المطابقة
  scoredProducts.sort((a, b) => b.score - a.score);

  const bestMatch = scoredProducts[0]?.product || null;
  const highestScore = scoredProducts[0]?.score || 0;
  const alternativeMatches = scoredProducts.slice(1, 4).map(s => s.product);

  let matchConfidence: QuickListMatchedItem['matchConfidence'] = 'unmatched';
  if (highestScore >= 70) matchConfidence = 'exact';
  else if (highestScore >= 35) matchConfidence = 'high';
  else if (highestScore > 0) matchConfidence = 'partial';

  let bestStore: Store | undefined;
  let lowestPriceSar: number | undefined;
  let totalCostSar: number | undefined;
  let potentialSavingsSar: number | undefined;

  if (bestMatch) {
    const priceInfo = getProductLowestPrice(bestMatch, stores);
    lowestPriceSar = priceInfo.lowestPrice;
    bestStore = priceInfo.store;
    totalCostSar = parseFloat((lowestPriceSar * quantity).toFixed(2));

    // حساب التوفير مقارنة بأعلى سعر في المتاجر
    const prices = Object.values(bestMatch.prices)
      .filter(p => p.inStock)
      .map(p => p.priceInclVat);
    if (prices.length > 1) {
      const highestPrice = Math.max(...prices);
      potentialSavingsSar = parseFloat(((highestPrice - lowestPriceSar) * quantity).toFixed(2));
    } else {
      potentialSavingsSar = 0;
    }
  }

  const isInCart = bestMatch ? cartProductIds.includes(bestMatch.id) : false;

  return {
    id: `ql-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    rawInputText: rawInput,
    detectedQuantity: quantity,
    matchedProduct: bestMatch,
    matchConfidence,
    alternativeMatches,
    bestStore,
    lowestPriceSar,
    totalCostSar,
    potentialSavingsSar,
    isInCart,
  };
}

// تحليل نص متعدد الأسطر (قائمة تسوق كاملة منسوخة أو مكتوبة)
export function parseBulkQuickList(
  rawBulkText: string,
  products: Product[],
  stores: Store[],
  cartProductIds: string[] = []
): QuickListMatchedItem[] {
  if (!rawBulkText.trim()) return [];

  // تقسيم النص إما بالأسطر الجديدة أو بالفواصل
  const lines = rawBulkText
    .split(/[\n\r]+|،|,/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));

  return lines.map(line => matchItemWithDatabase(line, products, stores, cartProductIds));
}

// القوائم الجاهزة المقترحة لتسهيل التجربة
export const PRESET_QUICK_LISTS = [
  {
    id: 'ramadan',
    title: 'مقاضي رمضان الأساسية 🌙',
    description: 'شاملة التمر، الأرز، الزيت، والشوربة والعصائر',
    items: [
      'تمر سكري فاخر',
      'أرز الشعلان سيلا 5 كجم',
      'زيت عافية 1.5 لتر',
      'شوربة كويكر شوفان',
      'فيمتو مركز',
      'حليب المراعي 2 لتر',
      'دجاج التنمية مبرد',
    ],
  },
  {
    id: 'weekly_family',
    title: 'سلة العائلة الأسبوعية 👨‍👩‍👧‍👦',
    description: 'السلع الاستهلاكية الأساسية لكل منزل سعودي',
    items: [
      'حليب المراعي 2 لتر',
      'طبق بيض الوطنية',
      'أرز الشعلان 5 كجم',
      'زيت ذرة عافية',
      'دجاج التنمية 2 حبة',
      'مسحوق أريال 5 كجم',
      'مناديل كلينكس عبوة توفيرية',
    ],
  },
  {
    id: 'breakfast',
    title: 'فطور الصباح اللذيذ ☀️',
    description: 'الأجبان والبيض والخبز والعصائر الطازجة',
    items: [
      'طبق بيض الوطنية',
      'جبنة كيري مربعات',
      'حليب المراعي طازج',
      'عصير برتقال فلوريدا',
      'شاي الربيع إكسبرس',
      'خبز توست لوزين',
    ],
  },
  {
    id: 'cleaning',
    title: 'مستلزمات النظافة والبيت 🧼',
    description: 'منظفات الغسيل والصحون والمطهرات',
    items: [
      'مسحوق أريال مركز',
      'سائل فيري لغسيل الصحون',
      'مطهر داك برائحة اللافندر',
      'مناديل كلينكس عبوة عائلية',
      'أكياس نفايات متينة',
    ],
  },
];
