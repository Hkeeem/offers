import { Product, Store, CartItem } from '../types.ts';

export type HealthBenefitType =
  | 'LESS_SUGAR'
  | 'NATURAL_INGREDIENTS'
  | 'LOW_FAT'
  | 'ORGANIC'
  | 'WHOLE_GRAIN'
  | 'HIGH_FIBER';

export interface HealthyAlternative {
  id: string;
  originalProductId: string;
  nameAr: string;
  nameEn: string;
  category: string;
  unit: string;
  imageUrl: string;
  healthBenefitType: HealthBenefitType;
  healthBadgeText: string;
  summaryReason: string;
  nutritionalHighlights: string[];
  prices: Product['prices'];
  tags: string[];
}

// البدائل الصحية المصنفة بحسب المنتجات الأساسية
export const HEALTHY_ALTERNATIVES_DATA: HealthyAlternative[] = [
  // بدائل السكر (p5 - سكر الأسرة) -> سكر أقل 0% ومكونات طبيعية
  {
    id: 'p_health_sugar_stevia',
    originalProductId: 'p5',
    nameAr: 'محلي ستيفيا العضوي النباتي النقي (100 ظرف)',
    nameEn: 'Organic Pure Stevia Natural Sweetener 100s',
    category: 'مؤن وحبوب',
    unit: 'علبة 100 ظرف (200 جم)',
    imageUrl: '🌿',
    healthBenefitType: 'LESS_SUGAR',
    healthBadgeText: 'سكر أقل 0% خالي من السعرات والمكررات',
    summaryReason: 'بديل مثالي للسكر الأبيض مأخوذ من أوراق نبات الستيفيا بدون رفع مستويات السكر في الدم',
    nutritionalHighlights: [
      '0% سكر أبيض مكرر وصفر سعرات حرارية',
      'مستخلص نباتي طبيعي 100% غير معدل وراثياً',
      'مؤشر جلايسيمي صفر مناسب لمرضى السكري وحميات الكيتو وتخفيف الوزن',
    ],
    prices: {
      panda: { priceExclVat: 16.52, priceInclVat: 19.00, inStock: true, isPromo: true, originalPrice: 24.00 },
      othaim: { priceExclVat: 15.65, priceInclVat: 18.00, inStock: true },
      danube: { priceExclVat: 18.26, priceInclVat: 21.00, inStock: true },
      carrefour: { priceExclVat: 16.09, priceInclVat: 18.50, inStock: true },
      amazon: { priceExclVat: 14.78, priceInclVat: 17.00, inStock: true },
      lulu: { priceExclVat: 16.52, priceInclVat: 19.00, inStock: true },
    },
    tags: ['ستيفيا', 'سكر دايت', 'بديل سكر', 'صحي', 'طبيعي'],
  },
  {
    id: 'p_health_sugar_brown',
    originalProductId: 'p5',
    nameAr: 'سكر قصب خام طبيعي بني غير مكرر (1 كجم)',
    nameEn: 'Unrefined Natural Raw Cane Sugar 1kg',
    category: 'مؤن وحبوب',
    unit: 'كيس 1 كجم',
    imageUrl: '🌾',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'مكونات طبيعية غير مكررة وغنية بالمعادن',
    summaryReason: 'قصب سكر طبيعي خام يحتفظ بدبس السكر الطبيعي والمعادن دون تبييض كيميائي',
    nutritionalHighlights: [
      'مكونات طبيعية 100% غير خاضعة لعمليات التبييض الكيميائي',
      'يحتوي على معادن طبيعية (بوتاسيوم، مغنيسيوم، وحديد)',
      'حلاوة مركزة تعطي نكهة ممتازة بكمية استخدام أقل',
    ],
    prices: {
      panda: { priceExclVat: 12.17, priceInclVat: 14.00, inStock: true },
      othaim: { priceExclVat: 11.30, priceInclVat: 13.00, inStock: true, isPromo: true, originalPrice: 16.00 },
      danube: { priceExclVat: 13.91, priceInclVat: 16.00, inStock: true },
      carrefour: { priceExclVat: 12.17, priceInclVat: 14.00, inStock: true },
      amazon: { priceExclVat: 12.61, priceInclVat: 14.50, inStock: true },
      lulu: { priceExclVat: 11.74, priceInclVat: 13.50, inStock: true },
    },
    tags: ['سكر بني', 'قصب طبيعي', 'غير مكرر', 'صحي'],
  },
  {
    id: 'p_health_honey_sidr',
    originalProductId: 'p5',
    nameAr: 'عسل سدر طبيعي بري أصلي نقي (500 جم)',
    nameEn: 'Pure Natural Wild Sidr Honey 500g',
    category: 'مؤن وحبوب',
    unit: 'مرطبان 500 جم',
    imageUrl: '🍯',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'مكونات طبيعية 100% بديل للسكر الأبيض',
    summaryReason: 'عسل نقي خام يعد أفضل محلي طبيعي علاجي وغني بالإنزيمات ومضادات الأكسدة',
    nutritionalHighlights: [
      'طبيعي 100% خام غير مبستر بدون إضافات سكرية',
      'معزز للمناعة ومضاد طبيعي للبكتيريا والالتهابات',
      'مصدر طاقة نقي سهل الهضم وسريع الامتصاص',
    ],
    prices: {
      panda: { priceExclVat: 33.04, priceInclVat: 38.00, inStock: true, isPromo: true, originalPrice: 48.00 },
      othaim: { priceExclVat: 30.43, priceInclVat: 35.00, inStock: true },
      danube: { priceExclVat: 36.52, priceInclVat: 42.00, inStock: true },
      carrefour: { priceExclVat: 32.17, priceInclVat: 37.00, inStock: true },
      amazon: { priceExclVat: 31.30, priceInclVat: 36.00, inStock: true },
      lulu: { priceExclVat: 32.61, priceInclVat: 37.50, inStock: true },
    },
    tags: ['عسل', 'سدر', 'طبيعي', 'محلي صحي'],
  },

  // بدائل الحليب (p1 - حليب المراعي كامل الدسم) -> دهون أقل / خالي من السكر المضاف
  {
    id: 'p_health_milk_lowfat',
    originalProductId: 'p1',
    nameAr: 'حليب ندى قليل الدسم مدعّم بالفيتامينات (2 لتر)',
    nameEn: 'Nada Low Fat Milk Fortified 2L',
    category: 'ألبان وأجبان',
    unit: 'عبوة 2 لتر',
    imageUrl: '🥛',
    healthBenefitType: 'LOW_FAT',
    healthBadgeText: 'دهون أقل 50% وسعرات خفيفة',
    summaryReason: 'يمنحك كامل الكالسيوم والبروتين مع نصف كمية الدهون المشبعة والسعرات',
    nutritionalHighlights: [
      'دهون مشبعة أقل بنسبة 50% مقارنة بكامل الدسم',
      'سعرات حرارية أقل 35% لصحة القلب والأوعية',
      'مدعّم بفيتامين د3 وفيتامين أ والكالسيوم الحيوي',
    ],
    prices: {
      panda: { priceExclVat: 9.57, priceInclVat: 11.00, inStock: true, isPromo: true, originalPrice: 12.00 },
      othaim: { priceExclVat: 9.13, priceInclVat: 10.50, inStock: true },
      danube: { priceExclVat: 10.43, priceInclVat: 12.00, inStock: true },
      carrefour: { priceExclVat: 9.57, priceInclVat: 11.00, inStock: true },
      amazon: { priceExclVat: 10.00, priceInclVat: 11.50, inStock: true },
      lulu: { priceExclVat: 9.35, priceInclVat: 10.75, inStock: true },
    },
    tags: ['حليب قليل الدسم', 'ندى', 'صحي', 'ألبان'],
  },
  {
    id: 'p_health_milk_oat',
    originalProductId: 'p1',
    nameAr: 'حليب شوفان عضوي نقي بدون سكر مضاف (1 لتر)',
    nameEn: 'Organic Oat Milk Unsweetened 1L',
    category: 'ألبان وأجبان',
    unit: 'عبوة 1 لتر',
    imageUrl: '🥣',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'مكونات طبيعية 100% نباتي بدون سكر مضاف',
    summaryReason: 'مستخلص من الشوفان الكامل العضوي، خالي من الكوليسترول واللاكتوز ومناسب للهضم الخفيف',
    nutritionalHighlights: [
      'بدون سكر مضاف وبدون مواد حافظة أو نكهات صناعية',
      'خالي من اللاكتوز والجلوتين والكوليسترول بنسبة 100%',
      'غني بألياف البيتا جلوكان الطبيعية المفيدة لخفض الكوليسترول',
    ],
    prices: {
      panda: { priceExclVat: 12.61, priceInclVat: 14.50, inStock: true },
      othaim: { priceExclVat: 11.74, priceInclVat: 13.50, inStock: true },
      danube: { priceExclVat: 13.91, priceInclVat: 16.00, inStock: true },
      carrefour: { priceExclVat: 12.17, priceInclVat: 14.00, inStock: true, isPromo: true, originalPrice: 17.00 },
      amazon: { priceExclVat: 11.30, priceInclVat: 13.00, inStock: true },
      lulu: { priceExclVat: 12.17, priceInclVat: 14.00, inStock: true },
    },
    tags: ['حليب شوفان', 'نباتي', 'عضوي', 'بدون سكر'],
  },

  // بدائل الزيت (p3 - زيت ذرة عافية) -> زيت زيتون معصور على البارد / زيت أفوكادو
  {
    id: 'p_health_oil_olive',
    originalProductId: 'p3',
    nameAr: 'زيت زيتون الجوف بكر ممتاز معصور على البارد (1 لتر)',
    nameEn: 'Al Jouf Extra Virgin Olive Oil Cold Pressed 1L',
    category: 'زيوت ودهون',
    unit: 'قارورة 1 لتر',
    imageUrl: '🫒',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'مكونات طبيعية 100% معصور على البارد',
    summaryReason: 'زيت زيتون وطني بكر ممتاز معصور على البارد غني بمضادات الأكسدة والدهون الأحادية الصحية',
    nutritionalHighlights: [
      'عصرة أولى على البارد بدون معالجة كيميائية أو حرارية',
      'غني بالدهون الأحادية غير المشبعة الصحية للقلب (أوميغا 9)',
      'حموضة أقل من 0.8% غني بمادة البوليفينول المضادة للالتهاب',
    ],
    prices: {
      panda: { priceExclVat: 24.35, priceInclVat: 28.00, inStock: true, isPromo: true, originalPrice: 34.00 },
      othaim: { priceExclVat: 23.48, priceInclVat: 27.00, inStock: true },
      danube: { priceExclVat: 26.96, priceInclVat: 31.00, inStock: true },
      carrefour: { priceExclVat: 24.00, priceInclVat: 27.50, inStock: true },
      amazon: { priceExclVat: 22.61, priceInclVat: 26.00, inStock: true },
      lulu: { priceExclVat: 23.91, priceInclVat: 27.50, inStock: true },
    },
    tags: ['زيت زيتون', 'بكر ممتاز', 'الجوف', 'صحي'],
  },
  {
    id: 'p_health_oil_avocado',
    originalProductId: 'p3',
    nameAr: 'زيت أفوكادو نقي للطبخ عالي التحمل (500 مل)',
    nameEn: 'Pure Avocado Cooking Oil 500ml',
    category: 'زيوت ودهون',
    unit: 'قارورة 500 مل',
    imageUrl: '🥑',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'نباتي طبيعي خالي من الدهون المتحولة',
    summaryReason: 'نقطة تدخين مرتفعة جداً (270°م) تمنع أكسدة الزيت وتكوّن المركبات المسرطنة أثناء الطهي',
    nutritionalHighlights: [
      'أعلى نقطة تدخين بين الزيوت الطبيعية تجعل الطبخ والقلي آمناً وصحياً',
      'غني بفيتامين E ومضادات الأكسدة النباتية الطبيعية',
      'خالي من الزيوت المكررة والمواد الحافظة',
    ],
    prices: {
      panda: { priceExclVat: 27.83, priceInclVat: 32.00, inStock: true },
      othaim: { priceExclVat: 26.96, priceInclVat: 31.00, inStock: true },
      danube: { priceExclVat: 29.57, priceInclVat: 34.00, inStock: true },
      carrefour: { priceExclVat: 27.39, priceInclVat: 31.50, inStock: true, isPromo: true, originalPrice: 38.00 },
      amazon: { priceExclVat: 25.65, priceInclVat: 29.50, inStock: true },
      lulu: { priceExclVat: 26.52, priceInclVat: 30.50, inStock: true },
    },
    tags: ['زيت أفوكادو', 'طبخ صحي', 'طبيعي'],
  },

  // بدائل الأرز (p2 - أرز الشعلان سيلا بسمتي) -> حبوب كاملة / ألياف أعلى
  {
    id: 'p_health_rice_brown',
    originalProductId: 'p2',
    nameAr: 'أرز بني كامل الحبة عالي الألياف (2 كجم)',
    nameEn: 'Whole Grain Brown Basmati Rice 2kg',
    category: 'مؤن وحبوب',
    unit: 'كيس 2 كجم',
    imageUrl: '🌾',
    healthBenefitType: 'WHOLE_GRAIN',
    healthBadgeText: 'حبوب كاملة وألياف أعلى 3 أضعاف',
    summaryReason: 'أرز حبة كاملة بقشرته الطبيعية يمنحك امتصاصاً بطيئاً للنشويات وشبعاً طويلاً',
    nutritionalHighlights: [
      '3 أضعاف كمية الألياف مقارنة بالأرز الأبيض المكرر',
      'مؤشر جلايسيمي منخفض يحافظ على توازن سكر الدم والطاقة المستدامة',
      'غني بمضادات الأكسدة وفيتامينات ب المركبة والمغنيسيوم',
    ],
    prices: {
      panda: { priceExclVat: 16.52, priceInclVat: 19.00, inStock: true },
      othaim: { priceExclVat: 15.22, priceInclVat: 17.50, inStock: true, isPromo: true, originalPrice: 22.00 },
      danube: { priceExclVat: 17.83, priceInclVat: 20.50, inStock: true },
      carrefour: { priceExclVat: 15.65, priceInclVat: 18.00, inStock: true },
      amazon: { priceExclVat: 14.78, priceInclVat: 17.00, inStock: true },
      lulu: { priceExclVat: 15.22, priceInclVat: 17.50, inStock: true },
    },
    tags: ['أرز بني', 'حبوب كاملة', 'ألياف', 'صحي'],
  },
  {
    id: 'p_health_quinoa',
    originalProductId: 'p2',
    nameAr: 'كينوا عضوية فاخرة ثلاثية الألوان (500 جم)',
    nameEn: 'Organic Tri-Color Quinoa 500g',
    category: 'مؤن وحبوب',
    unit: 'عبوة 500 جم',
    imageUrl: '🥗',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'بروتين نباتي كامل وخالي من الجلوتين',
    summaryReason: 'سوبرفود طبيعي يحتوي على جميع الأحماض الأمينية الأساسية التسعة كبديل مثالي للأرز',
    nutritionalHighlights: [
      'بروتين نباتي كامل (14 جم بروتين لكل 100 جم)',
      'خالية تماماً من الجلوتين وسهلة الهضم',
      'غنية بالحديد والمغنيسيوم ومضادات الأكسدة كيرسيتين',
    ],
    prices: {
      panda: { priceExclVat: 19.13, priceInclVat: 22.00, inStock: true, isPromo: true, originalPrice: 28.00 },
      othaim: { priceExclVat: 18.26, priceInclVat: 21.00, inStock: true },
      danube: { priceExclVat: 21.74, priceInclVat: 25.00, inStock: true },
      carrefour: { priceExclVat: 18.70, priceInclVat: 21.50, inStock: true },
      amazon: { priceExclVat: 17.39, priceInclVat: 20.00, inStock: true },
      lulu: { priceExclVat: 18.26, priceInclVat: 21.00, inStock: true },
    },
    tags: ['كينوا', 'عضوي', 'خالي جلوتين', 'بروتين'],
  },

  // بدائل الدجاج (p6 - دجاج التنمية مبرد) -> صدور فيليه قليلة الدهون / دجاج عضوي
  {
    id: 'p_health_chicken_breast',
    originalProductId: 'p6',
    nameAr: 'صدور دجاج فيليه طازجة بدون جلد وعظم (900 جم)',
    nameEn: 'Fresh Skinless Boneless Chicken Breast Fillet 900g',
    category: 'لحوم ودواجن',
    unit: 'طبق 900 جم',
    imageUrl: '🍗',
    healthBenefitType: 'LOW_FAT',
    healthBadgeText: 'دهون أقل 70% وبروتين صافي أعلى',
    summaryReason: 'لحم صدر صافي بدون جلد يقلل الدهون المشبعة إلى أدنى حد ويوفر بروتيناً نقياً',
    nutritionalHighlights: [
      'أقل دهون مشبعة بنسبة 70% مقارنة بالدجاجة الكاملة بالعظم والجلد',
      '24 جم بروتين نقي لكل 100 جم لبناء العضلات وخفض الكوليسترول',
      'مبرد طازج يومياً بدون إضافات أو محاليل ملحية زائدة',
    ],
    prices: {
      panda: { priceExclVat: 20.87, priceInclVat: 24.00, inStock: true, isPromo: true, originalPrice: 28.00 },
      othaim: { priceExclVat: 19.57, priceInclVat: 22.50, inStock: true },
      danube: { priceExclVat: 22.61, priceInclVat: 26.00, inStock: true },
      carrefour: { priceExclVat: 20.00, priceInclVat: 23.00, inStock: true },
      amazon: { priceExclVat: 21.74, priceInclVat: 25.00, inStock: false },
      lulu: { priceExclVat: 19.57, priceInclVat: 22.50, inStock: true },
    },
    tags: ['صدور دجاج', 'فيليه', 'قليل الدهون', 'بروتين'],
  },
  {
    id: 'p_health_chicken_organic',
    originalProductId: 'p6',
    nameAr: 'دجاج نباتي التغذية 100% بدون مضادات حيوية (1000 جم)',
    nameEn: '100% Vegetarian Fed Antibiotic-Free Chicken 1000g',
    category: 'لحوم ودواجن',
    unit: 'حبة 1 كجم',
    imageUrl: '🐔',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'مكونات وتغذية نباتية طبيعية 100%',
    summaryReason: 'دجاج مزارع حرة يتغذى على حبوب نباتية نقية خالي تماماً من الهرمونات والمضادات',
    nutritionalHighlights: [
      'تغذية نباتية 100% بدون أي مساحيق أو مشتقات حيوانية',
      'خالي تماماً من المضادات الحيوية ومسرعات النمو الكيميائية',
      'طعم طبيعي أنقى وأقل قابلية لتراكم الدهون الحشوية',
    ],
    prices: {
      panda: { priceExclVat: 17.39, priceInclVat: 20.00, inStock: true },
      othaim: { priceExclVat: 16.52, priceInclVat: 19.00, inStock: true, isPromo: true, originalPrice: 23.00 },
      danube: { priceExclVat: 19.13, priceInclVat: 22.00, inStock: true },
      carrefour: { priceExclVat: 16.96, priceInclVat: 19.50, inStock: true },
      amazon: { priceExclVat: 18.26, priceInclVat: 21.00, inStock: false },
      lulu: { priceExclVat: 16.96, priceInclVat: 19.50, inStock: true },
    },
    tags: ['دجاج نباتي', 'بدون مضادات', 'طبيعي'],
  },

  // بدائل البيض (p4 - بيض الوطنية) -> بيض مزارع حرة أوميغا 3
  {
    id: 'p_health_eggs_omega',
    originalProductId: 'p4',
    nameAr: 'بيض عضوي مزارع حرة مدعّم بأوميغا 3 (طبق 15 بيضة)',
    nameEn: 'Free Range Organic Omega-3 Enriched Eggs 15s',
    category: 'ألبان وأجبان',
    unit: 'طبق 15 بيضة',
    imageUrl: '🥚',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'مزارع عضوية حرة غني بأوميغا 3 طبيعي',
    summaryReason: 'دجاج طليق في مزارع مفتوحة يتغذى على بذور الكتان وأعشاب طبيعية غنية بأوميغا 3',
    nutritionalHighlights: [
      'ضعف كمية أحماض أوميغا 3 المفيدة للذاكرة وصحة الشرايين',
      'صفار بيض غني بمضادات الأكسدة الطبيعية (لوتين وزياكسانثين)',
      'تغذية عضوية 100% خالية من الكيماويات والمبيدات',
    ],
    prices: {
      panda: { priceExclVat: 14.78, priceInclVat: 17.00, inStock: true },
      othaim: { priceExclVat: 13.91, priceInclVat: 16.00, inStock: true, isPromo: true, originalPrice: 19.50 },
      danube: { priceExclVat: 16.52, priceInclVat: 19.00, inStock: true },
      carrefour: { priceExclVat: 14.35, priceInclVat: 16.50, inStock: true },
      amazon: { priceExclVat: 15.22, priceInclVat: 17.50, inStock: false },
      lulu: { priceExclVat: 13.91, priceInclVat: 16.00, inStock: true },
    },
    tags: ['بيض عضوي', 'أوميغا 3', 'مزارع حرة'],
  },

  // بدائل الشاي (p8 - شاي ربيع) -> شاي أخضر عضوي / بابونج بدون كافيين
  {
    id: 'p_health_tea_green',
    originalProductId: 'p8',
    nameAr: 'شاي أخضر عضوي نقي بمضادات الأكسدة (100 كيس)',
    nameEn: 'Pure Organic Green Tea Antioxidant 100 Bags',
    category: 'مشروبات وقهوة',
    unit: 'علبة 100 كيس',
    imageUrl: '🍵',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'مضادات أكسدة طبيعية EGCG وكافيين معتدل',
    summaryReason: 'أوراق شاي أخضر غير مخمرة تحتفظ بمضادات الأكسدة القوية وتحفز حرق الدهون الطبيعي',
    nutritionalHighlights: [
      'غني بمركبات EGCG التي ترفع معدل الأيض اليومي وتدعم القلب',
      'كافيين طبيعي معتدل يمنح يقظة هادئة دون توتر أو تسارع نبضات',
      'عضوي 100% بدون إضافات عطرية صناعية',
    ],
    prices: {
      panda: { priceExclVat: 14.78, priceInclVat: 17.00, inStock: true, isPromo: true, originalPrice: 21.00 },
      othaim: { priceExclVat: 13.91, priceInclVat: 16.00, inStock: true },
      danube: { priceExclVat: 16.09, priceInclVat: 18.50, inStock: true },
      carrefour: { priceExclVat: 14.35, priceInclVat: 16.50, inStock: true },
      amazon: { priceExclVat: 13.48, priceInclVat: 15.50, inStock: true },
      lulu: { priceExclVat: 14.35, priceInclVat: 16.50, inStock: true },
    },
    tags: ['شاي أخضر', 'عضوي', 'مضادات أكسدة'],
  },
  {
    id: 'p_health_tea_chamomile',
    originalProductId: 'p8',
    nameAr: 'أزهار بابونج طبيعية عضوية خالية من الكافيين (50 كيس)',
    nameEn: 'Pure Organic Chamomile Herbal Tea 50 Bags',
    category: 'مشروبات وقهوة',
    unit: 'علبة 50 كيس',
    imageUrl: '🌼',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'أعشاب طبيعية 100% خالية من الكافيين',
    summaryReason: 'أزهار بابونج طبيعية مهدئة للجهاز الهضمي وتساعد على النوم العميق والاسترخاء',
    nutritionalHighlights: [
      '0% كافيين ومناسبة للشرب المسائي قبل النوم',
      'مهدئ طبيعي للتقلصات المعوية والانتفاخات',
      'نباتي عضوي 100% بدون منكهات أو ملونات',
    ],
    prices: {
      panda: { priceExclVat: 13.04, priceInclVat: 15.00, inStock: true },
      othaim: { priceExclVat: 12.17, priceInclVat: 14.00, inStock: true, isPromo: true, originalPrice: 18.00 },
      danube: { priceExclVat: 14.78, priceInclVat: 17.00, inStock: true },
      carrefour: { priceExclVat: 12.61, priceInclVat: 14.50, inStock: true },
      amazon: { priceExclVat: 12.17, priceInclVat: 14.00, inStock: true },
      lulu: { priceExclVat: 12.61, priceInclVat: 14.50, inStock: true },
    },
    tags: ['بابونج', 'أعشاب', 'بدون كافيين', 'طبيعي'],
  },

  // بدائل التمور (p9 - سكري القصيم) -> سكر أقل / مؤشر جلايسيمي منخفض
  {
    id: 'p_health_dates_ajwa',
    originalProductId: 'p9',
    nameAr: 'تمر عجوة المدينة العضوي الأصلي الفاخر (500 جم)',
    nameEn: 'Original Organic Madinah Ajwa Dates 500g',
    category: 'تمور ومكسرات',
    unit: 'علبة 500 جم',
    imageUrl: '🌴',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'أعلى قيمة غذائية ومضادات أكسدة طبيعية',
    summaryReason: 'عجوة المدينة المباركة تمتاز بتركيز عالٍ من البوليفينول والمعادن مع حلاوة معتدلة',
    nutritionalHighlights: [
      'مؤشر جلايسيمي منخفض لا يسبب قفزات مفاجئة في سكر الدم',
      'أعلى محتوى من مضادات الأكسدة بين كافة أصناف التمور',
      'غني بالمغنيسيوم والبوتاسيوم والحديد لدعم صحة القلب وضغط الدم',
    ],
    prices: {
      panda: { priceExclVat: 27.83, priceInclVat: 32.00, inStock: true, isPromo: true, originalPrice: 40.00 },
      othaim: { priceExclVat: 26.09, priceInclVat: 30.00, inStock: true },
      danube: { priceExclVat: 30.43, priceInclVat: 35.00, inStock: true },
      carrefour: { priceExclVat: 26.96, priceInclVat: 31.00, inStock: true },
      amazon: { priceExclVat: 27.39, priceInclVat: 31.50, inStock: true },
      lulu: { priceExclVat: 26.09, priceInclVat: 30.00, inStock: true },
    },
    tags: ['عجوة', 'عجوة المدينة', 'تمور عضوية', 'صحي'],
  },

  // بدائل المنظفات (p7 - أريال) -> مكونات نباتية طبيعية هيبوالرجينيك
  {
    id: 'p_health_detergent_eco',
    originalProductId: 'p7',
    nameAr: 'سائل غسيل عضوي إيكولوجي للبشرة الحساسة (3 لتر)',
    nameEn: 'Eco Organic Hypoallergenic Laundry Liquid 3L',
    category: 'عناية ومنظفات',
    unit: 'قارورة 3 لتر',
    imageUrl: '🌱',
    healthBenefitType: 'NATURAL_INGREDIENTS',
    healthBadgeText: 'مكونات نباتية طبيعية خالية من الفوسفات والعطور الكيميائية',
    summaryReason: 'منظف نباتي طبيعي 100% غير مسبب للحساسية وخالي من المواد المسرطنة والفوسفات',
    nutritionalHighlights: [
      'مكونات نباتية قابلة للتحلل الحيوي بدون فوسفات أو كبريتات صناعية',
      'خالي من المبيضات الضارة والعطور الكيميائية المسببة للحساسية الصدرية والجلدية',
      'آمن تماماً لملابس الرضع وأصحاب الأكزيما والبشرة الحساسة',
    ],
    prices: {
      panda: { priceExclVat: 39.13, priceInclVat: 45.00, inStock: true, isPromo: true, originalPrice: 55.00 },
      othaim: { priceExclVat: 38.26, priceInclVat: 44.00, inStock: true },
      danube: { priceExclVat: 43.48, priceInclVat: 50.00, inStock: true },
      carrefour: { priceExclVat: 39.13, priceInclVat: 45.00, inStock: true },
      amazon: { priceExclVat: 36.52, priceInclVat: 42.00, inStock: true },
      lulu: { priceExclVat: 38.26, priceInclVat: 44.00, inStock: true },
    },
    tags: ['منظف عضوي', 'هيبوالرجينيك', 'بدون فوسفات', 'صحي'],
  },
];

// دالة جلب البدائل الصحية لمنتج معين
export function getHealthyAlternativesForProduct(productId: string): HealthyAlternative[] {
  return HEALTHY_ALTERNATIVES_DATA.filter(alt => alt.originalProductId === productId);
}

// دالة تحويل البديل الصحي إلى منتج صالح للإضافة للسلة
export function convertHealthyAlternativeToProduct(alt: HealthyAlternative): Product {
  return {
    id: alt.id,
    nameAr: alt.nameAr,
    nameEn: alt.nameEn,
    category: alt.category,
    unit: alt.unit,
    barcode: `628${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    imageUrl: alt.imageUrl,
    prices: alt.prices,
    tags: alt.tags,
  };
}

// دالة حساب أقل سعر متوفر للبديل أو المنتج
export function getLowestPriceForProduct(productOrAlt: { prices: Product['prices'] }): {
  lowestPrice: number;
  lowestStoreId: string;
} {
  let lowest = Infinity;
  let storeId = 'othaim';

  Object.entries(productOrAlt.prices).forEach(([sid, info]) => {
    if (info && info.inStock && info.priceInclVat < lowest) {
      lowest = info.priceInclVat;
      storeId = sid;
    }
  });

  return {
    lowestPrice: lowest === Infinity ? 0 : lowest,
    lowestStoreId: storeId,
  };
}

// دالة حساب تأثير استبدال المنتج بالبديل الصحي على إجمالي سعر السلة
export interface HealthySwapImpact {
  isInCart: boolean;
  cartQuantity: number;
  currentProductPriceSar: number;
  alternativePriceSar: number;
  itemPriceDiffSar: number;
  currentCartTotalSar: number;
  newCartTotalSar: number;
  netCartDiffSar: number;
  percentageChange: number;
  isCheaperOverall: boolean;
}

export function calculateHealthySwapImpact(
  cart: CartItem[],
  products: Product[],
  currentProduct: Product,
  alternative: HealthyAlternative
): HealthySwapImpact {
  const currentCartItem = cart.find(c => c.productId === currentProduct.id);
  const isInCart = Boolean(currentCartItem);
  const cartQuantity = currentCartItem ? currentCartItem.quantity : 1;

  // أسعار الوحدات (أقل سعر متاح)
  const currentPriceInfo = getLowestPriceForProduct(currentProduct);
  const alternativePriceInfo = getLowestPriceForProduct(alternative);

  const currentProductPriceSar = currentPriceInfo.lowestPrice;
  const alternativePriceSar = alternativePriceInfo.lowestPrice;

  // فرق السعر بالوحدة
  const itemPriceDiffSar = parseFloat((alternativePriceSar - currentProductPriceSar).toFixed(2));

  // حساب سعر السلة الإجمالي الحالي
  let currentCartTotalSar = 0;
  cart.forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      const pInfo = getLowestPriceForProduct(prod);
      currentCartTotalSar += pInfo.lowestPrice * item.quantity;
    }
  });
  currentCartTotalSar = parseFloat(currentCartTotalSar.toFixed(2));

  // حساب سعر السلة الجديد بعد الاستبدال
  let newCartTotalSar = currentCartTotalSar;
  let netCartDiffSar = 0;

  if (isInCart) {
    // استبدال في السلة
    netCartDiffSar = parseFloat((itemPriceDiffSar * cartQuantity).toFixed(2));
    newCartTotalSar = parseFloat(Math.max(0, currentCartTotalSar + netCartDiffSar).toFixed(2));
  } else {
    // في حال لم يكن في السلة، نوضح التأثير في حال إضافة البديل بدلاً من المنتج الأصلي
    netCartDiffSar = parseFloat((alternativePriceSar * cartQuantity).toFixed(2));
    newCartTotalSar = parseFloat((currentCartTotalSar + netCartDiffSar).toFixed(2));
  }

  const percentageChange =
    currentCartTotalSar > 0
      ? parseFloat(((netCartDiffSar / currentCartTotalSar) * 100).toFixed(1))
      : 0;

  const isCheaperOverall = netCartDiffSar < 0;

  return {
    isInCart,
    cartQuantity,
    currentProductPriceSar,
    alternativePriceSar,
    itemPriceDiffSar,
    currentCartTotalSar,
    newCartTotalSar,
    netCartDiffSar,
    percentageChange,
    isCheaperOverall,
  };
}
