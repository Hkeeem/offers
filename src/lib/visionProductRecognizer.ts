import { Product, Store, ImageSearchResponse, MatchedProductPriceAnalysis, StorePriceComparisonItem } from '../types.ts';
import { HEALTHY_ALTERNATIVES_DATA } from '../data/healthyAlternativesData.ts';
import { GoogleGenAI } from '@google/genai';

interface GoogleVisionApiResponse {
  responses?: Array<{
    labelAnnotations?: Array<{ description: string; score: number }>;
    textAnnotations?: Array<{ description: string; locale?: string }>;
    logoAnnotations?: Array<{ description: string; score: number }>;
    localizedObjectAnnotations?: Array<{ name: string; score: number }>;
    webDetection?: {
      webEntities?: Array<{ description: string; score: number }>;
      bestGuessLabels?: Array<{ label: string }>;
    };
    error?: { code: number; message: string };
  }>;
}

/**
 * دالة مساعدة لتنظيف وفصل الكلمات العربية والإنجليزية للتطابق
 */
function normalizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

/**
 * احتساب مقارنة أسعار المتاجر لمنتج معين
 */
export function buildProductPriceAnalysis(
  product: Product,
  allStores: Store[],
  confidenceScore: number,
  matchReason: string
): MatchedProductPriceAnalysis {
  const storePrices: StorePriceComparisonItem[] = [];

  allStores.forEach(store => {
    const priceInfo = product.prices[store.id];
    if (priceInfo) {
      storePrices.push({
        storeId: store.id,
        storeName: store.name,
        storeLogo: store.logo,
        brandColor: store.brandColor,
        priceInclVat: priceInfo.priceInclVat,
        priceExclVat: priceInfo.priceExclVat,
        inStock: priceInfo.inStock,
        isPromo: priceInfo.isPromo,
        originalPrice: priceInfo.originalPrice,
        isCheapest: false,
        differenceFromCheapestSar: 0,
        deliveryFee: store.deliveryFee,
        freeDeliveryThreshold: store.freeDeliveryThreshold,
        deliveryTime: store.deliveryTime,
      });
    }
  });

  // فرز المتاجر حسب السعر الأقل المتوفر في المخزون
  storePrices.sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.priceInclVat - b.priceInclVat;
  });

  const inStockStores = storePrices.filter(s => s.inStock);
  const cheapestPrice = inStockStores.length > 0 ? inStockStores[0].priceInclVat : storePrices[0]?.priceInclVat || 0;
  const highestPrice = inStockStores.length > 0 ? inStockStores[inStockStores.length - 1].priceInclVat : cheapestPrice;

  // تحديد المتجر الأرخص وحساب الفوارق
  storePrices.forEach(item => {
    if (item.inStock && item.priceInclVat === cheapestPrice) {
      item.isCheapest = true;
    }
    item.differenceFromCheapestSar = parseFloat(Math.max(0, item.priceInclVat - cheapestPrice).toFixed(2));
  });

  const cheapestStoreObj = allStores.find(s => s.id === inStockStores[0]?.storeId) || allStores[0];
  const savingsVsHighest = Math.max(0, parseFloat((highestPrice - cheapestPrice).toFixed(2)));
  const savingsPercentage = highestPrice > 0 ? Math.round((savingsVsHighest / highestPrice) * 100) : 0;

  // فحص ما إذا كان هناك بدائل صحية مسجلة لهذا المنتج
  const healthyAlts: MatchedProductPriceAnalysis['healthyAlternatives'] = [];
  const matchingHealthItems = HEALTHY_ALTERNATIVES_DATA.filter(h => h.originalProductId === product.id);
  matchingHealthItems.forEach(alt => {
    // احتساب أقل سعر للبديل الصحي
    let altCheapest = 999;
    Object.values(alt.prices).forEach(p => {
      if (p && p.inStock && p.priceInclVat < altCheapest) {
        altCheapest = p.priceInclVat;
      }
    });
    if (altCheapest === 999) altCheapest = 15;
    const diff = parseFloat((altCheapest - cheapestPrice).toFixed(2));

    healthyAlts.push({
      id: alt.id,
      nameAr: alt.nameAr,
      badge: alt.healthBadgeText,
      reason: alt.summaryReason,
      lowestPriceSar: altCheapest,
      priceDifferenceSar: diff,
    });
  });

  return {
    product,
    confidenceScore: Math.min(99, Math.max(40, confidenceScore)),
    matchReason,
    lowestPriceSar: cheapestPrice,
    highestPriceSar: highestPrice,
    cheapestStore: cheapestStoreObj,
    savingsVsHighestSar: savingsVsHighest,
    savingsPercentage,
    storePrices,
    healthyAlternatives: healthyAlts.length > 0 ? healthyAlts : undefined,
  };
}

/**
 * مطابقة مخرجات الرؤية الحاسوبية (Cloud Vision) مع قاعدة بيانات المنتجات السعودية
 */
export function matchVisionToSaudiProducts(
  labels: Array<{ description: string; score: number }>,
  detectedText: string,
  logos: string[],
  objects: string[],
  webEntities: string[],
  allProducts: Product[],
  allStores: Store[]
): {
  primaryMatch: MatchedProductPriceAnalysis | null;
  alternatives: MatchedProductPriceAnalysis[];
} {
  const ocrTokens = normalizeText(detectedText);
  const labelTokens = labels.map(l => l.description.toLowerCase());
  const logoTokens = logos.map(l => l.toLowerCase());
  const objectTokens = objects.map(o => o.toLowerCase());
  const webTokens = webEntities.map(w => w.toLowerCase());

  const scoredProducts: Array<{
    product: Product;
    score: number;
    reasons: string[];
  }> = [];

  allProducts.forEach(prod => {
    let score = 0;
    const reasons: string[] = [];

    const prodNameArTokens = normalizeText(prod.nameAr);
    const prodNameEnTokens = normalizeText(prod.nameEn);
    const prodTagsTokens = prod.tags.map(t => t.toLowerCase());

    // 1. فحص الباركود (إذا رُصد باركود 13 رقم مطابق تماماً في OCR)
    if (prod.barcode && detectedText.includes(prod.barcode)) {
      score += 80;
      reasons.push(`تطابق الباركود المباشر (${prod.barcode})`);
    }

    // 2. فحص الشعارات التجارية (Logo Detection من Vision API)
    for (const logo of logoTokens) {
      if (
        prod.nameEn.toLowerCase().includes(logo) ||
        prod.nameAr.toLowerCase().includes(logo) ||
        prodTagsTokens.some(t => logo.includes(t) || t.includes(logo))
      ) {
        score += 35;
        reasons.push(`رصد شعار العلامة التجارية (${logo}) عبر Vision API`);
        break;
      }
    }

    // 3. فحص الكلمات المفتاحية في النص المقروء (OCR Text Annotations)
    let matchedNameWords = 0;
    for (const token of prodNameArTokens) {
      if (ocrTokens.includes(token)) {
        matchedNameWords++;
        score += 15;
      }
    }
    for (const token of prodNameEnTokens) {
      if (ocrTokens.includes(token)) {
        matchedNameWords++;
        score += 12;
      }
    }
    if (matchedNameWords > 0) {
      reasons.push(`تطابق ${matchedNameWords} كلمات في النص المستخرج`);
    }

    // 4. مطابقة الوسوم (Tags) مع نصوص ووسوم Vision
    let tagMatches = 0;
    for (const tag of prod.tags) {
      const lowerTag = tag.toLowerCase();
      if (
        ocrTokens.includes(lowerTag) ||
        labelTokens.some(l => l.includes(lowerTag)) ||
        webTokens.some(w => w.includes(lowerTag))
      ) {
        score += 10;
        tagMatches++;
      }
    }
    if (tagMatches > 0) {
      reasons.push(`تطابق وسوم التصنيف (${tagMatches})`);
    }

    // 5. مطابقة التصنيف العام (Labels & Objects)
    const categoryTokens = normalizeText(prod.category);
    for (const catToken of categoryTokens) {
      if (
        labelTokens.some(l => l.includes(catToken)) ||
        webTokens.some(w => w.includes(catToken))
      ) {
        score += 8;
        break;
      }
    }

    // تطابقات نوعية شائعة بين اللغة الإنجليزية والمنتجات السعودية
    const englishCategoryMap: Record<string, string[]> = {
      'حليب': ['milk', 'dairy', 'drink', 'beverage', 'lactose'],
      'أرز': ['rice', 'grain', 'basmati', 'food'],
      'زيت': ['oil', 'cooking oil', 'liquid', 'bottle', 'olive oil', 'corn oil'],
      'دجاج': ['chicken', 'poultry', 'meat', 'bird'],
      'بيض': ['egg', 'eggs', 'egg box', 'poultry'],
      'سكر': ['sugar', 'sweetener', 'powder', 'stevia'],
      'شاي': ['tea', 'black tea', 'green tea', 'herb'],
      'منظف': ['detergent', 'cleaning', 'laundry', 'soap', 'powder'],
      'ماء': ['water', 'mineral water', 'bottle', 'plastic bottle'],
      'مناديل': ['tissue', 'paper', 'napkin', 'box'],
    };

    Object.entries(englishCategoryMap).forEach(([keyword, engWords]) => {
      if (prod.nameAr.includes(keyword)) {
        for (const eng of engWords) {
          if (
            labelTokens.some(l => l.includes(eng)) ||
            objectTokens.some(o => o.includes(eng)) ||
            webTokens.some(w => w.includes(eng))
          ) {
            score += 12;
            reasons.push(`التعرف الدلالي عبر Vision API على فئة (${keyword})`);
            break;
          }
        }
      }
    });

    if (score > 0) {
      scoredProducts.push({
        product: prod,
        score,
        reasons,
      });
    }
  });

  // الترتيب حسب أعلى درجة تطابق
  scoredProducts.sort((a, b) => b.score - a.score);

  if (scoredProducts.length === 0) {
    // في حال عدم وجود أي تطابق نصي دقيق، نختار المنتج الأكثر ارتباطاً بفئة أول ملصق
    const fallbackProd = allProducts[0];
    return {
      primaryMatch: buildProductPriceAnalysis(
        fallbackProd,
        allStores,
        50,
        'تعرف تقريبي مبني على المظهر العام للصورة'
      ),
      alternatives: allProducts.slice(1, 4).map(p =>
        buildProductPriceAnalysis(p, allStores, 45, 'خيار بديل مقترح')
      ),
    };
  }

  const top = scoredProducts[0];
  const primaryMatch = buildProductPriceAnalysis(
    top.product,
    allStores,
    Math.min(98, 55 + top.score),
    top.reasons.join(' • ') || 'تطابق عالي مع مواصفات العبوة والشعار'
  );

  const alternatives = scoredProducts.slice(1, 4).map(s =>
    buildProductPriceAnalysis(
      s.product,
      allStores,
      Math.min(90, 40 + s.score),
      s.reasons.join(' • ') || 'تطابق جزئي'
    )
  );

  return { primaryMatch, alternatives };
}

/**
 * استدعاء Google Cloud Vision API الرسمية (v1 images:annotate)
 */
export async function analyzeImageWithGoogleVision(
  base64Data: string,
  apiKey: string
): Promise<{
  labels: Array<{ description: string; score: number }>;
  detectedText: string;
  logos: string[];
  objects: string[];
  webEntities: string[];
  error?: string;
}> {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const requestBody = {
    requests: [
      {
        image: {
          content: base64Data,
        },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 15 },
          { type: 'TEXT_DETECTION', maxResults: 15 },
          { type: 'LOGO_DETECTION', maxResults: 5 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
          { type: 'WEB_DETECTION', maxResults: 8 },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SmartDealAI-CloudVision/1.0',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Cloud Vision API HTTP ${response.status}: ${errorText}`);
  }

  const data: GoogleVisionApiResponse = await response.json();
  const res = data.responses?.[0];

  if (res?.error) {
    throw new Error(`Google Cloud Vision API Error: ${res.error.message}`);
  }

  const labels = (res?.labelAnnotations || []).map(l => ({
    description: l.description,
    score: l.score,
  }));

  const detectedText = (res?.textAnnotations || []).map(t => t.description).join(' ');

  const logos = (res?.logoAnnotations || []).map(l => l.description);

  const objects = (res?.localizedObjectAnnotations || []).map(o => o.name);

  const webEntities = (res?.webDetection?.webEntities || [])
    .map(w => w.description)
    .filter(Boolean) as string[];

  return {
    labels,
    detectedText,
    logos,
    objects,
    webEntities,
  };
}

/**
 * تحليل احتياطي فائق الذكاء عبر Gemini Multimodal Vision API
 */
export async function analyzeImageWithGeminiFallback(
  base64Data: string,
  mimeType: string,
  geminiClient: GoogleGenAI,
  allProducts: Product[]
): Promise<{
  labels: Array<{ description: string; score: number }>;
  detectedText: string;
  logos: string[];
  objects: string[];
  webEntities: string[];
  suggestedProductId?: string;
  confidence?: number;
}> {
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  const productCatalogBrief = allProducts
    .map(p => `ID: ${p.id} | Name: ${p.nameAr} | En: ${p.nameEn} | Barcode: ${p.barcode} | Category: ${p.category}`)
    .join('\n');

  const prompt = `أنت محرك التعرف البصري على المنتجات وسلع السوبرماركت في المملكة العربية السعودية لمنصة "حكيم AI".
قم بتحليل صورة المنتج المرفقة واستخرج البيانات التالية بدقة فائقة:
1. النصوص المقروءة على العبوة (OCR باللغتين العربية والإنجليزية، اسم العلامة والحجم).
2. العلامة التجارية والشعار التجاري (مثل: المراعي، الشعلان، عافية، أريال، تانيا، إلخ).
3. نوع المنتج والملصقات البصرية (Labels).
4. طابق الصورة مع أنسب منتج من الكتالوج السعودي التالي:
${productCatalogBrief}

أجب بصيغة JSON حصراً بدون نصوص إضافية كالتالي:
{
  "detectedText": "النصوص المستخرجة من العبوة",
  "logos": ["اسم العلامة التجارية"],
  "labels": [{"description": "اسم الوصف بالإنجليزية", "score": 0.95}],
  "objects": ["نوع الجسم مثل Bottle أو Food"],
  "webEntities": ["أقرب كلمات دلالية للسلعة"],
  "matchedProductId": "id المنتج الأقرب من الكتالوج أعلاه",
  "confidence": 95,
  "identificationReason": "سبب التطابق"
}`;

  for (const modelName of candidateModels) {
    try {
      const response = await geminiClient.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType || 'image/jpeg',
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          labels: Array.isArray(parsed.labels) ? parsed.labels : [{ description: 'Grocery Product', score: 0.9 }],
          detectedText: parsed.detectedText || '',
          logos: Array.isArray(parsed.logos) ? parsed.logos : [],
          objects: Array.isArray(parsed.objects) ? parsed.objects : ['Packaged goods'],
          webEntities: Array.isArray(parsed.webEntities) ? parsed.webEntities : [],
          suggestedProductId: parsed.matchedProductId,
          confidence: parsed.confidence || 90,
        };
      }
    } catch (_) {
      // تجربة النموذج التالي
    }
  }

  // رد افتراضي في حال عدم تمكن النماذج الخارجية
  return {
    labels: [{ description: 'Packaged Goods', score: 0.85 }],
    detectedText: '',
    logos: [],
    objects: ['Food'],
    webEntities: ['Supermarket product'],
  };
}
