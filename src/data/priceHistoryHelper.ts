import { PriceHistoryPoint, Product } from '../types.ts';

/**
 * دالة لتوليد سجل تاريخ أسعار مفصل وشامل خلال الشهر الحالي (سبتمبر)
 * يحاكي تتبع الأسعار اليومية/الأسبوعية في المتاجر السعودية (بنده، العثيم، الدانوب، كارفور، أمازون، لولو)
 * مع رصد مواعيد انطلاق البروشورات الترويجية ومواسم الرواتب
 */
export function generateMonthlyPriceHistory(product: Product): PriceHistoryPoint[] {
  // استخدام الأسعار الحالية كنقطة ارتكاز
  const pandaPrice = product.prices.panda?.priceInclVat || 20;
  const othaimPrice = product.prices.othaim?.priceInclVat || 19;
  const danubePrice = product.prices.danube?.priceInclVat || 22;
  const carrefourPrice = product.prices.carrefour?.priceInclVat || 20;
  const amazonPrice = product.prices.amazon?.priceInclVat || 21;
  const luluPrice = product.prices.lulu?.priceInclVat || 19.5;

  // تواريخ رصد حقيقية خلال الشهر الحالي (سبتمبر)
  // توضح هبوط الأسعار مع إطلاق عروض نهاية الأسبوع وبداية الشهر
  const daysData = [
    {
      date: '2026-09-01',
      day: '1 سبتمبر',
      factorPanda: 1.08,
      factorOthaim: 1.05,
      factorDanube: 1.04,
      factorCarrefour: 1.06,
      factorAmazon: 1.05,
      factorLulu: 1.07,
      event: 'مطلع الشهر والأسعار القياسية',
    },
    {
      date: '2026-09-03',
      day: '3 سبتمبر',
      factorPanda: 1.05,
      factorOthaim: 0.95, // انطلاق عروض نهاية الأسبوع للعثيم
      factorDanube: 1.02,
      factorCarrefour: 1.00,
      factorAmazon: 1.02,
      factorLulu: 1.02,
      event: 'عروض الخميس الأسبوعية - العثيم',
    },
    {
      date: '2026-09-05',
      day: '5 سبتمبر',
      factorPanda: 1.00,
      factorOthaim: 0.94,
      factorDanube: 1.02,
      factorCarrefour: 0.96,
      factorAmazon: 0.98,
      factorLulu: 1.00,
      event: undefined,
    },
    {
      date: '2026-09-07',
      day: '7 سبتمبر',
      factorPanda: 0.94, // مهرجان بنده الترويجي
      factorOthaim: 0.96,
      factorDanube: 1.01,
      factorCarrefour: 0.95,
      factorAmazon: 0.97,
      factorLulu: 0.98,
      event: 'مهرجان التوفير - بنده كليك',
    },
    {
      date: '2026-09-09',
      day: '9 سبتمبر',
      factorPanda: 0.92,
      factorOthaim: 0.98,
      factorDanube: 0.98,
      factorCarrefour: 0.93, // عروض منتصف الشهر
      factorAmazon: 0.95,
      factorLulu: 0.96,
      event: 'عروض كارفور والعودة للمدارس',
    },
    {
      date: '2026-09-11',
      day: '11 سبتمبر',
      factorPanda: 0.95,
      factorOthaim: 0.93,
      factorDanube: 0.97,
      factorCarrefour: 0.95,
      factorAmazon: 0.92, // خصومات أمازون برايم
      factorLulu: 0.95,
      event: 'خصومات برايم أمازون للأغذية',
    },
    {
      date: '2026-09-12',
      day: '12 سبتمبر (اليوم)',
      factorPanda: 1.00,
      factorOthaim: 1.00,
      factorDanube: 1.00,
      factorCarrefour: 1.00,
      factorAmazon: 1.00,
      factorLulu: 1.00,
      event: 'السعر المرصود حالياً',
    },
  ];

  return daysData.map(d => {
    const pPanda = Number((pandaPrice * d.factorPanda).toFixed(2));
    const pOthaim = Number((othaimPrice * d.factorOthaim).toFixed(2));
    const pDanube = Number((danubePrice * d.factorDanube).toFixed(2));
    const pCarrefour = Number((carrefourPrice * d.factorCarrefour).toFixed(2));
    const pAmazon = Number((amazonPrice * d.factorAmazon).toFixed(2));
    const pLulu = Number((luluPrice * d.factorLulu).toFixed(2));

    const allPrices = [pPanda, pOthaim, pDanube, pCarrefour, pAmazon, pLulu];
    const lowest = Math.min(...allPrices);
    const highest = Math.max(...allPrices);
    const avg = Number((allPrices.reduce((a, b) => a + b, 0) / allPrices.length).toFixed(2));

    return {
      date: d.date,
      day: d.day,
      panda: pPanda,
      othaim: pOthaim,
      danube: pDanube,
      carrefour: pCarrefour,
      amazon: pAmazon,
      lulu: pLulu,
      lowestPrice: lowest,
      highestPrice: highest,
      avgPrice: avg,
      event: d.event,
    };
  });
}
