import { Product, Store, Coupon, DealScoreResult } from '../types.ts';
import { generateMonthlyPriceHistory } from '../data/priceHistoryHelper.ts';
import { SAUDI_STORES, SAUDI_COUPONS } from '../data/saudiData.ts';

/**
 * خوارزمية ذكية متقدمة لحساب "مقياس قوة العرض" (Deal Score) من 1 إلى 10
 * مبنية على 3 ركائز أساسية:
 * 1. السعر التاريخي مقارنة بمتوسط وأدنى سعر سُجّل للمنتج
 * 2. سعر المنافسين في كبرى المتاجر السعودية (بنده، العثيم، الدانوب، كارفور، أمازون، لولو)
 * 3. توافر كوبونات إضافية للمتجر تمنح وفراً مضاعفاً
 */
export function calculateLocalDealScore(
  product: Product,
  targetStoreId?: string,
  stores: Store[] = SAUDI_STORES,
  coupons: Coupon[] = SAUDI_COUPONS
): DealScoreResult {
  // تحديد المتجر المستهدف للتقييم: إما المتجر المختار أو الأرخص سعراً
  let storeId = targetStoreId;
  let dealPrice = 0;

  // جلب كافة أسعار المتاجر المتوفرة
  const storePrices: { store: Store; price: number; isPromo: boolean; originalPrice?: number }[] = [];
  stores.forEach((s) => {
    const priceInfo = product.prices[s.id];
    if (priceInfo && priceInfo.inStock) {
      storePrices.push({
        store: s,
        price: priceInfo.priceInclVat,
        isPromo: Boolean(priceInfo.isPromo),
        originalPrice: priceInfo.originalPrice,
      });
    }
  });

  storePrices.sort((a, b) => a.price - b.price);

  if (!storePrices.length) {
    // حالة افتراضية نادرة
    const fallbackStore = stores[0];
    return {
      productId: product.id,
      productNameAr: product.nameAr,
      productImage: product.imageUrl,
      productUnit: product.unit,
      storeId: fallbackStore.id,
      storeName: fallbackStore.name,
      storeLogo: fallbackStore.logo,
      dealPriceSar: 10,
      overallScore: 5.0,
      grade: 'عرض عادي',
      verdict: 'بيانات التسعير غير كافية لتقييم العرض بدقة.',
      aiAdvice: 'يرجى مراجعة الأسعار عبر التطبيق.',
      shouldBuyNow: false,
      bestTimeBuy: 'خلال عروض الأربعاء القادمة',
      confidence: 50,
      historicalFactor: {
        score: 5,
        title: 'السعر التاريخي',
        description: 'لا يتوفر سجل كافٍ',
        metric: '0%',
        isPositive: false,
        historicalLowest: 10,
        historicalAvg: 10,
        historicalHighest: 10,
        diffFromAvgPercent: 0,
      },
      competitorFactor: {
        score: 5,
        title: 'سعر المنافسين',
        description: 'متجر واحد متوفر',
        metric: '0 ر.س',
        isPositive: false,
        cheapestStoreName: fallbackStore.name,
        cheapestStorePrice: 10,
        mostExpensiveStoreName: fallbackStore.name,
        mostExpensivePrice: 10,
        savingVsHighest: 0,
        rank: 1,
        totalStores: 1,
      },
      couponFactor: {
        score: 5,
        title: 'كوبونات إضافية',
        description: 'لا تتوفر كوبونات فعالة',
        metric: 'بدون كود',
        isPositive: false,
        hasCoupon: false,
      },
    };
  }

  // إذا لم يحدد المتجر، نعتمد المتجر صاحب السعر الأفضل
  const selectedStoreEntry = storePrices.find((sp) => sp.store.id === storeId) || storePrices[0];
  const activeStore = selectedStoreEntry.store;
  dealPrice = selectedStoreEntry.price;
  storeId = activeStore.id;

  // ==========================================
  // الركيزة 1: تقييم السعر التاريخي (Historical Price Factor)
  // ==========================================
  const historyData = product.priceHistory || generateMonthlyPriceHistory(product);
  const allHistoricalPrices = historyData
    .flatMap((h) => [h.panda, h.othaim, h.danube, h.carrefour, h.amazon, h.lulu])
    .filter((p): p is number => typeof p === 'number');

  const historicalLowest = Math.min(...allHistoricalPrices);
  const historicalHighest = Math.max(...allHistoricalPrices);
  const historicalAvg =
    allHistoricalPrices.reduce((sum, val) => sum + val, 0) / (allHistoricalPrices.length || 1);

  const diffFromAvgPercent = Number((((dealPrice - historicalAvg) / historicalAvg) * 100).toFixed(1));
  const diffFromLowest = dealPrice - historicalLowest;

  let historicalScore = 5.0;
  let historicalDesc = '';
  let historicalPositive = false;

  if (dealPrice <= historicalLowest + 0.05) {
    historicalScore = 9.8;
    historicalDesc = `سعر تاريخي قياسي! هذا أقل سعر مسجّل للمنتج خلال آخر 30 يوماً (${historicalLowest.toFixed(2)} ر.س).`;
    historicalPositive = true;
  } else if (diffFromAvgPercent <= -12) {
    historicalScore = 9.1;
    historicalDesc = `أقل بنسبة ${Math.abs(diffFromAvgPercent)}% من متوسط السعر التاريخي (${historicalAvg.toFixed(2)} ر.س).`;
    historicalPositive = true;
  } else if (diffFromAvgPercent <= -5) {
    historicalScore = 8.0;
    historicalDesc = `سعر منخفض ومناسب يقل بـ ${Math.abs(diffFromAvgPercent)}% عن السعر المعتاد.`;
    historicalPositive = true;
  } else if (diffFromAvgPercent <= 3) {
    historicalScore = 6.2;
    historicalDesc = `السعر قريب جداً من المتوسط التاريخي (${historicalAvg.toFixed(2)} ر.س) دون خصم استثنائي.`;
    historicalPositive = false;
  } else {
    historicalScore = 3.8;
    historicalDesc = `السعر أعلى من المتوسط التاريخي بنسبة ${diffFromAvgPercent}%. يُنصح بالتريث.`;
    historicalPositive = false;
  }

  // ==========================================
  // الركيزة 2: تقييم سعر المنافسين (Competitors Prices Factor)
  // ==========================================
  const cheapestPrice = storePrices[0].price;
  const mostExpensivePrice = storePrices[storePrices.length - 1].price;
  const cheapestStoreName = storePrices[0].store.name;
  const mostExpensiveStoreName = storePrices[storePrices.length - 1].store.name;
  const savingVsHighest = Number((mostExpensivePrice - dealPrice).toFixed(2));
  const savingPercentVsHighest = Math.round(((mostExpensivePrice - dealPrice) / mostExpensivePrice) * 100);

  // ترتيب هذا المتجر بين المنافسين (1 = الأرخص)
  const rank = storePrices.findIndex((sp) => sp.store.id === storeId) + 1;
  const totalStores = storePrices.length;

  let competitorScore = 5.0;
  let competitorDesc = '';
  let competitorPositive = false;

  if (rank === 1) {
    if (savingVsHighest >= 5 || savingPercentVsHighest >= 18) {
      competitorScore = 9.9;
      competitorDesc = `المركز الأول بلا منازع 🏆! يوفر ${savingVsHighest} ر.س (${savingPercentVsHighest}%) مقارنة بأعلى منافس (${mostExpensiveStoreName}).`;
      competitorPositive = true;
    } else if (savingVsHighest > 1) {
      competitorScore = 9.2;
      competitorDesc = `الأرخص بين ${totalStores} متاجر سعودية كبرى بفارق ${savingVsHighest} ر.س.`;
      competitorPositive = true;
    } else {
      competitorScore = 8.6;
      competitorDesc = `أفضل سعر متاح في السوق مناصفة مع المتاجر المنافسة.`;
      competitorPositive = true;
    }
  } else if (rank === 2) {
    const diffFromCheapest = dealPrice - cheapestPrice;
    competitorScore = 7.3;
    competitorDesc = `ثاني أفضل سعر في السوق، يبعد فقط ${diffFromCheapest.toFixed(2)} ر.س عن أرخص متجر (${cheapestStoreName}).`;
    competitorPositive = true;
  } else {
    const diffFromCheapest = dealPrice - cheapestPrice;
    competitorScore = Math.max(3.0, Number((7.0 - (rank - 1) * 1.2).toFixed(1)));
    competitorDesc = `يحتل المرتبة ${rank} من أصل ${totalStores} متاجر. متجر ${cheapestStoreName} يبيعه بسعر أوفر بـ ${diffFromCheapest.toFixed(2)} ر.س.`;
    competitorPositive = false;
  }

  // ==========================================
  // الركيزة 3: توافر كوبونات إضافية (Coupons Availability Factor)
  // ==========================================
  const storeCoupon = coupons.find((c) => c.storeId === storeId);
  let couponScore = 5.5;
  let couponDesc = '';
  let couponPositive = false;
  let effectivePriceWithCoupon: number | undefined = undefined;
  let couponDiscountText = '';

  if (storeCoupon) {
    couponPositive = true;
    let estimatedDiscount = 0;
    if (storeCoupon.discountType === 'PERCENTAGE') {
      estimatedDiscount = (dealPrice * storeCoupon.discountValue) / 100;
      if (storeCoupon.maxDiscount && estimatedDiscount > storeCoupon.maxDiscount) {
        estimatedDiscount = storeCoupon.maxDiscount;
      }
      couponDiscountText = `خصم ${storeCoupon.discountValue}% كود (${storeCoupon.code})`;
    } else {
      // ثابت
      estimatedDiscount = Math.min(storeCoupon.discountValue, dealPrice * 0.25);
      couponDiscountText = `خصم ${storeCoupon.discountValue} ر.س كود (${storeCoupon.code})`;
    }

    effectivePriceWithCoupon = Number(Math.max(1, dealPrice - estimatedDiscount).toFixed(2));
    couponScore = 9.4;
    couponDesc = `يتوفر كود معتمد (${storeCoupon.code}) يمنح وفراً إضافياً ينزل السعر التقديري إلى ${effectivePriceWithCoupon} ر.س!`;
  } else {
    // فحص ما إذا كان هناك كوبون لأحد المنافسين
    const competitorWithCoupon = coupons.find((c) => storePrices.some((sp) => sp.store.id === c.storeId));
    couponScore = 6.0;
    couponDesc = competitorWithCoupon
      ? `لا يتوفر كود مباشر لـ ${activeStore.name} حالياً، لكن السعر الأساسي يظل هو الأقل.`
      : `لا توجد أكواد خصم إضافية نشطة لهذا الصنف حالياً.`;
    couponPositive = false;
  }

  // ==========================================
  // احتساب التقييم الإجمالي الموزون (Overall Weighted Score)
  // 40% السعر التاريخي + 40% سعر المنافسين + 20% الكوبونات الإضافية
  // ==========================================
  const rawOverall = historicalScore * 0.4 + competitorScore * 0.4 + couponScore * 0.2;
  const overallScore = Number(Math.min(10, Math.max(1, rawOverall)).toFixed(1));

  // تحديد الدرجة والتوصية الذكية
  let grade = 'عرض معتدل';
  let verdict = '';
  let aiAdvice = '';
  let shouldBuyNow = true;
  let bestTimeBuy = 'اليوم قبل نفاد الكمية';

  if (overallScore >= 8.8) {
    grade = 'صفقة استثنائية (صيد ذهبي) ⚡';
    verdict = 'فرصة نادرة! السعر يلامس القاع التاريخي مع تفوق كاسح على جميع المنافسين وتوافر كود خصم.';
    aiAdvice = `يُنصح بالشراء فوراً دون أي تردد؛ الصنف يمثل صفقة ذهبية حقيقية في ${activeStore.name} بفارق وفر ${savingVsHighest} ر.س عن أعلى متجر، مع اقترابه من أدنى سعر تاريخي (${historicalLowest.toFixed(2)} ر.س).`;
    shouldBuyNow = true;
    bestTimeBuy = 'اشترِ الآن (عروض البروشور الحالية)';
  } else if (overallScore >= 7.5) {
    grade = 'عرض ممتاز وقوي جداً ✓';
    verdict = 'عرض ذكي وتوفير حقيقي، السعر ممتاز مقارنة بالسوق وتاريخ الأسعار.';
    aiAdvice = `عرض قوي ومجدٍ اقتصادياً في ${activeStore.name}. السعر يمنحك وفراً بنسبة ${savingPercentVsHighest}% مقارنة بالمنافسين وهو توقيت ممتاز لتخزين أو شراء كمية تكفي الأسبوع.`;
    shouldBuyNow = true;
    bestTimeBuy = 'مناسب للشراء خلال عروض هذا الأسبوع';
  } else if (overallScore >= 6.0) {
    grade = 'عرض معتدل ومناسب ⚖️';
    verdict = 'سعر معقول في حدود المتوسط السوقي، مناسب إن كنت بحاجة فورية للسلعة.';
    aiAdvice = `السعر الحالي عادل ومتوافق مع حركة السوق، لكنه ليس تخفيضاً نادراً. إذا لم تكن بحاجة ماسة للصنف، يمكنك انتظار إطلاق بروشور عروض الأربعاء أو أسبوع الراتب.`;
    shouldBuyNow = false;
    bestTimeBuy = 'يمكنك الانتظار لعروض الأربعاء القادمة';
  } else {
    grade = 'عرض عادي / خصم غير مؤثر ⚠️';
    verdict = 'تخفيض غير مجدٍ أو أن السلعة متوفرة بسعر أرخص بكثير في متجر منافس.';
    aiAdvice = `هذا العرض لا يقدم قيمة توفير كافية. ننصح بالتوجه إلى ${cheapestStoreName} بسعر ${cheapestPrice.toFixed(2)} ر.س أو تفعيل تنبيه هبوط السعر لنشعرك عندما يهبط السعر لأقل من ${historicalAvg.toFixed(2)} ر.س.`;
    shouldBuyNow = false;
    bestTimeBuy = 'تريّث، السعر مرشح للهبوط قريباً';
  }

  return {
    productId: product.id,
    productNameAr: product.nameAr,
    productImage: product.imageUrl,
    productUnit: product.unit,
    storeId,
    storeName: activeStore.name,
    storeLogo: activeStore.logo,
    dealPriceSar: dealPrice,
    overallScore,
    grade,
    verdict,
    aiAdvice,
    shouldBuyNow,
    bestTimeBuy,
    confidence: 96,
    historicalFactor: {
      score: Number(historicalScore.toFixed(1)),
      title: 'السعر التاريخي',
      description: historicalDesc,
      metric: diffFromAvgPercent <= 0 ? `${diffFromAvgPercent}% من المتوسط` : `+${diffFromAvgPercent}% من المتوسط`,
      isPositive: historicalPositive,
      historicalLowest,
      historicalAvg: Number(historicalAvg.toFixed(2)),
      historicalHighest,
      diffFromAvgPercent,
    },
    competitorFactor: {
      score: Number(competitorScore.toFixed(1)),
      title: 'سعر المنافسين',
      description: competitorDesc,
      metric: `المرتبة ${rank} من ${totalStores}`,
      isPositive: competitorPositive,
      cheapestStoreName,
      cheapestStorePrice: cheapestPrice,
      mostExpensiveStoreName,
      mostExpensivePrice,
      savingVsHighest,
      rank,
      totalStores,
    },
    couponFactor: {
      score: Number(couponScore.toFixed(1)),
      title: 'الكوبونات الإضافية',
      description: couponDesc,
      metric: storeCoupon ? `كود ${storeCoupon.code}` : 'بدون كود إضافي',
      isPositive: couponPositive,
      hasCoupon: Boolean(storeCoupon),
      couponCode: storeCoupon?.code,
      couponDiscountText,
      effectivePriceWithCoupon,
      minSpend: storeCoupon?.minSpend,
    },
    isAiGenerated: false,
  };
}
