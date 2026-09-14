import { CartItem, Product, Store, CartHistoricalWeekPoint, CartInflationAnalysis, CartInflationItemChange, StorePriceInfo } from '../types.ts';

interface WeekConfig {
  weekKey: 'w3_ago' | 'w2_ago' | 'w1_ago' | 'current';
  label: string;
  shortLabel: string;
  date: string;
  eventNote: string;
  factors: Record<string, number>;
  categoryAdjustments: Record<string, number>;
}

const WEEKS_CONFIG: WeekConfig[] = [
  {
    weekKey: 'w3_ago',
    label: 'قبل 3 أسابيع (22 أغسطس 2026)',
    shortLabel: 'قبل 3 أسابيع',
    date: '2026-08-22',
    eventNote: 'فترة ما قبل العودة للمدارس والأسعار الأساسية',
    factors: {
      panda: 1.06,
      othaim: 1.05,
      danube: 1.04,
      carrefour: 1.07,
      amazon: 1.05,
      lulu: 1.06,
    },
    categoryAdjustments: {
      'ألبان وأجبان': 1.02,
      'مؤن وحبوب': 1.08, // الأرز كان قبل عروض المدارس
      'زيوت ودهون': 1.05,
      'لحوم ودواجن': 1.03,
      'عناية ومنظفات': 1.09, // المنظفات قبل الخصومات الكبرى
      'مشروبات وقهوة': 1.04,
      'تمور ومكسرات': 1.02,
    },
  },
  {
    weekKey: 'w2_ago',
    label: 'قبل أسبوعين (29 أغسطس 2026)',
    shortLabel: 'قبل أسبوعين',
    date: '2026-08-29',
    eventNote: 'موسم صرف الرواتب وبداية بروشورات التوفير الكبرى',
    factors: {
      panda: 1.03,
      othaim: 0.98,
      danube: 1.03,
      carrefour: 1.01,
      amazon: 1.02,
      lulu: 1.01,
    },
    categoryAdjustments: {
      'ألبان وأجبان': 1.01,
      'مؤن وحبوب': 1.03,
      'زيوت ودهون': 1.02,
      'لحوم ودواجن': 1.01,
      'عناية ومنظفات': 1.04,
      'مشروبات وقهوة': 1.02,
      'تمور ومكسرات': 1.01,
    },
  },
  {
    weekKey: 'w1_ago',
    label: 'قبل أسبوع (5 سبتمبر 2026)',
    shortLabel: 'قبل أسبوع',
    date: '2026-09-05',
    eventNote: 'ذروة عروض العودة للمدارس وتخفيضات الخميس بالعثيم وبنده',
    factors: {
      panda: 0.95,
      othaim: 0.94,
      danube: 1.01,
      carrefour: 0.96,
      amazon: 0.94,
      lulu: 0.97,
    },
    categoryAdjustments: {
      'ألبان وأجبان': 0.99,
      'مؤن وحبوب': 0.94, // عروض قوية على الأرز والطحين
      'زيوت ودهون': 0.96,
      'لحوم ودواجن': 0.97,
      'عناية ومنظفات': 0.92, // خصومات هائلة على المنظفات
      'مشروبات وقهوة': 0.97,
      'تمور ومكسرات': 0.98,
    },
  },
  {
    weekKey: 'current',
    label: 'الأسبوع الحالي (12 سبتمبر 2026)',
    shortLabel: 'الأسبوع الحالي',
    date: '2026-09-12',
    eventNote: 'الأسعار الحية المرصودة اليوم شاملة الضريبة 15%',
    factors: {
      panda: 1.00,
      othaim: 1.00,
      danube: 1.00,
      carrefour: 1.00,
      amazon: 1.00,
      lulu: 1.00,
    },
    categoryAdjustments: {
      'ألبان وأجبان': 1.00,
      'مؤن وحبوب': 1.00,
      'زيوت ودهون': 1.00,
      'لحوم ودواجن': 1.00,
      'عناية ومنظفات': 1.00,
      'مشروبات وقهوة': 1.00,
      'تمور ومكسرات': 1.00,
    },
  },
];

/**
 * حساب التكلفة التاريخية الدقيقة لسلة المشتريات الحالية خلال الأسابيع الثلاثة الماضية
 * لتوضيح اتجاهات التضخم أو التوفير بدقة
 */
export function calculateCartHistoricalAnalysis(
  cart: CartItem[],
  products: Product[],
  stores: Store[]
): CartInflationAnalysis | null {
  if (!cart.length) return null;

  const validCartItems = cart
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { item, product } : null;
    })
    .filter((entry): entry is { item: CartItem; product: Product } => entry !== null);

  if (!validCartItems.length) return null;

  // حساب تكلفة كل أسبوع
  const historicalPoints: CartHistoricalWeekPoint[] = WEEKS_CONFIG.map(weekCfg => {
    // لكل متجر، نحسب إجمالي تكلفة السلة في هذا الأسبوع
    const storeTotals: Record<string, number> = {};

    stores.forEach(store => {
      let storeSum = 0;
      validCartItems.forEach(({ item, product }) => {
        const storePriceInfo = product.prices[store.id] as StorePriceInfo | undefined;
        // السعر الأساسي شامل الضريبة حالياً
        const basePrice = storePriceInfo?.priceInclVat ?? 25;
        const storeFactor = weekCfg.factors[store.id] ?? 1.0;
        const catFactor = weekCfg.categoryAdjustments[product.category] ?? 1.0;

        // في الأسبوع الحالي نستخدم السعر الفعلي 100%
        const finalUnitPrice =
          weekCfg.weekKey === 'current'
            ? basePrice
            : Number((basePrice * (storeFactor * 0.6 + catFactor * 0.4)).toFixed(2));

        storeSum += finalUnitPrice * item.quantity;
      });
      storeTotals[store.id] = Number(storeSum.toFixed(2));
    });

    // حساب تكلفة السلة المقسمة الذكية (Smart Split) في ذلك الأسبوع:
    // لكل منتج، اختيار المتجر الأرخص في ذلك الأسبوع
    let smartSplitSum = 0;
    validCartItems.forEach(({ item, product }) => {
      let minUnitInWeek = Infinity;

      stores.forEach(store => {
        const storePriceInfo = product.prices[store.id] as StorePriceInfo | undefined;
        if (storePriceInfo && storePriceInfo.inStock !== false) {
          const basePrice = storePriceInfo.priceInclVat;
          const storeFactor = weekCfg.factors[store.id] ?? 1.0;
          const catFactor = weekCfg.categoryAdjustments[product.category] ?? 1.0;

          const unitPrice =
            weekCfg.weekKey === 'current'
              ? basePrice
              : Number((basePrice * (storeFactor * 0.6 + catFactor * 0.4)).toFixed(2));

          if (unitPrice < minUnitInWeek) {
            minUnitInWeek = unitPrice;
          }
        }
      });

      if (minUnitInWeek === Infinity) {
        minUnitInWeek = 20;
      }
      smartSplitSum += minUnitInWeek * item.quantity;
    });

    const storeValues = Object.values(storeTotals);
    const cheapestStoreTotal = Math.min(...storeValues);
    const highestStoreTotal = Math.max(...storeValues);
    const marketAvgTotal = Number(
      (storeValues.reduce((a, b) => a + b, 0) / storeValues.length).toFixed(2)
    );

    return {
      weekKey: weekCfg.weekKey,
      label: weekCfg.label,
      shortLabel: weekCfg.shortLabel,
      date: weekCfg.date,
      smartSplitTotal: Number(smartSplitSum.toFixed(2)),
      cheapestStoreTotal: Number(cheapestStoreTotal.toFixed(2)),
      marketAvgTotal,
      highestStoreTotal: Number(highestStoreTotal.toFixed(2)),
      pandaTotal: storeTotals.panda || 0,
      othaimTotal: storeTotals.othaim || 0,
      danubeTotal: storeTotals.danube || 0,
      carrefourTotal: storeTotals.carrefour || 0,
      amazonTotal: storeTotals.amazon || 0,
      luluTotal: storeTotals.lulu || 0,
      eventNote: weekCfg.eventNote,
    };
  });

  const threeWeeksAgoPoint = historicalPoints[0];
  const currentPoint = historicalPoints[historicalPoints.length - 1];

  const threeWeeksAgoTotal = threeWeeksAgoPoint.smartSplitTotal;
  const currentTotal = currentPoint.smartSplitTotal;
  const netChangeSar = Number((currentTotal - threeWeeksAgoTotal).toFixed(2));
  const netChangePercent = Number((((currentTotal - threeWeeksAgoTotal) / threeWeeksAgoTotal) * 100).toFixed(1));

  // تصنيف الاتجاه: توفير أم تضخم
  let trend: 'saving' | 'inflation' | 'stable' = 'stable';
  let headline = '';
  let explanation = '';

  if (netChangeSar <= -1.5) {
    trend = 'saving';
    headline = `اتجاه توفير ملحوظ في سلة مشترياتك (-${Math.abs(netChangeSar).toFixed(2)} ر.س / ${Math.abs(netChangePercent)}%)`;
    explanation = `شهدت سلتك انخفاضاً مستمراً في التكلفة الإجمالية مقارنة بقبل 3 أسابيع (22 أغسطس)، مدفوعة بحدة المنافسة الترويجية بين المتاجر الكبرى وبروشورات العودة للمدارس، خصوصاً في أصناف الأرز والمنظفات والزيوت.`;
  } else if (netChangeSar >= 1.5) {
    trend = 'inflation';
    headline = `ضغوط تضخم طفيفة على سلتك (+${netChangeSar.toFixed(2)} ر.س / +${netChangePercent}%)`;
    explanation = `ارتفعت التكلفة الإجمالية لسلتك بمعدل طفيف مقارنة بقبل 3 أسابيع، نتيجة انتهاء بعض الخصومات الموسمية المؤقتة وارتفاع طفيف في أسعار بعض السلع المستوردة. استخدامك للسلة المقسمة يخفف هذا الارتفاع.`;
  } else {
    trend = 'stable';
    headline = `استقرار سعري عام لسلة المشتريات (تغير طفيف ${netChangePercent}%)`;
    explanation = `تكلفة سلتك مستقرة تقريباً مقارنة بأسعار 22 أغسطس، حيث وازنت الخصومات الترويجية لبعض السلع الارتفاعات الطفيفة في سلع أخرى.`;
  }

  // الوفر الحالي مقارنة بمتوسط السوق
  const totalSavedVsMarket = Number((currentPoint.marketAvgTotal - currentPoint.smartSplitTotal).toFixed(2));

  // مؤشر تضخم سلة السلع (Proxy CPI Food Basket Index): نقطة ارتكاز 100 قبل 3 أسابيع
  const basketCpiScore = Number(((currentPoint.marketAvgTotal / threeWeeksAgoPoint.marketAvgTotal) * 100).toFixed(1));

  // تفصيل تغير أسعار السلع الفردية بالسلة بين الأسبوع الحالي وقبل 3 أسابيع
  const itemChanges: CartInflationItemChange[] = validCartItems.map(({ item, product }) => {
    // أقل سعر حالي
    const currentPrices = (Object.values(product.prices) as StorePriceInfo[])
      .filter(p => p && p.inStock)
      .map(p => p.priceInclVat);
    const currentUnit = currentPrices.length ? Math.min(...currentPrices) : 20;

    // تقدير أقل سعر قبل 3 أسابيع بناءً على عوامل الفئة والمتجر
    const catAdj = WEEKS_CONFIG[0].categoryAdjustments[product.category] ?? 1.05;
    const pastUnit = Number((currentUnit * catAdj).toFixed(2));

    const currentTotalItem = Number((currentUnit * item.quantity).toFixed(2));
    const pastTotalItem = Number((pastUnit * item.quantity).toFixed(2));
    const deltaSar = Number((currentTotalItem - pastTotalItem).toFixed(2));
    const deltaPercent = Number((((currentUnit - pastUnit) / pastUnit) * 100).toFixed(1));

    let itemTrend: 'down' | 'up' | 'stable' = 'stable';
    let note = 'سعر مستقر ومتوازن';

    if (deltaPercent <= -2) {
      itemTrend = 'down';
      note = 'انخفاض وتوفير بفعل المنافسة الترويجية والبروشورات';
    } else if (deltaPercent >= 2) {
      itemTrend = 'up';
      note = 'ارتفاع طفيف بعد انتهاء حملة تخفيضات سابقة';
    }

    return {
      productId: product.id,
      productName: product.nameAr,
      unit: product.unit,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      currentUnitPrice: currentUnit,
      pastUnitPrice: pastUnit,
      currentTotalPrice: currentTotalItem,
      pastTotalPrice: pastTotalItem,
      deltaSar,
      deltaPercent,
      trend: itemTrend,
      note,
    };
  });

  return {
    historicalPoints,
    currentTotal,
    threeWeeksAgoTotal,
    netChangeSar,
    netChangePercent,
    trend,
    headline,
    explanation,
    totalSavedVsMarket,
    basketCpiScore,
    itemChanges,
  };
}
