import {
  CartItem,
  Product,
  Store,
  SavedCartSnapshot,
  SavedCartItemRecord,
  CartItemComparison,
  CartComparisonResult,
  StorePriceInfo,
} from '../types.ts';

const STORAGE_KEY = 'hakeem_saved_cart_snapshots_v1';

/**
 * سلال افتراضية سابقة محفوظة مسبقاً لعائلة سعودية للمقارنة الفورية
 */
const DEFAULT_PRELOADED_SNAPSHOTS: SavedCartSnapshot[] = [
  {
    id: 'snap-1-sept-2026',
    title: 'سلة مقاضي بداية الشهر (1 سبتمبر 2026)',
    savedAt: '2026-09-01T10:00:00.000Z',
    dateLabel: '1 سبتمبر 2026',
    note: 'سلة التموين والمؤن الأساسية المحفوظة مع بداية الشهر من أسواق العثيم وبنده',
    bestStoreName: 'أسواق العثيم',
    totalCostSar: 186.5,
    itemCount: 6,
    items: [
      {
        productId: 'p1', // حليب المراعي 2 لتر
        quantity: 2,
        savedUnitPriceSar: 12.5,
        savedTotalPriceSar: 25.0,
        savedStoreId: 'othaim',
        savedStoreName: 'أسواق العثيم',
      },
      {
        productId: 'p2', // أرز الشعلان 5 كجم
        quantity: 1,
        savedUnitPriceSar: 38.0,
        savedTotalPriceSar: 38.0,
        savedStoreId: 'panda',
        savedStoreName: 'بنده',
      },
      {
        productId: 'p3', // زيت عافية ذرة 1.5 لتر
        quantity: 2,
        savedUnitPriceSar: 22.0,
        savedTotalPriceSar: 44.0,
        savedStoreId: 'othaim',
        savedStoreName: 'أسواق العثيم',
      },
      {
        productId: 'p4', // طبق بيض الوطنية
        quantity: 1,
        savedUnitPriceSar: 18.0,
        savedTotalPriceSar: 18.0,
        savedStoreId: 'danube',
        savedStoreName: 'الدانوب',
      },
      {
        productId: 'p6', // دجاج التنمية مبرد 1000 جم
        quantity: 2,
        savedUnitPriceSar: 18.5,
        savedTotalPriceSar: 37.0,
        savedStoreId: 'carrefour',
        savedStoreName: 'كارفور',
      },
      {
        productId: 'p7', // مسحوق أريال مركز 5 كجم
        quantity: 1,
        savedUnitPriceSar: 58.0,
        savedTotalPriceSar: 58.0,
        savedStoreId: 'amazon',
        savedStoreName: 'أمازون السعودية',
      },
    ],
  },
  {
    id: 'snap-22-aug-2026',
    title: 'سلة عروض نهاية الأسبوع (22 أغسطس 2026)',
    savedAt: '2026-08-22T16:00:00.000Z',
    dateLabel: '22 أغسطس 2026',
    note: 'سلة المقاضي الصيفية قبل انطلاق عروض العودة للمدارس',
    bestStoreName: 'بنده',
    totalCostSar: 204.0,
    itemCount: 7,
    items: [
      {
        productId: 'p1',
        quantity: 2,
        savedUnitPriceSar: 13.0,
        savedTotalPriceSar: 26.0,
        savedStoreId: 'panda',
        savedStoreName: 'بنده',
      },
      {
        productId: 'p2',
        quantity: 1,
        savedUnitPriceSar: 41.0,
        savedTotalPriceSar: 41.0,
        savedStoreId: 'danube',
        savedStoreName: 'الدانوب',
      },
      {
        productId: 'p3',
        quantity: 2,
        savedUnitPriceSar: 23.5,
        savedTotalPriceSar: 47.0,
        savedStoreId: 'othaim',
        savedStoreName: 'أسواق العثيم',
      },
      {
        productId: 'p4',
        quantity: 2,
        savedUnitPriceSar: 18.5,
        savedTotalPriceSar: 37.0,
        savedStoreId: 'lulu',
        savedStoreName: 'لولو هايبرماركت',
      },
      {
        productId: 'p5', // سكر الأسرة 5 كجم
        quantity: 1,
        savedUnitPriceSar: 24.0,
        savedTotalPriceSar: 24.0,
        savedStoreId: 'panda',
        savedStoreName: 'بنده',
      },
      {
        productId: 'p6',
        quantity: 2,
        savedUnitPriceSar: 19.0,
        savedTotalPriceSar: 38.0,
        savedStoreId: 'carrefour',
        savedStoreName: 'كارفور',
      },
      {
        productId: 'p8', // شاي ربيع إكسبرس 100 كيس
        quantity: 1,
        savedUnitPriceSar: 16.5,
        savedTotalPriceSar: 16.5,
        savedStoreId: 'othaim',
        savedStoreName: 'أسواق العثيم',
      },
    ],
  },
  {
    id: 'snap-15-aug-2026',
    title: 'سلة الأساسيات اليومية السريعة (15 أغسطس 2026)',
    savedAt: '2026-08-15T09:15:00.000Z',
    dateLabel: '15 أغسطس 2026',
    note: 'مشتريات خفيفة سريعة للألبان والبيض والزيوت',
    bestStoreName: 'لولو هايبرماركت',
    totalCostSar: 79.5,
    itemCount: 4,
    items: [
      {
        productId: 'p1',
        quantity: 2,
        savedUnitPriceSar: 12.8,
        savedTotalPriceSar: 25.6,
        savedStoreId: 'lulu',
        savedStoreName: 'لولو هايبرماركت',
      },
      {
        productId: 'p3',
        quantity: 1,
        savedUnitPriceSar: 22.5,
        savedTotalPriceSar: 22.5,
        savedStoreId: 'othaim',
        savedStoreName: 'أسواق العثيم',
      },
      {
        productId: 'p4',
        quantity: 1,
        savedUnitPriceSar: 18.0,
        savedTotalPriceSar: 18.0,
        savedStoreId: 'panda',
        savedStoreName: 'بنده',
      },
      {
        productId: 'p5',
        quantity: 1,
        savedUnitPriceSar: 23.5,
        savedTotalPriceSar: 23.5,
        savedStoreId: 'danube',
        savedStoreName: 'الدانوب',
      },
    ],
  },
];

/**
 * جلب قائمة السلال المحفوظة من التخزين المحلي أو الإعداد الأولي
 */
export function getStoredSavedCarts(): SavedCartSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredSavedCarts(DEFAULT_PRELOADED_SNAPSHOTS);
      return DEFAULT_PRELOADED_SNAPSHOTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PRELOADED_SNAPSHOTS;
  } catch (_) {
    return DEFAULT_PRELOADED_SNAPSHOTS;
  }
}

/**
 * حفظ قائمة السلال المحفوظة في التخزين المحلي
 */
export function saveStoredSavedCarts(snapshots: SavedCartSnapshot[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch (_) {}
}

/**
 * استخراج أقل سعر حالي للمنتج بين المتاجر السعودية
 */
export function getProductLowestCurrentPrice(
  product: Product,
  stores: Store[]
): { lowestPrice: number; storeName: string; storeId: string } {
  let lowest = Infinity;
  let bestStoreName = 'بنده';
  let bestStoreId = 'panda';

  stores.forEach(store => {
    const pInfo = product.prices[store.id] as StorePriceInfo | undefined;
    if (pInfo && pInfo.inStock !== false && pInfo.priceInclVat < lowest) {
      lowest = pInfo.priceInclVat;
      bestStoreName = store.name;
      bestStoreId = store.id;
    }
  });

  if (lowest === Infinity) {
    lowest = 20.0;
  }

  return { lowestPrice: lowest, storeName: bestStoreName, storeId: bestStoreId };
}

/**
 * حفظ سلة التسوق الحالية كنسخة احتياطية جديدة في سجل المقارنة
 */
export function createNewCartSnapshot(
  title: string,
  cart: CartItem[],
  products: Product[],
  stores: Store[],
  note?: string
): SavedCartSnapshot {
  const items: SavedCartItemRecord[] = [];
  let totalCostSar = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;

    const { lowestPrice, storeName, storeId } = getProductLowestCurrentPrice(product, stores);
    const totalPrice = Number((lowestPrice * item.quantity).toFixed(2));
    totalCostSar += totalPrice;

    items.push({
      productId: item.productId,
      quantity: item.quantity,
      savedUnitPriceSar: lowestPrice,
      savedTotalPriceSar: totalPrice,
      savedStoreId: storeId,
      savedStoreName: storeName,
    });
  });

  const now = new Date();
  const dateLabel = now.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const newSnapshot: SavedCartSnapshot = {
    id: `snap-${Date.now()}`,
    title: title.trim() || `سلة محفوظة (${dateLabel})`,
    savedAt: now.toISOString(),
    dateLabel,
    note: note || 'سلة محفوظة من السلة الحالية مع كامل الأسعار اللحظية',
    bestStoreName: 'توزيع ذكي',
    totalCostSar: Number(totalCostSar.toFixed(2)),
    itemCount: items.length,
    items,
  };

  const existing = getStoredSavedCarts();
  const updated = [newSnapshot, ...existing];
  saveStoredSavedCarts(updated);

  return newSnapshot;
}

/**
 * حذف سلة محفوظة من السجل
 */
export function deleteSavedCartSnapshot(snapshotId: string): SavedCartSnapshot[] {
  const existing = getStoredSavedCarts();
  const updated = existing.filter(s => s.id !== snapshotId);
  saveStoredSavedCarts(updated);
  return updated;
}

/**
 * خوارزمية مقارنة السلة الحالية مع سلة سابقة تم حفظها:
 * تحسب الفروقات الإجمالية وتفاصيل السلع التي ارتفعت أو انخفضت
 */
export function compareCartWithSavedSnapshot(
  currentCart: CartItem[],
  savedCart: SavedCartSnapshot,
  products: Product[],
  stores: Store[]
): CartComparisonResult {
  const itemComparisons: CartItemComparison[] = [];

  // جمع جميع معرفات المنتجات الموجودة إما في السلة الحالية أو السلة السابقة
  const allProductIds = Array.from(
    new Set([
      ...currentCart.map(c => c.productId),
      ...savedCart.items.map(s => s.productId),
    ])
  );

  let currentTotalCalculated = 0;
  let savedTotalCalculated = 0;

  let cheaperCount = 0;
  let moreExpensiveCount = 0;
  let stableCount = 0;
  let newItemsCount = 0;
  let removedItemsCount = 0;

  allProductIds.forEach(pId => {
    const product = products.find(p => p.id === pId);
    if (!product) return;

    const currentCartItem = currentCart.find(c => c.productId === pId);
    const savedCartItem = savedCart.items.find(s => s.productId === pId);

    const { lowestPrice: currentLowestPrice, storeName: currentBestStore } =
      getProductLowestCurrentPrice(product, stores);

    const currentQty = currentCartItem ? currentCartItem.quantity : 0;
    const savedQty = savedCartItem ? savedCartItem.quantity : 0;

    const savedUnitPrice = savedCartItem ? savedCartItem.savedUnitPriceSar : currentLowestPrice;
    const currentUnitPrice = currentLowestPrice;

    const currentTotal = Number((currentUnitPrice * currentQty).toFixed(2));
    const savedTotal = savedCartItem
      ? savedCartItem.savedTotalPriceSar
      : Number((savedUnitPrice * savedQty).toFixed(2));

    currentTotalCalculated += currentTotal;
    savedTotalCalculated += savedTotal;

    const unitPriceDeltaSar = Number((currentUnitPrice - savedUnitPrice).toFixed(2));
    const unitPriceDeltaPercent =
      savedUnitPrice > 0
        ? Number((((currentUnitPrice - savedUnitPrice) / savedUnitPrice) * 100).toFixed(1))
        : 0;
    const totalPriceDeltaSar = Number((currentTotal - savedTotal).toFixed(2));

    let trend: 'down' | 'up' | 'stable' | 'new' | 'removed' = 'stable';
    let changeNote = 'السعر مستقر ومتطابق';

    if (currentQty > 0 && savedQty === 0) {
      trend = 'new';
      newItemsCount++;
      changeNote = 'صنف جديد تمت إضافته للسلة الحالية ولم يكن في السلة السابقة';
    } else if (currentQty === 0 && savedQty > 0) {
      trend = 'removed';
      removedItemsCount++;
      changeNote = 'صنف كان في السلة السابقة ومحذوف من السلة الحالية';
    } else if (unitPriceDeltaSar <= -0.5) {
      trend = 'down';
      cheaperCount++;
      changeNote = `انخفاض ممتاز في السعر بمقدار ${Math.abs(unitPriceDeltaSar).toFixed(2)} ر.س (${Math.abs(unitPriceDeltaPercent)}%) في ${currentBestStore}`;
    } else if (unitPriceDeltaSar >= 0.5) {
      trend = 'up';
      moreExpensiveCount++;
      changeNote = `ارتفاع في سعر الوحدة بمقدار +${unitPriceDeltaSar.toFixed(2)} ر.س (+${unitPriceDeltaPercent}%) مقارنة بالسابق`;
    } else {
      trend = 'stable';
      stableCount++;
      changeNote = 'السعر مستقر مع فارق لا يتجاوز نصف ريال';
    }

    itemComparisons.push({
      productId: product.id,
      productName: product.nameAr,
      unit: product.unit,
      category: product.category,
      imageUrl: product.imageUrl,
      currentQuantity: currentQty,
      savedQuantity: savedQty,
      currentUnitPrice,
      savedUnitPrice,
      currentTotalPrice: currentTotal,
      savedTotalPrice: savedTotal,
      unitPriceDeltaSar,
      unitPriceDeltaPercent,
      totalPriceDeltaSar,
      trend,
      bestCurrentStoreName: currentBestStore,
      savedStoreName: savedCartItem?.savedStoreName || 'متجر سابق',
      changeNote,
    });
  });

  // ترتيب المقارنات: السلع التي انخفضت أولاً ثم المرتفعة ثم المستقرة
  itemComparisons.sort((a, b) => {
    // الأولويات: down (-), up (+), stable
    const score = (t: string) => (t === 'down' ? 1 : t === 'up' ? 2 : t === 'new' ? 3 : 4);
    if (score(a.trend) !== score(b.trend)) {
      return score(a.trend) - score(b.trend);
    }
    return Math.abs(b.unitPriceDeltaSar) - Math.abs(a.unitPriceDeltaSar);
  });

  const costDeltaSar = Number((currentTotalCalculated - savedTotalCalculated).toFixed(2));
  const costDeltaPercent =
    savedTotalCalculated > 0
      ? Number((((currentTotalCalculated - savedTotalCalculated) / savedTotalCalculated) * 100).toFixed(1))
      : 0;

  let overallTrend: 'cheaper' | 'more_expensive' | 'identical' = 'identical';
  if (costDeltaSar <= -1.0) {
    overallTrend = 'cheaper';
  } else if (costDeltaSar >= 1.0) {
    overallTrend = 'more_expensive';
  }

  // تحديد أكبر سلعة حققت وفراً
  const topSavingsItem = itemComparisons.find(i => i.trend === 'down');
  // تحديد أكبر سلعة شهدت ارتفاعاً
  const topPriceIncreaseItem = itemComparisons.find(i => i.trend === 'up');

  return {
    savedCart,
    currentTotalCost: Number(currentTotalCalculated.toFixed(2)),
    savedTotalCost: Number(savedTotalCalculated.toFixed(2)),
    costDeltaSar,
    costDeltaPercent,
    overallTrend,
    itemsCount: {
      total: itemComparisons.length,
      cheaper: cheaperCount,
      moreExpensive: moreExpensiveCount,
      stable: stableCount,
      newItems: newItemsCount,
      removedItems: removedItemsCount,
    },
    itemComparisons,
    topSavingsItem,
    topPriceIncreaseItem,
  };
}
