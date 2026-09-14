export interface SampleGroceryImage {
  id: string;
  titleAr: string;
  brand: string;
  category: string;
  targetProductId: string;
  description: string;
  badge: string;
  imageUrl: string; // Data URI representation of the product package
}

function createPackagingDataUri(
  title: string,
  brand: string,
  size: string,
  brandColor: string,
  bgColor: string,
  barcode: string,
  iconEmoji: string,
  tagsText: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor}" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="card" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-opacity="0.35" />
      </filter>
    </defs>
    
    <!-- خلفية الصورة -->
    <rect width="600" height="600" fill="url(#bg)" rx="32" />
    
    <!-- عبوة المنتج المركزية -->
    <g filter="url(#shadow)" transform="translate(100, 60)">
      <rect x="0" y="0" width="400" height="480" rx="24" fill="url(#card)" stroke="#e2e8f0" stroke-width="4" />
      
      <!-- شريط العلامة التجارية العلوي -->
      <path d="M 0 24 Q 0 0 24 0 L 376 0 Q 400 0 400 24 L 400 110 L 0 110 Z" fill="${brandColor}" />
      
      <!-- شعار واسم البراند -->
      <text x="200" y="55" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">
        ${brand}
      </text>
      <text x="200" y="90" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="18" fill="#fef08a" text-anchor="middle">
        ORIGINAL SAUDI PRODUCT 🇸🇦
      </text>
      
      <!-- أيقونة المنتج المركزية -->
      <circle cx="200" cy="200" r="65" fill="${brandColor}15" stroke="${brandColor}30" stroke-width="3" />
      <text x="200" y="222" font-size="75" text-anchor="middle">
        ${iconEmoji}
      </text>
      
      <!-- اسم المنتج بالعربية والإنجليزية -->
      <text x="200" y="295" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24" fill="#0f172a" text-anchor="middle">
        ${title}
      </text>
      <text x="200" y="325" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16" fill="#475569" text-anchor="middle">
        ${size} • صافي المحتوى
      </text>
      <text x="200" y="352" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="${brandColor}" text-anchor="middle">
        ${tagsText}
      </text>

      <!-- فاصل وباركود الفحص -->
      <line x1="40" y1="375" x2="360" y2="375" stroke="#cbd5e1" stroke-dasharray="4 4" stroke-width="2" />
      
      <!-- الباركود لمحاكاة مسح Google Cloud Vision OCR -->
      <g transform="translate(70, 395)">
        <rect x="0" y="0" width="260" height="42" fill="#0f172a" rx="4" />
        <!-- خطوط باركود واقعية -->
        <line x1="15" y1="6" x2="15" y2="36" stroke="#ffffff" stroke-width="3" />
        <line x1="24" y1="6" x2="24" y2="36" stroke="#ffffff" stroke-width="1" />
        <line x1="32" y1="6" x2="32" y2="36" stroke="#ffffff" stroke-width="4" />
        <line x1="45" y1="6" x2="45" y2="36" stroke="#ffffff" stroke-width="2" />
        <line x1="56" y1="6" x2="56" y2="36" stroke="#ffffff" stroke-width="5" />
        <line x1="72" y1="6" x2="72" y2="36" stroke="#ffffff" stroke-width="2" />
        <line x1="84" y1="6" x2="84" y2="36" stroke="#ffffff" stroke-width="3" />
        <line x1="98" y1="6" x2="98" y2="36" stroke="#ffffff" stroke-width="6" />
        <line x1="116" y1="6" x2="116" y2="36" stroke="#ffffff" stroke-width="2" />
        <line x1="128" y1="6" x2="128" y2="36" stroke="#ffffff" stroke-width="4" />
        <line x1="142" y1="6" x2="142" y2="36" stroke="#ffffff" stroke-width="1" />
        <line x1="154" y1="6" x2="154" y2="36" stroke="#ffffff" stroke-width="5" />
        <line x1="170" y1="6" x2="170" y2="36" stroke="#ffffff" stroke-width="3" />
        <line x1="185" y1="6" x2="185" y2="36" stroke="#ffffff" stroke-width="2" />
        <line x1="200" y1="6" x2="200" y2="36" stroke="#ffffff" stroke-width="4" />
        <line x1="215" y1="6" x2="215" y2="36" stroke="#ffffff" stroke-width="2" />
        <line x1="230" y1="6" x2="230" y2="36" stroke="#ffffff" stroke-width="5" />
        <line x1="245" y1="6" x2="245" y2="36" stroke="#ffffff" stroke-width="3" />
      </g>
      <text x="200" y="460" font-family="monospace" font-weight="700" font-size="14" fill="#334155" text-anchor="middle">
        BARCODE: ${barcode}
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_GROCERY_IMAGES: SampleGroceryImage[] = [
  {
    id: 'sample-almarai-milk',
    titleAr: 'حليب المراعي كامل الدسم (2 لتر)',
    brand: 'المراعي Almarai',
    category: 'ألبان وأجبان',
    targetProductId: 'p1',
    description: 'صورة عبوة حليب المراعي الطازج 2 لتر كامل الدسم',
    badge: 'الأكثر طلباً',
    imageUrl: createPackagingDataUri(
      'حليب طازج كامل الدسم',
      'المراعي Almarai',
      'عبوة 2 لتر',
      '#0284c7',
      '#0c4a6e',
      '6281007010214',
      '🥛',
      'طازج 100% • فيتامين د • ألبان نقية'
    ),
  },
  {
    id: 'sample-shalan-rice',
    titleAr: 'أرز الشعلان سيلا بسمتي (5 كجم)',
    brand: 'الشعلان Al Shalan',
    category: 'مؤن وحبوب',
    targetProductId: 'p2',
    description: 'كيس أرز الشعلان سيلا بنجابي بسمتي أصفر 5 كجم',
    badge: 'توفير تمويني',
    imageUrl: createPackagingDataUri(
      'أرز سيلا بسمتي بنجابي',
      'الشعلان Al Shalan',
      'كيس 5 كجم',
      '#b45309',
      '#451a03',
      '6281023000107',
      '🍚',
      'حبة طويلة فاخرة • جودة عالية'
    ),
  },
  {
    id: 'sample-afia-oil',
    titleAr: 'زيت ذرة عافية نقي (1.5 لتر)',
    brand: 'عافية Afia',
    category: 'زيوت ودهون',
    targetProductId: 'p3',
    description: 'عبوة زيت ذرة عافية الذهبي الصافي 1.5 لتر',
    badge: 'عرض شهري',
    imageUrl: createPackagingDataUri(
      'زيت ذرة نقي 100%',
      'عافية Afia',
      'عبوة 1.5 لتر',
      '#d97706',
      '#78350f',
      '6281011000102',
      '🌽',
      'نقي وطبيعي • خالي من الكوليسترول'
    ),
  },
  {
    id: 'sample-tanmiah-chicken',
    titleAr: 'دجاج التنمية طازج مبرد (1000 جم)',
    brand: 'التنمية Tanmiah',
    category: 'لحوم ودواجن',
    targetProductId: 'p6',
    description: 'دجاج طازج محلي مبرد وزن 1 كجم إنتاج مزارع التنمية',
    badge: 'طازج يومياً',
    imageUrl: createPackagingDataUri(
      'دجاج طازج مبرد 1000 جم',
      'التنمية Tanmiah',
      'وزن 1000 جم',
      '#15803d',
      '#14532d',
      '6281045000123',
      '🍗',
      'طازج محلي • ذبح حلال 100%'
    ),
  },
  {
    id: 'sample-ariel-detergent',
    titleAr: 'مسحوق غسيل أريال المركز (5 كجم)',
    brand: 'أريال Ariel',
    category: 'عناية ومنظفات',
    targetProductId: 'p7',
    description: 'كيس مسحوق غسيل أريال الأوتوماتيك بنظام إزالة البقع',
    badge: 'عناية منزلية',
    imageUrl: createPackagingDataUri(
      'مسحوق غسيل أوتوماتيك',
      'أريال Ariel',
      'كيس 5 كجم',
      '#059669',
      '#064e3b',
      '4015600551023',
      '🧼',
      'نظافة فائقة • عطر منعش يدوم'
    ),
  },
  {
    id: 'sample-aljouf-olive-oil',
    titleAr: 'زيت زيتون الجوف البكر الممتاز (1 لتر)',
    brand: 'الجوف Al Jouf',
    category: 'أغذية صحية',
    targetProductId: 'alt-olive-oil',
    description: 'زيت زيتون وطني بكر ممتاز معصور على البارد',
    badge: 'بديل صحي 🥗',
    imageUrl: createPackagingDataUri(
      'زيت زيتون بكر ممتاز عضوي',
      'الجوف Al Jouf',
      'زجاجة 1 لتر',
      '#166534',
      '#052e16',
      '6281088000456',
      '🫒',
      'عصرة أولى على البارد • عضوي 100%'
    ),
  },
  {
    id: 'sample-stevia-sweetener',
    titleAr: 'محلي ستيفيا العضوي النباتي (0% سكر)',
    brand: 'ستيفيا Stevia',
    category: 'أغذية صحية',
    targetProductId: 'alt-stevia',
    description: 'بديل السكر الطبيعي 0% سعرات وسكر',
    badge: 'بديل صحي 🥗',
    imageUrl: createPackagingDataUri(
      'محلي نباتي 0% سكر',
      'ستيفيا Stevia',
      'عبوة 100 ظرف',
      '#0d9488',
      '#134e4a',
      '6281099000789',
      '🌿',
      'صفر سكر • مناسب للسكري والكيتو'
    ),
  },
  {
    id: 'sample-tania-water',
    titleAr: 'مياه شرب تانيا المعبأة (40 × 330 مل)',
    brand: 'تانيا Tania',
    category: 'مشروبات ومياه',
    targetProductId: 'p9',
    description: 'كرتون مياه تانيا النقية 40 قارورة حجم 330 مل',
    badge: 'كرتون عائلي',
    imageUrl: createPackagingDataUri(
      'مياه شرب معبأة نقية',
      'تانيا Tania',
      'كرتون 40 × 330 مل',
      '#0284c7',
      '#075985',
      '6281084000321',
      '💧',
      'منخفضة الصوديوم • مياه جوفية نقية'
    ),
  },
];
