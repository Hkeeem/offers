import { Store, Product, StoreRatingMetrics } from '../types.ts';

// تقييمات الأساس المرجعية للمتاجر السعودية الكبرى
export interface BaseStoreRatingConfig {
  storeId: string;
  defaultDeliverySpeedRating: number;
  defaultAvailabilityRating: number;
  deliveryTimeLabel: string;
  totalReviewsCount: number;
  highlightsAr: string[];
}

export const BASE_STORE_RATINGS: Record<string, BaseStoreRatingConfig> = {
  panda: {
    storeId: 'panda',
    defaultDeliverySpeedRating: 4.8,
    defaultAvailabilityRating: 4.8,
    deliveryTimeLabel: 'خلال ساعتين (تطبيق بنده كليك)',
    totalReviewsCount: 2450,
    highlightsAr: ['توصيل فوري خلال 120 دقيقة', 'توفر ممتاز لمنتجات الألبان والمخبوزات'],
  },
  othaim: {
    storeId: 'othaim',
    defaultDeliverySpeedRating: 4.5,
    defaultAvailabilityRating: 4.7,
    deliveryTimeLabel: 'نفس اليوم (توصيل عثيم أونلاين)',
    totalReviewsCount: 3120,
    highlightsAr: ['تغطية واسعة لكافة الأحياء', 'توفر مستمر للسلع التموينية والأرز والزيوت'],
  },
  danube: {
    storeId: 'danube',
    defaultDeliverySpeedRating: 4.7,
    defaultAvailabilityRating: 4.9,
    deliveryTimeLabel: 'خلال ساعتين إلى 3 ساعات',
    totalReviewsCount: 1890,
    highlightsAr: ['أعلى نسبة توفر للأصناف المستوردة والعضوية', 'تغليف وتبريد ممتاز أثناء النقل'],
  },
  carrefour: {
    storeId: 'carrefour',
    defaultDeliverySpeedRating: 4.5,
    defaultAvailabilityRating: 4.5,
    deliveryTimeLabel: 'خلال ساعتين (تطبيق كارفور)',
    totalReviewsCount: 1420,
    highlightsAr: ['توصيل سريع للطلبات المنزلية', 'عروض أسبوعية وتوفر جيد للمنظفات'],
  },
  amazon: {
    storeId: 'amazon',
    defaultDeliverySpeedRating: 4.9,
    defaultAvailabilityRating: 4.7,
    deliveryTimeLabel: 'توصيل اليوم التالي أو برايم مجاني',
    totalReviewsCount: 4500,
    highlightsAr: ['دقة عالية بمواعيد التسليم وسرعة الشحن', 'تتبع حي لشاحنة التوصيل'],
  },
  lulu: {
    storeId: 'lulu',
    defaultDeliverySpeedRating: 4.4,
    defaultAvailabilityRating: 4.6,
    deliveryTimeLabel: 'نفس اليوم (لولو إكسبرس)',
    totalReviewsCount: 1180,
    highlightsAr: ['تنوع في الأغذية الطازجة والمستوردة', 'خيارات توصيل مرنة'],
  },
};

const STORAGE_KEY = 'hakeem_store_user_ratings_v1';

export interface UserStoreRating {
  deliverySpeed: number; // 1-5
  availability: number; // 1-5
  comment?: string;
  updatedAt: string;
}

/**
 * جلب تقييمات المستخدم المخزنة محلياً
 */
export function getStoredUserRatings(): Record<string, UserStoreRating> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading store user ratings from localStorage:', err);
    return {};
  }
}

/**
 * حفظ تقييم المستخدم لمتجر محدد وتحديث المتوسط فوراً
 */
export function saveUserStoreRating(
  storeId: string,
  rating: { deliverySpeed: number; availability: number; comment?: string }
): StoreRatingMetrics {
  const allRatings = getStoredUserRatings();
  const userEntry: UserStoreRating = {
    deliverySpeed: rating.deliverySpeed,
    availability: rating.availability,
    comment: rating.comment || '',
    updatedAt: new Date().toISOString(),
  };

  allRatings[storeId] = userEntry;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRatings));
    // إرسال حدث لتحديث أي مكونات مشتركة
    window.dispatchEvent(new CustomEvent('store-ratings-updated', { detail: { storeId } }));
  } catch (err) {
    console.warn('Error saving store user rating to localStorage:', err);
  }

  return calculateStoreRatingMetrics(storeId, undefined, userEntry);
}

/**
 * حساب مقاييس التقييم لمتجر محدد اعتماداً على سرعة التوصيل وتوفر المنتجات
 */
export function calculateStoreRatingMetrics(
  storeId: string,
  products?: Product[],
  explicitUserRating?: UserStoreRating
): StoreRatingMetrics {
  const baseConfig = BASE_STORE_RATINGS[storeId] || {
    storeId,
    defaultDeliverySpeedRating: 4.5,
    defaultAvailabilityRating: 4.6,
    deliveryTimeLabel: 'توصيل متاح',
    totalReviewsCount: 500,
    highlightsAr: [],
  };

  const userRatings = explicitUserRating ? { [storeId]: explicitUserRating } : getStoredUserRatings();
  const userRating = userRatings[storeId];

  // 1. حساب تقييم توفر المنتجات:
  // إذا كانت المنتجات متوفرة، نقوم باحتساب النسبة الحقيقية للسلع المتوفرة في هذا المتجر
  let catalogAvailabilityRate = 0.95; // افتراضي
  let availabilityRating = baseConfig.defaultAvailabilityRating;

  if (products && products.length > 0) {
    let inStock = 0;
    let catalogCount = 0;

    products.forEach((prod) => {
      const priceInfo = prod.prices[storeId];
      if (priceInfo) {
        catalogCount++;
        if (priceInfo.inStock) {
          inStock++;
        }
      }
    });

    if (catalogCount > 0) {
      catalogAvailabilityRate = inStock / catalogCount;
      // معادلة تحويل نسبة التوفر إلى نقاط من 5 (مع ترجيح بين 3.8 و 5.0)
      const calculatedScore = 3.5 + catalogAvailabilityRate * 1.5;
      // دمج التقييم المرجعي مع التوفر الفعلي
      availabilityRating = Number(((baseConfig.defaultAvailabilityRating * 0.5) + (calculatedScore * 0.5)).toFixed(1));
    }
  }

  let deliverySpeedRating = baseConfig.defaultDeliverySpeedRating;
  let totalReviews = baseConfig.totalReviewsCount;

  // دمج تقييم المستخدم إذا قام بتقييم المتجر
  if (userRating) {
    totalReviews += 1;
    deliverySpeedRating = Number(((deliverySpeedRating * 0.85) + (userRating.deliverySpeed * 0.15)).toFixed(1));
    availabilityRating = Number(((availabilityRating * 0.85) + (userRating.availability * 0.15)).toFixed(1));
  }

  // 2. حساب متوسط التقييم = (تقييم سرعة التوصيل + تقييم توفر المنتجات) ÷ 2
  const averageRating = Number(((deliverySpeedRating + availabilityRating) / 2).toFixed(1));

  return {
    deliverySpeedRating,
    availabilityRating,
    averageRating,
    totalReviewsCount: totalReviews,
    deliverySpeedLabel: baseConfig.deliveryTimeLabel,
    availabilityPercentage: Math.round(catalogAvailabilityRate * 100),
    userRating,
  };
}

/**
 * دالة مساعدة لتلوين شارة التقييم
 */
export function getRatingColorClasses(rating: number) {
  if (rating >= 4.7) {
    return {
      bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
      badge: 'bg-emerald-600 text-white',
      star: 'text-amber-400 fill-amber-400',
      bar: 'bg-emerald-600',
    };
  }
  if (rating >= 4.4) {
    return {
      bg: 'bg-amber-500/10 text-amber-900 border-amber-300',
      badge: 'bg-amber-600 text-white',
      star: 'text-amber-400 fill-amber-400',
      bar: 'bg-amber-500',
    };
  }
  return {
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    badge: 'bg-slate-700 text-white',
    star: 'text-slate-400 fill-slate-400',
    bar: 'bg-slate-500',
  };
}
