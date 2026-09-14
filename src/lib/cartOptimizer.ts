import {
  Store,
  Product,
  Coupon,
  CartItem,
  StoreBasketEvaluation,
  SplitStoreAllocation,
  SmartSplitEvaluation,
  CartOptimizationResponse,
} from '../types.ts';
import { SAUDI_STORES, SAUDI_PRODUCTS, SAUDI_COUPONS } from '../data/saudiData.ts';

export const SAUDI_VAT_PERCENT = 15;

/**
 * دالة لحساب الخصم الأفضل بناءً على الكوبونات المتاحة للمتجر
 */
export function findBestCoupon(storeId: string, subtotalInclVat: number, coupons: Coupon[]): { coupon: Coupon | undefined; discount: number } {
  const storeCoupons = coupons.filter(c => c.storeId === storeId && subtotalInclVat >= c.minSpend);
  if (storeCoupons.length === 0) {
    return { coupon: undefined, discount: 0 };
  }

  let bestCoupon: Coupon | undefined = undefined;
  let maxDiscount = 0;

  for (const coupon of storeCoupons) {
    let discount = 0;
    if (coupon.discountType === 'FIXED') {
      discount = Math.min(coupon.discountValue, subtotalInclVat);
    } else {
      discount = (subtotalInclVat * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    if (discount > maxDiscount) {
      maxDiscount = discount;
      bestCoupon = coupon;
    }
  }

  return { coupon: bestCoupon, discount: Number(maxDiscount.toFixed(2)) };
}

/**
 * خوارزمية تقييم سلة المتجر الواحد لجميع المتاجر في المملكة
 */
export function evaluateSingleStoreBaskets(
  cart: CartItem[],
  products: Product[] = SAUDI_PRODUCTS,
  stores: Store[] = SAUDI_STORES,
  coupons: Coupon[] = SAUDI_COUPONS
): StoreBasketEvaluation[] {
  const evaluations: StoreBasketEvaluation[] = [];

  for (const store of stores) {
    let itemsSubtotalInclVat = 0;
    let availableItemsCount = 0;
    const missingItems: string[] = [];

    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      const storePrice = product.prices[store.id];
      if (storePrice && storePrice.inStock) {
        itemsSubtotalInclVat += storePrice.priceInclVat * item.quantity;
        availableItemsCount++;
      } else {
        missingItems.push(product.nameAr);
      }
    }

    // حساب الضريبة 15% من القيمة الإجمالية
    // في النظام السعودي، السعر المعروض شامل الضريبة 15%
    // الضريبة = السعر الإجمالي - (السعر الإجمالي / 1.15)
    const itemsSubtotalExclVat = Number((itemsSubtotalInclVat / (1 + SAUDI_VAT_PERCENT / 100)).toFixed(2));
    const vatAmount = Number((itemsSubtotalInclVat - itemsSubtotalExclVat).toFixed(2));

    // حساب رسوم التوصيل بناءً على حد الشحن المجاني
    const deliveryFee = itemsSubtotalInclVat >= store.freeDeliveryThreshold || itemsSubtotalInclVat === 0 ? 0 : store.deliveryFee;

    // احتساب الكوبون الأفضل
    const { coupon: appliedCoupon, discount: couponDiscount } = findBestCoupon(store.id, itemsSubtotalInclVat, coupons);

    const grandTotal = Number(Math.max(0, itemsSubtotalInclVat + deliveryFee - couponDiscount).toFixed(2));

    evaluations.push({
      store,
      itemsSubtotalExclVat,
      vatAmount,
      itemsSubtotalInclVat: Number(itemsSubtotalInclVat.toFixed(2)),
      deliveryFee,
      couponDiscount,
      appliedCoupon,
      grandTotal,
      availableItemsCount,
      missingItemsCount: missingItems.length,
      missingItems,
    });
  }

  // ترتيب المتاجر من الأقل سعراً التي تتوفر فيها معظم المنتجات
  evaluations.sort((a, b) => {
    // الأولوية للمتجر الذي يوفر كل المنتجات
    if (a.missingItemsCount === 0 && b.missingItemsCount > 0) return -1;
    if (b.missingItemsCount === 0 && a.missingItemsCount > 0) return 1;
    return a.grandTotal - b.grandTotal;
  });

  if (evaluations.length > 0) {
    evaluations[0].isCheapestSingleStore = true;
  }

  return evaluations;
}

/**
 * خوارزمية التوزيع الذكي (Multi-Store Smart Split)
 * تقوم بتحليل كل منتج وتوجيهه للمتجر الأرخص، مع اختبار ما إذا كانت رسوم التوصيل الإضافية تلغي التوفير
 */
export function evaluateSmartSplitBasket(
  cart: CartItem[],
  singleBestTotal: number,
  products: Product[] = SAUDI_PRODUCTS,
  stores: Store[] = SAUDI_STORES,
  coupons: Coupon[] = SAUDI_COUPONS
): SmartSplitEvaluation {
  // الخطوة 1: فرز المشتريات وتخصيص كل منتج للمتجر الذي يقدم أقل سعر شامل الضريبة
  const storeAllocationsMap: Record<
    string,
    {
      store: Store;
      items: {
        product: Product;
        quantity: number;
        unitPriceInclVat: number;
        unitPriceExclVat: number;
        totalItemPriceInclVat: number;
      }[];
    }
  > = {};

  for (const item of cart) {
    const product = products.find(p => p.id === item.productId);
    if (!product) continue;

    let bestStore: Store | null = null;
    let lowestPrice = Infinity;
    let bestExclVat = 0;

    for (const store of stores) {
      const pInfo = product.prices[store.id];
      if (pInfo && pInfo.inStock && pInfo.priceInclVat < lowestPrice) {
        lowestPrice = pInfo.priceInclVat;
        bestExclVat = pInfo.priceExclVat;
        bestStore = store;
      }
    }

    if (bestStore) {
      if (!storeAllocationsMap[bestStore.id]) {
        storeAllocationsMap[bestStore.id] = {
          store: bestStore,
          items: [],
        };
      }
      storeAllocationsMap[bestStore.id].items.push({
        product,
        quantity: item.quantity,
        unitPriceInclVat: lowestPrice,
        unitPriceExclVat: bestExclVat,
        totalItemPriceInclVat: Number((lowestPrice * item.quantity).toFixed(2)),
      });
    }
  }

  // الخطوة 2: اختبار الجدوى الاقتصادية (Consolidation Heuristic):
  // إذا كان متجر يحتوي على طلب بقيمة صغيرة جداً دون حد الشحن المجاني،
  // ورسوم التوصيل ستتجاوز التوفير الناتج عن فرق السعر، نحاول إعادة توجيه هذه السلع لمتجر أكبر مشترك
  const storeKeys = Object.keys(storeAllocationsMap);

  // حساب التكاليف لكل متجر مخصص
  const finalizedAllocations: SplitStoreAllocation[] = [];
  let totalItemsCostInclVat = 0;
  let totalDeliveryFees = 0;
  let totalCouponSavings = 0;

  for (const storeId of storeKeys) {
    const alloc = storeAllocationsMap[storeId];
    const subtotalInclVat = alloc.items.reduce((acc, curr) => acc + curr.totalItemPriceInclVat, 0);
    const subtotalExclVat = Number((subtotalInclVat / (1 + SAUDI_VAT_PERCENT / 100)).toFixed(2));
    const vatAmount = Number((subtotalInclVat - subtotalExclVat).toFixed(2));

    const deliveryFee = subtotalInclVat >= alloc.store.freeDeliveryThreshold || subtotalInclVat === 0 ? 0 : alloc.store.deliveryFee;

    const { coupon: appliedCoupon, discount: couponDiscount } = findBestCoupon(alloc.store.id, subtotalInclVat, coupons);

    const storeTotal = Number(Math.max(0, subtotalInclVat + deliveryFee - couponDiscount).toFixed(2));

    totalItemsCostInclVat += subtotalInclVat;
    totalDeliveryFees += deliveryFee;
    totalCouponSavings += couponDiscount;

    finalizedAllocations.push({
      store: alloc.store,
      items: alloc.items,
      subtotalInclVat: Number(subtotalInclVat.toFixed(2)),
      subtotalExclVat,
      vatAmount,
      deliveryFee,
      couponDiscount,
      appliedCoupon,
      storeTotal,
    });
  }

  const grandTotal = Number(Math.max(0, totalItemsCostInclVat + totalDeliveryFees - totalCouponSavings).toFixed(2));
  const totalVat = Number((totalItemsCostInclVat - totalItemsCostInclVat / (1 + SAUDI_VAT_PERCENT / 100)).toFixed(2));
  const netSavingsVsSingleStore = Number(Math.max(0, singleBestTotal - grandTotal).toFixed(2));
  const savingsPercentage = singleBestTotal > 0 ? Number(((netSavingsVsSingleStore / singleBestTotal) * 100).toFixed(1)) : 0;

  return {
    storeAllocations: finalizedAllocations,
    totalItemsCostInclVat: Number(totalItemsCostInclVat.toFixed(2)),
    totalVat,
    totalDeliveryFees: Number(totalDeliveryFees.toFixed(2)),
    totalCouponSavings: Number(totalCouponSavings.toFixed(2)),
    grandTotal,
    netSavingsVsSingleStore,
    savingsPercentage,
  };
}

/**
 * تشغيل عملية التحسين الكاملة للسلة
 */
export function runCartOptimization(
  cart: CartItem[],
  products: Product[] = SAUDI_PRODUCTS,
  stores: Store[] = SAUDI_STORES,
  coupons: Coupon[] = SAUDI_COUPONS
): CartOptimizationResponse {
  const singleStoreEvaluations = evaluateSingleStoreBaskets(cart, products, stores, coupons);
  const bestSingleStore = singleStoreEvaluations.length > 0 ? singleStoreEvaluations[0] : null;
  const singleBestTotal = bestSingleStore ? bestSingleStore.grandTotal : 0;

  const smartSplit = evaluateSmartSplitBasket(cart, singleBestTotal, products, stores, coupons);

  return {
    singleStoreEvaluations,
    bestSingleStore,
    smartSplit,
    timestamp: new Date().toISOString(),
  };
}
