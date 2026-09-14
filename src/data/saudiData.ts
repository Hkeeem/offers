import { Store, Product, Coupon, StoreCategoryConfig } from '../types.ts';
import { HEALTHY_ALTERNATIVES_DATA, convertHealthyAlternativeToProduct } from './healthyAlternativesData.ts';

export const SAUDI_VAT_RATE = 0.15; // 15% ضريبة القيمة المضافة السعودية

export const STORE_CATEGORIES_CONFIG: StoreCategoryConfig[] = [
  {
    id: 'all',
    labelAr: 'جميع المتاجر',
    labelEn: 'All Stores',
    icon: '🌟',
    descriptionAr: 'عرض كافة المتاجر، مراكز الهايبرماركت، الصيدليات، والمتاجر الإلكترونية بدون قيود',
  },
  {
    id: 'hypermarket',
    labelAr: 'هايبر ماركت',
    labelEn: 'Hypermarkets',
    icon: '🏬',
    descriptionAr: 'الأسواق المركزية الكبرى والشاملة لجميع السلع الغذائية والاستهلاكية (بنده، كارفور، لولو)',
  },
  {
    id: 'small_retail',
    labelAr: 'متاجر التجزئة الصغيرة',
    labelEn: 'Small Retail & Supermarkets',
    icon: '🛒',
    descriptionAr: 'سوبرماركت التجزئة والأحياء السكنية سريعة التسوق (العثيم، الدانوب، التميمي)',
  },
  {
    id: 'pharmacy',
    labelAr: 'صيدليات',
    labelEn: 'Pharmacies',
    icon: '💊',
    descriptionAr: 'الصيدليات ومنتجات العناية بالصحة والطفل والجمال ومستلزمات الأسرة (النهدي)',
  },
  {
    id: 'ecommerce',
    labelAr: 'متاجر إلكترونية',
    labelEn: 'E-commerce',
    icon: '📦',
    descriptionAr: 'منصات الشحن الإلكتروني السريع حتى باب المنزل (أمازون السعودية)',
  },
];

export const SAUDI_STORES: Store[] = [
  {
    id: 'panda',
    name: 'هايبر بنده',
    nameEn: 'Hyper Panda',
    category: 'hypermarket',
    categoryNameAr: 'هايبر ماركت',
    logo: '🐼',
    brandColor: '#008752',
    deliveryFee: 15,
    freeDeliveryThreshold: 150,
    minimumOrder: 50,
    deliveryTime: 'خلال ساعتين (تطبيق بنده كليك)',
    rating: 4.8,
    deliverySpeedRating: 4.8,
    availabilityRating: 4.8,
    averageRating: 4.8,
    branchesCount: 220,
    supportedCities: ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'الخبر', 'بريدة'],
  },
  {
    id: 'othaim',
    name: 'أسواق عبد الله العثيم',
    nameEn: 'Al Othaim Markets',
    category: 'small_retail',
    categoryNameAr: 'متاجر التجزئة الصغيرة',
    logo: '🛒',
    brandColor: '#e02b20',
    deliveryFee: 12,
    freeDeliveryThreshold: 120,
    minimumOrder: 40,
    deliveryTime: 'نفس اليوم (توصيل عثيم أونلاين)',
    rating: 4.6,
    deliverySpeedRating: 4.5,
    availabilityRating: 4.7,
    averageRating: 4.6,
    branchesCount: 300,
    supportedCities: ['الرياض', 'القصيم', 'جدة', 'الدمام', 'حائل', 'تبوك', 'الأحساء'],
  },
  {
    id: 'danube',
    name: 'الدانوب هايبرماركت',
    nameEn: 'Danube Supermarket',
    category: 'small_retail',
    categoryNameAr: 'متاجر التجزئة الصغيرة',
    logo: '🍇',
    brandColor: '#7b1c3e',
    deliveryFee: 18,
    freeDeliveryThreshold: 200,
    minimumOrder: 60,
    deliveryTime: 'خلال ساعتين إلى 3 ساعات',
    rating: 4.8,
    deliverySpeedRating: 4.7,
    availabilityRating: 4.9,
    averageRating: 4.8,
    branchesCount: 85,
    supportedCities: ['الرياض', 'جدة', 'الخبر', 'الدمام', 'الظهران', 'مكة المكرمة'],
  },
  {
    id: 'carrefour',
    name: 'كارفور السعودية',
    nameEn: 'Carrefour KSA',
    category: 'hypermarket',
    categoryNameAr: 'هايبر ماركت',
    logo: '🏬',
    brandColor: '#0c5da5',
    deliveryFee: 14,
    freeDeliveryThreshold: 130,
    minimumOrder: 50,
    deliveryTime: 'خلال ساعتين (تطبيق كارفور)',
    rating: 4.5,
    deliverySpeedRating: 4.5,
    availabilityRating: 4.5,
    averageRating: 4.5,
    branchesCount: 60,
    supportedCities: ['الرياض', 'جدة', 'الدمام', 'الخبر'],
  },
  {
    id: 'amazon',
    name: 'أمازون السعودية',
    nameEn: 'Amazon.sa',
    category: 'ecommerce',
    categoryNameAr: 'متاجر إلكترونية',
    logo: '📦',
    brandColor: '#ff9900',
    deliveryFee: 16,
    freeDeliveryThreshold: 100,
    minimumOrder: 0,
    deliveryTime: 'توصيل اليوم التالي أو برايم مجاني',
    rating: 4.8,
    deliverySpeedRating: 4.9,
    availabilityRating: 4.7,
    averageRating: 4.8,
    branchesCount: 15, // مستودعات شحن
    supportedCities: ['كافة مدن ومحافظات المملكة'],
  },
  {
    id: 'lulu',
    name: 'لولو هايبرماركت',
    nameEn: 'LuLu Hypermarket',
    category: 'hypermarket',
    categoryNameAr: 'هايبر ماركت',
    logo: '🛍️',
    brandColor: '#006837',
    deliveryFee: 15,
    freeDeliveryThreshold: 140,
    minimumOrder: 50,
    deliveryTime: 'نفس اليوم',
    rating: 4.5,
    deliverySpeedRating: 4.4,
    availabilityRating: 4.6,
    averageRating: 4.5,
    branchesCount: 45,
    supportedCities: ['الرياض', 'جدة', 'الدمام', 'الخبر', 'الجبيل', 'حائل'],
  },
  {
    id: 'nahdi',
    name: 'صيدليات النهدي',
    nameEn: 'Nahdi Pharmacy',
    category: 'pharmacy',
    categoryNameAr: 'صيدليات',
    logo: '💊',
    brandColor: '#00a859',
    deliveryFee: 12,
    freeDeliveryThreshold: 100,
    minimumOrder: 30,
    deliveryTime: 'خلال 60 دقيقة (النهدي إكسبريس)',
    rating: 4.7,
    deliverySpeedRating: 4.8,
    availabilityRating: 4.9,
    averageRating: 4.7,
    branchesCount: 1100,
    supportedCities: ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'الخبر', 'بريدة'],
  },
  {
    id: 'tamimi',
    name: 'أسواق التميمي',
    nameEn: 'Tamimi Markets',
    category: 'small_retail',
    categoryNameAr: 'متاجر التجزئة الصغيرة',
    logo: '🥗',
    brandColor: '#d32f2f',
    deliveryFee: 15,
    freeDeliveryThreshold: 150,
    minimumOrder: 50,
    deliveryTime: 'نفس اليوم (تطبيق التميمي)',
    rating: 4.7,
    deliverySpeedRating: 4.6,
    availabilityRating: 4.8,
    averageRating: 4.7,
    branchesCount: 105,
    supportedCities: ['الرياض', 'الدمام', 'الخبر', 'جدة'],
  },
];

// أسعار المنتجات مع احتساب وتفصيل ضريبة القيمة المضافة 15%
const BASE_SAUDI_PRODUCTS: Product[] = [
  {
    id: 'p1',
    nameAr: 'حليب المراعي كامل الدسم (2 لتر)',
    nameEn: 'Almarai Fresh Full Fat Milk 2L',
    category: 'ألبان وأجبان',
    unit: 'عبوة 2 لتر',
    barcode: '6281007010214',
    imageUrl: '🥛',
    tags: ['حليب', 'المراعي', 'طازج', 'ألبان'],
    prices: {
      panda: { priceExclVat: 10.43, priceInclVat: 12.00, inStock: true, isPromo: true, originalPrice: 13.00 },
      othaim: { priceExclVat: 9.57, priceInclVat: 11.00, inStock: true, isPromo: true, originalPrice: 12.50 },
      danube: { priceExclVat: 11.30, priceInclVat: 13.00, inStock: true },
      carrefour: { priceExclVat: 10.00, priceInclVat: 11.50, inStock: true },
      amazon: { priceExclVat: 11.74, priceInclVat: 13.50, inStock: true },
      lulu: { priceExclVat: 10.22, priceInclVat: 11.75, inStock: true },
    },
  },
  {
    id: 'p2',
    nameAr: 'أرز الشعلان سيلا بسمتي بنجابي (5 كجم)',
    nameEn: 'Al Shalan Sella Basmati Rice 5kg',
    category: 'مؤن وحبوب',
    unit: 'كيس 5 كجم',
    barcode: '6281023000107',
    imageUrl: '🍚',
    tags: ['أرز', 'الشعلان', 'بسمتي', 'مؤن'],
    prices: {
      panda: { priceExclVat: 36.52, priceInclVat: 42.00, inStock: true, isPromo: false },
      othaim: { priceExclVat: 32.61, priceInclVat: 37.50, inStock: true, isPromo: true, originalPrice: 43.00 },
      danube: { priceExclVat: 39.13, priceInclVat: 45.00, inStock: true },
      carrefour: { priceExclVat: 34.78, priceInclVat: 40.00, inStock: true, isPromo: true, originalPrice: 44.00 },
      amazon: { priceExclVat: 33.91, priceInclVat: 39.00, inStock: true },
      lulu: { priceExclVat: 33.48, priceInclVat: 38.50, inStock: true },
    },
  },
  {
    id: 'p3',
    nameAr: 'زيت ذرة عافية نقي (1.5 لتر)',
    nameEn: 'Afia Pure Corn Oil 1.5L',
    category: 'زيوت ودهون',
    unit: 'قارورة 1.5 لتر',
    barcode: '6281014000305',
    imageUrl: '🛢️',
    tags: ['زيت', 'عافية', 'طبخ'],
    prices: {
      panda: { priceExclVat: 19.13, priceInclVat: 22.00, inStock: true, isPromo: true, originalPrice: 26.50 },
      othaim: { priceExclVat: 20.00, priceInclVat: 23.00, inStock: true },
      danube: { priceExclVat: 21.74, priceInclVat: 25.00, inStock: true },
      carrefour: { priceExclVat: 18.26, priceInclVat: 21.00, inStock: true, isPromo: true, originalPrice: 25.50 },
      amazon: { priceExclVat: 19.57, priceInclVat: 22.50, inStock: true },
      lulu: { priceExclVat: 19.13, priceInclVat: 22.00, inStock: true },
    },
  },
  {
    id: 'p4',
    nameAr: 'بيض الوطنية طازج كبير (طبق 30 بيضة)',
    nameEn: 'Al Watania Fresh Large Eggs 30s',
    category: 'ألبان وأجبان',
    unit: 'طبق 30 بيضة',
    barcode: '6281005020121',
    imageUrl: '🥚',
    tags: ['بيض', 'الوطنية', 'طازج'],
    prices: {
      panda: { priceExclVat: 16.52, priceInclVat: 19.00, inStock: true },
      othaim: { priceExclVat: 15.22, priceInclVat: 17.50, inStock: true, isPromo: true, originalPrice: 21.00 },
      danube: { priceExclVat: 18.26, priceInclVat: 21.00, inStock: true },
      carrefour: { priceExclVat: 16.09, priceInclVat: 18.50, inStock: true },
      amazon: { priceExclVat: 17.39, priceInclVat: 20.00, inStock: false }, // غير متوفر
      lulu: { priceExclVat: 15.65, priceInclVat: 18.00, inStock: true },
    },
  },
  {
    id: 'p5',
    nameAr: 'سكر الأسرة أبيض ناعم (5 كجم)',
    nameEn: 'Al Osra Fine White Sugar 5kg',
    category: 'مؤن وحبوب',
    unit: 'كيس 5 كجم',
    barcode: '6281002000218',
    imageUrl: '🍬',
    tags: ['سكر', 'الأسرة', 'مؤن'],
    prices: {
      panda: { priceExclVat: 20.87, priceInclVat: 24.00, inStock: true },
      othaim: { priceExclVat: 18.70, priceInclVat: 21.50, inStock: true, isPromo: true, originalPrice: 25.00 },
      danube: { priceExclVat: 22.61, priceInclVat: 26.00, inStock: true },
      carrefour: { priceExclVat: 19.57, priceInclVat: 22.50, inStock: true },
      amazon: { priceExclVat: 20.00, priceInclVat: 23.00, inStock: true },
      lulu: { priceExclVat: 19.13, priceInclVat: 22.00, inStock: true },
    },
  },
  {
    id: 'p6',
    nameAr: 'دجاج التنمية مبرد طازج (1000 جم)',
    nameEn: 'Tanmiah Fresh Chilled Chicken 1000g',
    category: 'لحوم ودواجن',
    unit: 'حبة 1 كجم',
    barcode: '6281008000411',
    imageUrl: '🍗',
    tags: ['دجاج', 'التنمية', 'طازج', 'مبرد'],
    prices: {
      panda: { priceExclVat: 16.09, priceInclVat: 18.50, inStock: true, isPromo: true, originalPrice: 21.00 },
      othaim: { priceExclVat: 15.65, priceInclVat: 18.00, inStock: true },
      danube: { priceExclVat: 17.39, priceInclVat: 20.00, inStock: true },
      carrefour: { priceExclVat: 14.78, priceInclVat: 17.00, inStock: true, isPromo: true, originalPrice: 20.50 },
      amazon: { priceExclVat: 17.39, priceInclVat: 20.00, inStock: false },
      lulu: { priceExclVat: 15.22, priceInclVat: 17.50, inStock: true },
    },
  },
  {
    id: 'p7',
    nameAr: 'مسحوق غسيل أريال بالداوني المركز (5 كجم)',
    nameEn: 'Ariel Laundry Detergent Powder 5kg',
    category: 'عناية ومنظفات',
    unit: 'كيس 5 كجم',
    barcode: '4015400612301',
    imageUrl: '🧺',
    tags: ['منظفات', 'أريال', 'غسيل'],
    prices: {
      panda: { priceExclVat: 47.83, priceInclVat: 55.00, inStock: true, isPromo: true, originalPrice: 72.00 },
      othaim: { priceExclVat: 51.30, priceInclVat: 59.00, inStock: true },
      danube: { priceExclVat: 56.52, priceInclVat: 65.00, inStock: true },
      carrefour: { priceExclVat: 46.09, priceInclVat: 53.00, inStock: true, isPromo: true, originalPrice: 70.00 },
      amazon: { priceExclVat: 42.61, priceInclVat: 49.00, inStock: true, isPromo: true, originalPrice: 68.00 },
      lulu: { priceExclVat: 45.22, priceInclVat: 52.00, inStock: true },
    },
  },
  {
    id: 'p8',
    nameAr: 'شاي ربيع أوراق الشاي الكاملة الفاخر (400 جم)',
    nameEn: 'Rabea Full Leaf Premium Tea 400g',
    category: 'مشروبات وقهوة',
    unit: 'علبة 400 جم',
    barcode: '6281001000102',
    imageUrl: '☕',
    tags: ['شاي', 'ربيع', 'مشروبات'],
    prices: {
      panda: { priceExclVat: 17.39, priceInclVat: 20.00, inStock: true },
      othaim: { priceExclVat: 15.65, priceInclVat: 18.00, inStock: true, isPromo: true, originalPrice: 22.00 },
      danube: { priceExclVat: 18.26, priceInclVat: 21.00, inStock: true },
      carrefour: { priceExclVat: 16.52, priceInclVat: 19.00, inStock: true },
      amazon: { priceExclVat: 15.22, priceInclVat: 17.50, inStock: true },
      lulu: { priceExclVat: 16.09, priceInclVat: 18.50, inStock: true },
    },
  },
  {
    id: 'p9',
    nameAr: 'تمر سكري القصيم رطب فاخر (1 كجم)',
    nameEn: 'Qassim Sukari Fresh Dates 1kg',
    category: 'تمور ومكسرات',
    unit: 'علبة 1 كجم',
    barcode: '6281034000155',
    imageUrl: '🌴',
    tags: ['تمور', 'سكري', 'القصيم', 'طازج'],
    prices: {
      panda: { priceExclVat: 21.74, priceInclVat: 25.00, inStock: true },
      othaim: { priceExclVat: 17.39, priceInclVat: 20.00, inStock: true, isPromo: true, originalPrice: 28.00 },
      danube: { priceExclVat: 26.09, priceInclVat: 30.00, inStock: true },
      carrefour: { priceExclVat: 20.87, priceInclVat: 24.00, inStock: true },
      amazon: { priceExclVat: 21.74, priceInclVat: 25.00, inStock: true },
      lulu: { priceExclVat: 19.13, priceInclVat: 22.00, inStock: true },
    },
  },
  {
    id: 'p10',
    nameAr: 'مناديل كلينكس كلاسيك (10 عبوات × 90 منديل)',
    nameEn: 'Kleenex Classic Facial Tissues 10x90s',
    category: 'عناية ومنظفات',
    unit: 'حزمة 10 علب',
    barcode: '5029053541113',
    imageUrl: '🧻',
    tags: ['مناديل', 'كلينكس', 'ورقيات'],
    prices: {
      panda: { priceExclVat: 21.74, priceInclVat: 25.00, inStock: true, isPromo: true, originalPrice: 32.00 },
      othaim: { priceExclVat: 22.61, priceInclVat: 26.00, inStock: true },
      danube: { priceExclVat: 24.35, priceInclVat: 28.00, inStock: true },
      carrefour: { priceExclVat: 20.00, priceInclVat: 23.00, inStock: true, isPromo: true, originalPrice: 31.00 },
      amazon: { priceExclVat: 18.26, priceInclVat: 21.00, inStock: true, isPromo: true, originalPrice: 30.00 },
      lulu: { priceExclVat: 20.87, priceInclVat: 24.00, inStock: true },
    },
  },
];

function enrichProductsWithStorePrices(rawProducts: Product[], stores: Store[]): Product[] {
  return rawProducts.map((p) => {
    const prices = { ...p.prices };
    const basePandaPrice = prices.panda?.priceInclVat || 20;

    stores.forEach((s) => {
      if (!prices[s.id]) {
        let factor = 1.0;
        let inStock = true;
        let isPromo = false;

        if (s.id === 'nahdi') {
          factor = 1.04;
          const isAvailableInPharmacy =
            ['p1', 'p5', 'p7', 'p8', 'p9', 'p10'].includes(p.id) ||
            (p.category && p.category.includes('عناية')) ||
            (p.category && p.category.includes('ألبان')) ||
            p.id.includes('health');
          inStock = isAvailableInPharmacy;
          if (p.id === 'p10' || (p.category && p.category.includes('عناية'))) {
            isPromo = true;
          }
        } else if (s.id === 'tamimi') {
          factor = 1.02;
          inStock = true;
          if (p.id === 'p2' || p.id === 'p6') {
            isPromo = true;
          }
        }

        const priceIncl = Number((basePandaPrice * factor).toFixed(2));
        const priceExcl = Number((priceIncl / 1.15).toFixed(2));
        prices[s.id] = {
          priceExclVat: priceExcl,
          priceInclVat: priceIncl,
          inStock,
          isPromo,
          originalPrice: isPromo ? Number((priceIncl * 1.18).toFixed(2)) : undefined,
        };
      }
    });

    return { ...p, prices };
  });
}

// دمج المنتجات الأساسية مع البدائل الصحية لتمكين مقارنتها وإضافتها للسلة بسلاسة
export const SAUDI_PRODUCTS: Product[] = enrichProductsWithStorePrices(
  [
    ...BASE_SAUDI_PRODUCTS,
    ...HEALTHY_ALTERNATIVES_DATA.map(convertHealthyAlternativeToProduct),
  ],
  SAUDI_STORES
);

export const SAUDI_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'PANDA15',
    storeId: 'panda',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: 30,
    minSpend: 100,
    validUntil: '2026-12-31',
    description: 'خصم 15% بحد أقصى 30 ر.س على طلبات تطبيق بنده كليك فوق 100 ر.س',
    verified: true,
  },
  {
    id: 'c2',
    code: 'OTHAIM20',
    storeId: 'othaim',
    discountType: 'FIXED',
    discountValue: 20,
    minSpend: 150,
    validUntil: '2026-11-30',
    description: 'خصم فوري 20 ر.س على طلبات العثيم أونلاين فوق 150 ر.س',
    verified: true,
  },
  {
    id: 'c3',
    code: 'DANUBE10',
    storeId: 'danube',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxDiscount: 40,
    minSpend: 150,
    validUntil: '2026-10-31',
    description: 'خصم 10% على طلبات الدانوب أونلاين بحد أقصى 40 ر.س فوق 150 ر.س',
    verified: true,
  },
  {
    id: 'c4',
    code: 'CARREFOUR25',
    storeId: 'carrefour',
    discountType: 'FIXED',
    discountValue: 25,
    minSpend: 180,
    validUntil: '2026-12-31',
    description: 'خصم 25 ر.س عند الشراء بقيمة 180 ر.س أو أكثر من تطبيق كارفور',
    verified: true,
  },
  {
    id: 'c5',
    code: 'AMAZON50',
    storeId: 'amazon',
    discountType: 'FIXED',
    discountValue: 30,
    minSpend: 200,
    validUntil: '2026-12-31',
    description: 'خصم 30 ر.س لعملاء البقالة عبر أمازون السعودية فوق 200 ر.س',
    verified: true,
  },
  {
    id: 'c6',
    code: 'LULU15',
    storeId: 'lulu',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: 35,
    minSpend: 120,
    validUntil: '2026-11-15',
    description: 'خصم 15% بحد أقصى 35 ر.س على تشكيلة الأطعمة الطازجة في لولو أونلاين',
    verified: true,
  },
  {
    id: 'c7',
    code: 'NAHDI10',
    storeId: 'nahdi',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxDiscount: 25,
    minSpend: 80,
    validUntil: '2026-12-31',
    description: 'خصم 10% بحد أقصى 25 ر.س على منتجات العناية بالصحة والطفل عبر تطبيق النهدي',
    verified: true,
  },
  {
    id: 'c8',
    code: 'TAMIMI15',
    storeId: 'tamimi',
    discountType: 'FIXED',
    discountValue: 15,
    minSpend: 130,
    validUntil: '2026-11-30',
    description: 'خصم 15 ر.س عند الطلب من أسواق التميمي أونلاين بقيمة 130 ر.س فأكثر',
    verified: true,
  },
];
