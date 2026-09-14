export interface StoreRatingMetrics {
  deliverySpeedRating: number; // تقييم سرعة التوصيل من 5 (مثلاً 4.7)
  availabilityRating: number; // تقييم توفر المنتجات من 5 (مثلاً 4.8)
  averageRating: number; // متوسط التقييم = (سرعة التوصيل + توفر المنتجات) / 2
  totalReviewsCount?: number;
  deliverySpeedLabel?: string; // مثلاً "خلال ساعتين (تطبيق بنده كليك)"
  availabilityPercentage?: number; // نسبة توفر السلع (مثلاً 96%)
  userRating?: {
    deliverySpeed: number;
    availability: number;
    comment?: string;
    updatedAt: string;
  };
}

export type StoreCategoryId = 'all' | 'hypermarket' | 'small_retail' | 'pharmacy' | 'ecommerce';

export interface StoreCategoryConfig {
  id: StoreCategoryId;
  labelAr: string;
  labelEn: string;
  icon: string;
  descriptionAr: string;
}

export interface Store {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  brandColor: string;
  category?: 'hypermarket' | 'small_retail' | 'pharmacy' | 'ecommerce';
  categoryNameAr?: string;
  deliveryFee: number; // SAR
  freeDeliveryThreshold: number; // SAR
  minimumOrder: number; // SAR
  deliveryTime: string;
  rating: number;
  deliverySpeedRating?: number;
  availabilityRating?: number;
  averageRating?: number;
  ratingMetrics?: StoreRatingMetrics;
  branchesCount: number;
  supportedCities: string[];
}

export interface StorePriceInfo {
  priceExclVat: number;
  priceInclVat: number;
  inStock: boolean;
  isPromo?: boolean;
  originalPrice?: number;
}

export interface PriceHistoryPoint {
  date: string; // e.g. "1 سبتمبر" or "2026-09-01"
  day: string; // e.g. "1 سبتمبر"
  avgPrice: number;
  lowestPrice: number;
  highestPrice: number;
  panda?: number;
  othaim?: number;
  danube?: number;
  carrefour?: number;
  amazon?: number;
  lulu?: number;
  event?: string; // e.g. "تخفيضات نهاية الأسبوع", "عرض العودة للمدارس"
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  unit: string;
  barcode: string;
  imageUrl: string;
  prices: Record<string, StorePriceInfo>;
  tags: string[];
  priceHistory?: PriceHistoryPoint[];
}

export interface Coupon {
  id: string;
  code: string;
  storeId: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number; // e.g. 15 for 15% or 20 for 20 SAR
  maxDiscount?: number; // for percentage
  minSpend: number;
  validUntil: string;
  description: string;
  verified: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface StoreBasketEvaluation {
  store: Store;
  itemsSubtotalExclVat: number;
  vatAmount: number; // 15% VAT
  itemsSubtotalInclVat: number;
  deliveryFee: number;
  couponDiscount: number;
  appliedCoupon?: Coupon;
  grandTotal: number;
  availableItemsCount: number;
  missingItemsCount: number;
  missingItems: string[];
  isCheapestSingleStore?: boolean;
}

export interface SplitStoreAllocation {
  store: Store;
  items: {
    product: Product;
    quantity: number;
    unitPriceInclVat: number;
    unitPriceExclVat: number;
    totalItemPriceInclVat: number;
  }[];
  subtotalInclVat: number;
  subtotalExclVat: number;
  vatAmount: number;
  deliveryFee: number;
  couponDiscount: number;
  appliedCoupon?: Coupon;
  storeTotal: number;
}

export interface SmartSplitEvaluation {
  storeAllocations: SplitStoreAllocation[];
  totalItemsCostInclVat: number;
  totalVat: number;
  totalDeliveryFees: number;
  totalCouponSavings: number;
  grandTotal: number;
  netSavingsVsSingleStore: number;
  savingsPercentage: number;
}

export interface AiOptimizationInsight {
  summary: string;
  recommendationPlan: string;
  substitutions: {
    currentProduct: string;
    alternativeProduct: string;
    storeName: string;
    potentialSavingsSar: number;
    reason: string;
  }[];
  timingTip: string;
  vatNotice: string;
}

export interface CartOptimizationResponse {
  singleStoreEvaluations: StoreBasketEvaluation[];
  bestSingleStore: StoreBasketEvaluation | null;
  smartSplit: SmartSplitEvaluation;
  aiInsights?: AiOptimizationInsight;
  timestamp: string;
}

export interface CartHistoricalWeekPoint {
  weekKey: 'w3_ago' | 'w2_ago' | 'w1_ago' | 'current';
  label: string;
  shortLabel: string;
  date: string;
  smartSplitTotal: number;
  cheapestStoreTotal: number;
  marketAvgTotal: number;
  highestStoreTotal: number;
  pandaTotal: number;
  othaimTotal: number;
  danubeTotal: number;
  carrefourTotal: number;
  amazonTotal: number;
  luluTotal: number;
  eventNote?: string;
}

export interface CartInflationItemChange {
  productId: string;
  productName: string;
  unit: string;
  imageUrl: string;
  quantity: number;
  currentUnitPrice: number;
  pastUnitPrice: number;
  currentTotalPrice: number;
  pastTotalPrice: number;
  deltaSar: number;
  deltaPercent: number;
  trend: 'down' | 'up' | 'stable';
  note: string;
}

export interface CartInflationAnalysis {
  historicalPoints: CartHistoricalWeekPoint[];
  currentTotal: number;
  threeWeeksAgoTotal: number;
  netChangeSar: number;
  netChangePercent: number;
  trend: 'saving' | 'inflation' | 'stable';
  headline: string;
  explanation: string;
  totalSavedVsMarket: number;
  basketCpiScore: number;
  itemChanges: CartInflationItemChange[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  category: string;
  source: 'cart' | 'favorite' | 'custom';
  targetPriceSar: number;
  initialPriceSar: number;
  currentLowestPriceSar: number;
  lowestStoreId: string;
  lowestStoreName: string;
  enabled: boolean;
  createdAt: string;
  triggeredAt?: string;
  isTriggered: boolean;
}

export interface PriceAlertNotification {
  id: string;
  alertId?: string;
  productId: string;
  productName: string;
  productImage: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  oldPriceSar: number;
  newPriceSar: number;
  savingSar: number;
  savingPercent: number;
  timestamp: string;
  isRead: boolean;
  source: 'cart' | 'favorite' | 'custom';
  message: string;
}

export interface SavedCartItemRecord {
  productId: string;
  quantity: number;
  savedUnitPriceSar: number;
  savedTotalPriceSar: number;
  savedStoreId?: string;
  savedStoreName?: string;
}

export interface SavedCartSnapshot {
  id: string;
  title: string;
  savedAt: string; // ISO date string
  dateLabel: string; // e.g. "1 سبتمبر 2026"
  note?: string;
  items: SavedCartItemRecord[];
  totalCostSar: number;
  itemCount: number;
  bestStoreName?: string;
}

export interface CartItemComparison {
  productId: string;
  productName: string;
  unit: string;
  category: string;
  imageUrl: string;
  currentQuantity: number;
  savedQuantity: number;
  currentUnitPrice: number;
  savedUnitPrice: number;
  currentTotalPrice: number;
  savedTotalPrice: number;
  unitPriceDeltaSar: number;
  unitPriceDeltaPercent: number;
  totalPriceDeltaSar: number;
  trend: 'down' | 'up' | 'stable' | 'new' | 'removed';
  bestCurrentStoreName: string;
  savedStoreName: string;
  changeNote: string;
}

export interface CartComparisonResult {
  savedCart: SavedCartSnapshot;
  currentTotalCost: number;
  savedTotalCost: number;
  costDeltaSar: number;
  costDeltaPercent: number;
  overallTrend: 'cheaper' | 'more_expensive' | 'identical';
  itemsCount: {
    total: number;
    cheaper: number;
    moreExpensive: number;
    stable: number;
    newItems: number;
    removedItems: number;
  };
  itemComparisons: CartItemComparison[];
  topSavingsItem?: CartItemComparison;
  topPriceIncreaseItem?: CartItemComparison;
}

// ==================== أنواع القائمة السريعة (Quick List) ====================
export interface QuickListMatchedItem {
  id: string;
  rawInputText: string;
  detectedQuantity: number;
  matchedProduct: Product | null;
  matchConfidence: 'exact' | 'high' | 'partial' | 'unmatched';
  alternativeMatches: Product[];
  bestStore?: Store;
  lowestPriceSar?: number;
  totalCostSar?: number;
  potentialSavingsSar?: number;
  isInCart: boolean;
}

// ==================== أنواع بوتات حكيم الآلية (Smart Bots) ====================
export type BotType = 'cars' | 'real_estate' | 'offers' | 'coupons';

export interface CarDeal {
  id: string;
  agencyName: string;
  agencyLogo: string;
  carModel: string;
  carYear: number;
  category: 'سيدان' | 'عائلية SUV' | 'بيك أب' | 'فارهة' | 'كهربائية / هايبرد';
  dealType: 'تقسيط 50/50' | 'بدون دفعة أولى' | 'استرجاع نقدي' | 'خصم كاش' | 'صيانة مجانية';
  cashPriceSar: number;
  discountedPriceSar: number;
  monthlyInstallmentSar?: number;
  profitRate: string;
  features: string[];
  badgeText: string;
  validUntil: string;
  linkText: string;
  city: string;
}

export interface RealEstateDeal {
  id: string;
  title: string;
  propertyType: 'شقة للإيجار' | 'شقة للبيع' | 'فيلا للبيع' | 'دور مستقل' | 'أرض سكنية';
  city: string;
  district: string;
  priceSar: number;
  pricePeriod?: 'سنوي' | 'شهري' | 'إجمالي';
  areaSqm: number;
  roomsCount?: number;
  bathroomsCount?: number;
  falLicenseNumber: string;
  dealHighlight: string;
  isNegotiable: boolean;
  postedAt: string;
  sourcePlatform: 'منصة إيجار' | 'الهيئة العامة للعقار' | 'عقار' | 'سهم العقارية';
}

export interface MarketOfferDeal {
  id: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  productName: string;
  category: string;
  originalPriceSar: number;
  offerPriceSar: number;
  discountPercentage: number;
  offerType: 'خصم أسبوعي' | 'عرض 1+1' | 'مهرجان الطازج' | 'تخفيضات نهاية الشهر';
  validUntil: string;
  branches: string;
  isHot: boolean;
}

export interface VerifiedCouponDeal {
  id: string;
  storeName: string;
  storeCategory: 'تطبيقات توصيل' | 'سوبرماركت' | 'إلكترونيات' | 'أزياء' | 'صيدليات';
  couponCode: string;
  discountSummary: string;
  minSpendSar?: number;
  maxDiscountSar?: number;
  verifiedAt: string;
  successRate: number;
  exclusiveText?: string;
  storeLogo: string;
}

export interface BotMetadata {
  id: BotType;
  name: string;
  title: string;
  description: string;
  scheduleTime: string; // e.g. "1:00 ظهراً" or "2:00 ظهراً"
  cronTimeDescription: string;
  avatarIcon: string;
  badgeColor: string;
  status: 'نشط ويعمل' | 'قيد الفحص' | 'مكتمل التحديث';
  lastRunTime: string;
  nextRunTime: string;
  dealsFoundCount: number;
  accentGradient: string;
}

// واجهات البحث بالصور وتحليل Google Cloud Vision
export interface VisionAnalysisDetails {
  provider: 'google_cloud_vision' | 'gemini_multimodal' | 'hybrid';
  labels: { description: string; score: number }[];
  detectedText: string;
  detectedLogos: string[];
  detectedObjects: string[];
  webEntities?: string[];
  executionTimeMs: number;
}

export interface StorePriceComparisonItem {
  storeId: string;
  storeName: string;
  storeLogo: string;
  brandColor: string;
  priceInclVat: number;
  priceExclVat: number;
  inStock: boolean;
  isPromo?: boolean;
  originalPrice?: number;
  isCheapest: boolean;
  differenceFromCheapestSar: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryTime: string;
}

export interface MatchedProductPriceAnalysis {
  product: Product;
  confidenceScore: number; // 0 - 100
  matchReason: string;
  lowestPriceSar: number;
  highestPriceSar: number;
  cheapestStore: Store;
  savingsVsHighestSar: number;
  savingsPercentage: number;
  storePrices: StorePriceComparisonItem[];
  healthyAlternatives?: {
    id: string;
    nameAr: string;
    badge: string;
    reason: string;
    lowestPriceSar: number;
    priceDifferenceSar: number;
  }[];
}

export interface ImageSearchResponse {
  success: boolean;
  identifiedProduct: MatchedProductPriceAnalysis | null;
  alternativeMatches: MatchedProductPriceAnalysis[];
  visionDetails: VisionAnalysisDetails;
  message?: string;
  searchTimestamp: string;
}

// واجهات مقياس قوة العرض (Deal Score Engine & Components)
export interface DealScoreFactor {
  score: number; // 1 to 10
  title: string;
  description: string;
  metric: string;
  isPositive: boolean;
}

export interface DealScoreResult {
  productId: string;
  productNameAr: string;
  productImage: string;
  productUnit: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  dealPriceSar: number;
  overallScore: number; // 1 to 10
  grade: string;
  verdict: string;
  aiAdvice: string;
  shouldBuyNow: boolean;
  bestTimeBuy: string;
  confidence: number;
  historicalFactor: DealScoreFactor & {
    historicalLowest: number;
    historicalAvg: number;
    historicalHighest: number;
    diffFromAvgPercent: number;
  };
  competitorFactor: DealScoreFactor & {
    cheapestStoreName: string;
    cheapestStorePrice: number;
    mostExpensiveStoreName: string;
    mostExpensivePrice: number;
    savingVsHighest: number;
    rank: number;
    totalStores: number;
  };
  couponFactor: DealScoreFactor & {
    hasCoupon: boolean;
    couponCode?: string;
    couponDiscountText?: string;
    effectivePriceWithCoupon?: number;
    minSpend?: number;
  };
  isAiGenerated?: boolean;
}

export interface OptimalShoppingSlot {
  id: string;
  storeId: string;
  storeName: string;
  logo: string;
  branchName: string;
  address: string;
  city: string;
  dayName: string; // e.g. "اليوم (الاثنين)" or "غداً (الثلاثاء)"
  dateStr: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "11:30"
  startHour: number;
  endHour: number;
  type: 'golden' | 'quiet_night' | 'fresh_stock' | 'avoid_peak';
  title: string;
  badgeLabel: string;
  busynessPercentage: number; // 0-100
  crowdLevel: 'very_low' | 'low' | 'moderate' | 'high';
  description: string;
  perks: string[];
}

export interface StoreScheduleInfo {
  storeId: string;
  storeName: string;
  logo: string;
  openHours: string;
  openHour24: number;
  closeHour24: number;
  is24Hours?: boolean;
  quietHoursMorning: string;
  quietHoursEvening: string;
  peakHoursToAvoid: string;
  freshStockTime: string;
  hourlyBusynessWeekday: number[]; // 24 values for hours 00:00 to 23:00 (percentages 0-100)
  hourlyBusynessWeekend: number[]; // 24 values for hours 00:00 to 23:00 (percentages 0-100)
  tips: string[];
}
