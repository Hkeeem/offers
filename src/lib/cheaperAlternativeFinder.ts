import { Product, Store, PriceAlertNotification, CartItem } from '../types.ts';
import { HEALTHY_ALTERNATIVES_DATA, HealthyAlternative } from '../data/healthyAlternativesData.ts';

export interface CheaperAlternativeOption {
  type: 'cheaper_store' | 'cheaper_brand' | 'healthy_alternative' | 'best_available';
  badgeTitle: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  productId: string;
  productName: string;
  productImage: string;
  unit?: string;
  storeId?: string;
  storeName: string;
  storeLogo: string;
  currentPriceSar: number;
  alternativePriceSar: number;
  savingsSar: number;
  savingsPercent: number;
  isHealthBenefit?: boolean;
  healthBenefitBadge?: string;
  healthSummary?: string;
  canSwapInCart: boolean;
}

export interface CheaperAlternativeAnalysis {
  product: Product | null;
  notification: PriceAlertNotification;
  isAbsoluteLowestPrice: boolean;
  lowestPriceAcrossStores: number;
  bestStoreForCurrentProduct: Store | null;
  options: CheaperAlternativeOption[];
  recommendedOption: CheaperAlternativeOption | null;
}

/**
 * يبحث عن البدائل الأرخص والمتاجر الأوفر لمنتج في إشعار التنبيه
 */
export function findCheaperAlternativesForNotification(
  notif: PriceAlertNotification,
  products: Product[],
  stores: Store[],
  cart: CartItem[] = []
): CheaperAlternativeAnalysis {
  const currentProduct = products.find((p) => p.id === notif.productId) || null;
  const currentPrice = notif.newPriceSar;
  const options: CheaperAlternativeOption[] = [];

  let lowestPriceAcrossStores = currentPrice;
  let bestStoreForCurrentProduct: Store | null = null;

  // 1. فحص هل هناك متجر آخر يبيع نفس السلعة بسعر أقل من سعر الإشعار
  if (currentProduct) {
    stores.forEach((store) => {
      const priceInfo = currentProduct.prices[store.id];
      if (priceInfo && priceInfo.inStock) {
        if (priceInfo.priceInclVat < lowestPriceAcrossStores) {
          lowestPriceAcrossStores = priceInfo.priceInclVat;
          bestStoreForCurrentProduct = store;
        }

        // إذا كان هناك متجر يبيع أرخص من سعر الإشعار بـ 0.20 ر.س على الأقل
        if (priceInfo.priceInclVat < currentPrice - 0.2) {
          const savings = currentPrice - priceInfo.priceInclVat;
          const savingsPct = (savings / currentPrice) * 100;

          options.push({
            type: 'cheaper_store',
            badgeTitle: 'متجر بديل أرخص لنفس السلعة',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            title: `متوفر بسعر أرخص في ${store.name}`,
            subtitle: `نفس المنتج تماماً متوفر في ${store.name} بسعر ${priceInfo.priceInclVat.toFixed(2)} ر.س`,
            productId: currentProduct.id,
            productName: currentProduct.nameAr,
            productImage: currentProduct.imageUrl,
            unit: currentProduct.unit,
            storeId: store.id,
            storeName: store.name,
            storeLogo: store.logo,
            currentPriceSar: currentPrice,
            alternativePriceSar: priceInfo.priceInclVat,
            savingsSar: savings,
            savingsPercent: savingsPct,
            canSwapInCart: false,
          });
        }
      }
    });
  }

  // 2. فحص البدائل الصحية من قاعدة البيانات الصحية
  const healthySubs = HEALTHY_ALTERNATIVES_DATA.filter(
    (h) => h.originalProductId === notif.productId
  );

  healthySubs.forEach((sub) => {
    // إيجاد أقل سعر للبديل الصحي عبر المتاجر
    let subLowestPrice = Infinity;
    let subBestStore: Store | null = null;

    stores.forEach((store) => {
      const pInfo = sub.prices[store.id];
      if (pInfo && pInfo.inStock && pInfo.priceInclVat < subLowestPrice) {
        subLowestPrice = pInfo.priceInclVat;
        subBestStore = store;
      }
    });

    if (subLowestPrice !== Infinity && subBestStore) {
      const savings = currentPrice - subLowestPrice;
      const savingsPct = currentPrice > 0 ? (savings / currentPrice) * 100 : 0;

      // نضيفه إذا كان أرخص أو مساوي أو بسعر قريب مع فائدة صحية
      options.push({
        type: 'healthy_alternative',
        badgeTitle: 'بديل صحي وطبيعي',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        title: sub.nameAr,
        subtitle: sub.summaryReason,
        productId: sub.id,
        productName: sub.nameAr,
        productImage: sub.imageUrl,
        unit: sub.unit,
        storeId: subBestStore.id,
        storeName: subBestStore.name,
        storeLogo: subBestStore.logo,
        currentPriceSar: currentPrice,
        alternativePriceSar: subLowestPrice,
        savingsSar: Math.max(0, savings),
        savingsPercent: Math.max(0, savingsPct),
        isHealthBenefit: true,
        healthBenefitBadge: sub.healthBadgeText,
        healthSummary: sub.summaryReason,
        canSwapInCart: true,
      });
    }
  });

  // 3. فحص منتجات أخرى من نفس الفئة في السوبرماركت أرخص سعراً
  if (currentProduct) {
    const categoryPeers = products.filter(
      (p) => p.category === currentProduct.category && p.id !== currentProduct.id
    );

    categoryPeers.forEach((peer) => {
      let peerLowestPrice = Infinity;
      let peerBestStore: Store | null = null;

      stores.forEach((store) => {
        const pInfo = peer.prices[store.id];
        if (pInfo && pInfo.inStock && pInfo.priceInclVat < peerLowestPrice) {
          peerLowestPrice = pInfo.priceInclVat;
          peerBestStore = store;
        }
      });

      if (peerLowestPrice < currentPrice - 0.5 && peerBestStore) {
        const savings = currentPrice - peerLowestPrice;
        const savingsPct = (savings / currentPrice) * 100;

        options.push({
          type: 'cheaper_brand',
          badgeTitle: 'علامة تجارية بديلة أوفر',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
          title: peer.nameAr,
          subtitle: `ماركة منافسة من فئة «${peer.category}» بأقل تكلفة في ${peerBestStore.name}`,
          productId: peer.id,
          productName: peer.nameAr,
          productImage: peer.imageUrl,
          unit: peer.unit,
          storeId: peerBestStore.id,
          storeName: peerBestStore.name,
          storeLogo: peerBestStore.logo,
          currentPriceSar: currentPrice,
          alternativePriceSar: peerLowestPrice,
          savingsSar: savings,
          savingsPercent: savingsPct,
          canSwapInCart: true,
        });
      }
    });
  }

  // فرز الخيارات بحسب مقدار التوفير الأكبر
  options.sort((a, b) => b.savingsSar - a.savingsSar);

  const isAbsoluteLowestPrice = options.length === 0 || options[0].savingsSar <= 0;

  // إذا لم نجد بديلاً أرخص (المنتج في الإشعار هو الأرخص مطلقاً)
  if (options.length === 0) {
    options.push({
      type: 'best_available',
      badgeTitle: 'أرخص سعر في المملكة 🇸🇦',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      title: notif.productName,
      subtitle: `سعر ${notif.storeName} (${currentPrice.toFixed(2)} ر.س) هو الأرخص على مستوى كافة المتاجر السعودية المنافسة دون منازع!`,
      productId: notif.productId,
      productName: notif.productName,
      productImage: notif.productImage,
      storeName: notif.storeName,
      storeLogo: notif.storeLogo,
      currentPriceSar: currentPrice,
      alternativePriceSar: currentPrice,
      savingsSar: notif.savingSar,
      savingsPercent: notif.savingPercent,
      canSwapInCart: false,
    });
  }

  return {
    product: currentProduct,
    notification: notif,
    isAbsoluteLowestPrice,
    lowestPriceAcrossStores,
    bestStoreForCurrentProduct,
    options,
    recommendedOption: options[0] || null,
  };
}
