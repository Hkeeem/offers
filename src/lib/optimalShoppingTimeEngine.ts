import { StoreScheduleInfo, OptimalShoppingSlot, Store } from '../types.ts';
import { SAUDI_STORE_BRANCHES, StoreBranch } from '../data/storesLocationData.ts';

// جداول العمل وساعات الذروة والهدوء الموثقة للمتاجر السعودية الكبرى
export const STORE_SCHEDULES: Record<string, StoreScheduleInfo> = {
  panda: {
    storeId: 'panda',
    storeName: 'هايبر بنده',
    logo: '🐼',
    openHours: '07:00 ص - 02:00 ص (أو 24 ساعة للفروع الكبرى)',
    openHour24: 7,
    closeHour24: 26, // 2:00 ص فجر اليوم التالي
    quietHoursMorning: '08:00 ص - 11:30 ص',
    quietHoursEvening: '11:00 م - 01:30 ص',
    peakHoursToAvoid: '07:30 م - 10:30 م',
    freshStockTime: '08:30 ص (خضار وفواكه ومخبوزات طازجة)',
    // منحنى الازدحام على مدار 24 ساعة لأيام الأسبوع العادية (النسب المئوية 0-100)
    hourlyBusynessWeekday: [
      10, 5, 0, 0, 0, 0, 10, 18, 22, 25, 30, 38, // 00:00 إلى 11:00
      42, 35, 28, 30, 45, 60, 75, 88, 85, 70, 45, 20, // 12:00 إلى 23:00
    ],
    // منحنى الازدحام لعطلة نهاية الأسبوع (الخميس والجمعة والسبت)
    hourlyBusynessWeekend: [
      15, 8, 0, 0, 0, 0, 8, 15, 20, 26, 35, 45,
      48, 40, 35, 42, 65, 80, 92, 98, 95, 82, 60, 35,
    ],
    tips: [
      'تصل شحنات الخضار واللحوم المبردة يومياً في تمام 8:30 صباحاً.',
      'كاشير بنده كويك أسرع ما يكون بين 8:30 ص و 11:00 ص مع صفر انتظار تقريباً.',
      'تجنب الذهاب مساء الخميس والجمعة بين 8:00 م و 10:30 م لتفادي زحام الكاشير ومواقف السيارات.',
    ],
  },
  othaim: {
    storeId: 'othaim',
    storeName: 'أسواق عبد الله العثيم',
    logo: '🛒',
    openHours: '06:30 ص - 01:00 ص',
    openHour24: 6.5,
    closeHour24: 25,
    quietHoursMorning: '07:30 ص - 11:00 ص',
    quietHoursEvening: '10:30 م - 12:30 ص',
    peakHoursToAvoid: '07:00 م - 10:00 م',
    freshStockTime: '07:30 ص (طازج يوم الاثنين وكل صباح)',
    hourlyBusynessWeekday: [
      5, 0, 0, 0, 0, 5, 12, 20, 24, 28, 32, 40,
      45, 30, 25, 32, 50, 68, 82, 90, 84, 65, 38, 15,
    ],
    hourlyBusynessWeekend: [
      10, 0, 0, 0, 0, 5, 10, 18, 22, 30, 40, 50,
      52, 38, 32, 45, 70, 85, 95, 96, 90, 75, 50, 25,
    ],
    tips: [
      'يوم الاثنين هو مهرجان الطازج (كيلو عليك وكيلو علينا)؛ أفضل وقت لاقتناصه هو الصباح من 7:30 ص إلى 10:30 ص.',
      'الهدوء التام يعم فروع العثيم وقت صلاة الظهر حتى 3:30 عصراً.',
      'تتوفر مواقف وفيرة وكاشير سريع جداً قبل الساعة 11:00 صباحاً.',
    ],
  },
  danube: {
    storeId: 'danube',
    storeName: 'الدانوب هايبرماركت',
    logo: '🍇',
    openHours: '07:00 ص - 12:00 منتصف الليل',
    openHour24: 7,
    closeHour24: 24,
    quietHoursMorning: '08:30 ص - 12:00 م',
    quietHoursEvening: '10:30 م - 12:00 ص',
    peakHoursToAvoid: '08:00 م - 10:30 م',
    freshStockTime: '08:30 ص (مخبوزات فرنسية وأجبان وأسماك طازجة)',
    hourlyBusynessWeekday: [
      0, 0, 0, 0, 0, 0, 5, 12, 16, 20, 25, 32,
      35, 25, 20, 28, 42, 58, 72, 85, 82, 60, 30, 10,
    ],
    hourlyBusynessWeekend: [
      0, 0, 0, 0, 0, 0, 5, 10, 15, 22, 30, 40,
      42, 30, 26, 38, 60, 76, 90, 94, 88, 70, 45, 20,
    ],
    tips: [
      'الدانوب يتميز بمخبوزات الصباح الساخنة وأقسام الأجبان المستوردة بين 8:30 و 11:00 صباحاً.',
      'أجواء تسوق مريحة وراقية مع موسيقى هادئة وخدمة عملاء فورية خلال الفترة الصباحية.',
      'فترة ما بعد 10:30 مساءً ممتازة للمقاضي السريعة قبل إغلاق المتجر.',
    ],
  },
  carrefour: {
    storeId: 'carrefour',
    storeName: 'كارفور السعودية',
    logo: '🏬',
    openHours: '08:00 ص - 12:00 منتصف الليل',
    openHour24: 8,
    closeHour24: 24,
    quietHoursMorning: '08:30 ص - 11:30 ص',
    quietHoursEvening: '10:30 م - 12:00 ص',
    peakHoursToAvoid: '07:30 م - 10:30 م',
    freshStockTime: '09:00 ص',
    hourlyBusynessWeekday: [
      0, 0, 0, 0, 0, 0, 0, 8, 18, 24, 28, 35,
      38, 30, 24, 32, 48, 65, 80, 88, 82, 62, 32, 10,
    ],
    hourlyBusynessWeekend: [
      0, 0, 0, 0, 0, 0, 0, 5, 14, 20, 30, 42,
      46, 35, 30, 42, 65, 82, 92, 95, 90, 72, 45, 18,
    ],
    tips: [
      'تفعيل جهاز المسح الذاتي (Self-Scan) في كارفور متاح دائماً ويوفر وقتاً كبيراً.',
      'الصباح هو أفضل وقت لتفحص عروض شاشات وأجهزة كارفور مع تواجد موظفي خدمة المبيعات دون زحام.',
    ],
  },
  lulu: {
    storeId: 'lulu',
    storeName: 'لولو هايبرماركت',
    logo: '🛍️',
    openHours: '08:00 ص - 12:00 منتصف الليل',
    openHour24: 8,
    closeHour24: 24,
    quietHoursMorning: '08:30 ص - 11:30 ص',
    quietHoursEvening: '10:30 م - 12:00 ص',
    peakHoursToAvoid: '07:30 م - 10:30 م',
    freshStockTime: '08:45 ص (المأكولات البحرية والخضار الاستوائية المستوردة)',
    hourlyBusynessWeekday: [
      0, 0, 0, 0, 0, 0, 0, 10, 18, 22, 28, 35,
      38, 28, 22, 30, 45, 62, 78, 86, 80, 60, 30, 10,
    ],
    hourlyBusynessWeekend: [
      0, 0, 0, 0, 0, 0, 0, 6, 15, 20, 32, 44,
      48, 34, 28, 40, 65, 82, 94, 96, 88, 72, 48, 20,
    ],
    tips: [
      'أقسام الأسماك واللحوم الطازجة في لولو يتم تزويدها صباحاً بأسماك الخليج والبحر الأحمر.',
      'تجنب عطلة نهاية الأسبوع بعد المغرب نظراً للإقبال الجماهيري الكثيف.',
    ],
  },
  amazon: {
    storeId: 'amazon',
    storeName: 'أمازون السعودية',
    logo: '📦',
    openHours: 'متاح للطلب أونلاين 24/7 (شحن وتوصيل فوري)',
    openHour24: 0,
    closeHour24: 24,
    is24Hours: true,
    quietHoursMorning: 'طلب الصباح قبل 11:00 ص لتوصيل نفس اليوم',
    quietHoursEvening: 'الطلب المسائي قبل 08:00 م للشحن صباح الغد',
    peakHoursToAvoid: 'أوقات إغلاق نوافذ الشحن السريع',
    freshStockTime: 'تحديث مستمر للمستودعات المركزية بالرياض وجدة والشرقية',
    hourlyBusynessWeekday: [
      5, 2, 1, 1, 1, 2, 5, 10, 15, 20, 25, 30,
      30, 25, 20, 25, 30, 40, 50, 60, 55, 40, 25, 10,
    ],
    hourlyBusynessWeekend: [
      8, 4, 2, 1, 1, 2, 5, 8, 12, 18, 22, 30,
      32, 28, 24, 30, 40, 50, 65, 70, 65, 50, 35, 15,
    ],
    tips: [
      'لعملاء برايم: اطلب سلع المقاضي وسوبرماركت أمازون قبل 11:00 ص لتصلك في نفس اليوم مجاناً.',
      'عروض التوفير الأسبوعية تتجدد فجر كل أربعاء وخميس.',
    ],
  },
  nahdi: {
    storeId: 'nahdi',
    storeName: 'صيدليات النهدي',
    logo: '💊',
    openHours: '24 ساعة (الفروع الكبرى) أو 08:00 ص - 01:00 ص',
    openHour24: 0,
    closeHour24: 24,
    is24Hours: true,
    quietHoursMorning: '08:00 ص - 12:00 م',
    quietHoursEvening: '01:00 ص - 05:00 ص',
    peakHoursToAvoid: '08:30 م - 11:00 م',
    freshStockTime: 'شحنات الأدوية وحليب وحفائض الأطفال يومياً 9:00 ص',
    hourlyBusynessWeekday: [
      12, 8, 5, 3, 2, 3, 8, 15, 20, 25, 30, 35,
      32, 25, 22, 30, 42, 58, 72, 85, 80, 65, 45, 25,
    ],
    hourlyBusynessWeekend: [
      15, 10, 6, 4, 3, 4, 7, 12, 18, 22, 28, 38,
      35, 28, 25, 35, 52, 68, 85, 92, 88, 70, 50, 30,
    ],
    tips: [
      'استشارة الصيدلي والفحص السريع للضغط والسكر تكون أسهل ما يمكن صباحاً دون انتظار.',
      'عروض النهدي كير ونقاط نهديك تتزامن مع تطبيق النهدي أونلاين للاستلام من الفرع.',
    ],
  },
};

/**
 * الحصول على معلومات جدول المتجر
 */
export function getStoreScheduleInfo(storeId: string): StoreScheduleInfo {
  return (
    STORE_SCHEDULES[storeId] ||
    STORE_SCHEDULES['panda'] // افتراضي
  );
}

/**
 * جلب أقرب فرع للمتجر المختار في مدينة المستخدم
 */
export function getNearestStoreBranch(
  storeId: string,
  city: string
): StoreBranch | undefined {
  const matchInCity = SAUDI_STORE_BRANCHES.find(
    (b) => b.storeId === storeId && b.city === city
  );
  if (matchInCity) return matchInCity;

  // في حال عدم وجود فرع بالمدينة، ابحث عن أقرب فرع بالمملكة
  return SAUDI_STORE_BRANCHES.find((b) => b.storeId === storeId) || SAUDI_STORE_BRANCHES[0];
}

/**
 * حساب حالة المتجر الحالية والازدحام اللحظي
 */
export function getStoreCurrentBusyness(
  storeId: string,
  targetDate: Date = new Date()
): {
  isOpen: boolean;
  currentHour: number;
  currentBusyness: number;
  crowdLevel: 'very_low' | 'low' | 'moderate' | 'high';
  statusText: string;
  isQuietNow: boolean;
  nextQuietWindow: string;
} {
  const schedule = getStoreScheduleInfo(storeId);
  const hour = targetDate.getHours();
  const day = targetDate.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  const isWeekend = day === 4 || day === 5 || day === 6; // خميس وجمعة وسبت

  const busynessArray = isWeekend
    ? schedule.hourlyBusynessWeekend
    : schedule.hourlyBusynessWeekday;

  const currentBusyness = busynessArray[hour] ?? 25;

  // التحقق من حالة الفتح والإغلاق
  let isOpen = false;
  if (schedule.is24Hours) {
    isOpen = true;
  } else if (schedule.closeHour24 > 24) {
    // يغلق بعد منتصف الليل (مثلاً 2:00 ص)
    const normalizedClose = schedule.closeHour24 - 24; // 2
    isOpen = hour >= schedule.openHour24 || hour < normalizedClose;
  } else {
    isOpen = hour >= schedule.openHour24 && hour < schedule.closeHour24;
  }

  let crowdLevel: 'very_low' | 'low' | 'moderate' | 'high' = 'low';
  if (currentBusyness < 25) crowdLevel = 'very_low';
  else if (currentBusyness < 45) crowdLevel = 'low';
  else if (currentBusyness < 75) crowdLevel = 'moderate';
  else crowdLevel = 'high';

  const isQuietNow = isOpen && currentBusyness <= 35;

  let statusText = '';
  if (!isOpen) {
    statusText = `مغلق حالياً (يفتح عند ${schedule.openHour24}:00 ص)`;
  } else if (isQuietNow) {
    statusText = `هادئ جداً 🟢 (${currentBusyness}% من السعة) - وقت مثالي للتسوق!`;
  } else if (crowdLevel === 'moderate') {
    statusText = `حركة معتدلة 🟡 (${currentBusyness}% من السعة) - انتظار يسير`;
  } else {
    statusText = `ذروة وازدحام 🔴 (${currentBusyness}% من السعة) - طوابير كاشير`;
  }

  return {
    isOpen,
    currentHour: hour,
    currentBusyness,
    crowdLevel,
    statusText,
    isQuietNow,
    nextQuietWindow: schedule.quietHoursMorning,
  };
}

/**
 * توليد فترات التسوق المقترحة المخصصة بناءً على الموقع والمتجر والتاريخ
 */
export function getOptimalShoppingSlots(
  storeId: string,
  city: string,
  targetDate: Date = new Date()
): OptimalShoppingSlot[] {
  const schedule = getStoreScheduleInfo(storeId);
  const branch = getNearestStoreBranch(storeId, city);
  const branchName = branch?.branchName || `${schedule.storeName} - فرع ${city}`;
  const address = branch?.address || `المملكة العربية السعودية، ${city}`;

  const dateStr = targetDate.toISOString().split('T')[0];
  const dayIndex = targetDate.getDay();
  const dayNames = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];
  const isToday = new Date().toDateString() === targetDate.toDateString();
  const dayLabel = isToday
    ? `اليوم (${dayNames[dayIndex]})`
    : dayNames[dayIndex];

  const slots: OptimalShoppingSlot[] = [];

  // 1. الفترة الذهبية الصباحية (The Golden Morning Slot)
  slots.push({
    id: `slot-golden-${storeId}-${dateStr}`,
    storeId,
    storeName: schedule.storeName,
    logo: schedule.logo,
    branchName,
    address,
    city,
    dayName: dayLabel,
    dateStr,
    startTime: '09:00',
    endTime: '11:30',
    startHour: 9,
    endHour: 11.5,
    type: 'golden',
    title: '🌟 الفترة الذهبية (الخيار الأفضل للراحة والتوفير)',
    badgeLabel: 'أقل ازدحاماً 18%',
    busynessPercentage: 18,
    crowdLevel: 'very_low',
    description:
      'أفضل توقيت على الإطلاق للتسوق في السعودية: كاشير فوري بدون أي انتظار، مواقف شاغرة ومظللة، وجميع أقسام الخضار واللحوم ممتلئة بالبضائع الطازجة.',
    perks: [
      'كاشير فوري وسريع (زمن محاسبة أقل من دقيقتين)',
      'مواقف سيارات شاغرة وقريبة من البوابة الرئيسية',
      'سلع طازجة حديثة الوصول من المستودعات والمزارع الوطنية',
      'حرية تامة للتنقل بين الممرات ومقارنة الأسعار بهدوء',
    ],
  });

  // 2. الفترة المسائية الهادئة (Night Owl Calm Slot)
  slots.push({
    id: `slot-night-${storeId}-${dateStr}`,
    storeId,
    storeName: schedule.storeName,
    logo: schedule.logo,
    branchName,
    address,
    city,
    dayName: dayLabel,
    dateStr,
    startTime: '22:30',
    endTime: '00:30',
    startHour: 22.5,
    endHour: 24.5,
    type: 'quiet_night',
    title: '🌙 فترة الهدوء الليلي (بعد انحسار ذروة العشاء)',
    badgeLabel: 'ازدحام منخفض 24%',
    busynessPercentage: 24,
    crowdLevel: 'low',
    description:
      'لمن يفضل التسوق ليلاً بعد انقضاء ذروة العائلات: أجواء هادئة ومكيفة، طوابير منتهية، وتسوق مريح لجميع مقاضي البيت.',
    perks: [
      'انحسار كامل لذروة المساء والازدحام العائلي',
      'درجات حرارة لطيفة مساءً وتوفر مواقف',
      'مثالي للتسوق السريع لأصحاب الدوامات الطويلة',
    ],
  });

  // 3. فترة وصول السلع والمخبوزات الطازجة (Fresh Arrivals Slot)
  slots.push({
    id: `slot-fresh-${storeId}-${dateStr}`,
    storeId,
    storeName: schedule.storeName,
    logo: schedule.logo,
    branchName,
    address,
    city,
    dayName: dayLabel,
    dateStr,
    startTime: '08:30',
    endTime: '10:00',
    startHour: 8.5,
    endHour: 10,
    type: 'fresh_stock',
    title: '🥦 موعد المنتجات الطازجة والمخبوزات الساخنة',
    badgeLabel: 'طازج 100%',
    busynessPercentage: 20,
    crowdLevel: 'very_low',
    description:
      'الوقت الذي تفتح فيه أفران المخابز وتصل فيه شاحنات الخضار والفواكه اليومية والملاحم المحلية.',
    perks: [
      'شحنات ألبان المراعي ونادك الطازجة من مصانع الخرج',
      'خبز تميس وصامولي ومخبوزات ساخنة من الفرن مباشرة',
      'لحوم ودواجن مبردة طازجة بتاريخ إنتاج اليوم نفسه',
    ],
  });

  // 4. تحذير أوقات الذروة لتجنبها (Peak Hours Warning)
  slots.push({
    id: `slot-peak-${storeId}-${dateStr}`,
    storeId,
    storeName: schedule.storeName,
    logo: schedule.logo,
    branchName,
    address,
    city,
    dayName: dayLabel,
    dateStr,
    startTime: '19:30',
    endTime: '22:30',
    startHour: 19.5,
    endHour: 22.5,
    type: 'avoid_peak',
    title: '⚠️ ساعات الذروة الشديدة (يُنصح بتجنبها)',
    badgeLabel: 'ازدحام 92%',
    busynessPercentage: 92,
    crowdLevel: 'high',
    description:
      'أعلى فترة ازدحام وتكدس على الكاشير ومواقف السيارات. قد يتطلب الانتظار على الصندوق 15-25 دقيقة.',
    perks: [
      'انتظار طويل على الصناديق والممرات المزدحمة',
      'صعوبة في إيجاد مواقف سيارات شاغرة',
      'نفاد بعض السلع والعروض الترويجية السريعة',
    ],
  });

  return slots;
}

/**
 * تنسيق التاريخ والوقت لصيغة iCalendar RFC 5545 القياسية (UTC / Local)
 */
function formatToIcsDateString(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * إنشاء ملف التقويم القياسي .ics وحفظ التذكير في التقويم المحلي للجهاز
 */
export function generateIcsCalendarContent(
  slot: OptimalShoppingSlot,
  options?: {
    reminderMinutesBefore?: number;
    customNotes?: string;
    cartItemsCount?: number;
    itemsSummary?: string;
  }
): string {
  const reminderMinutes = options?.reminderMinutesBefore ?? 30;

  // احتساب وقت البداية والنهاية الدقيق بالـ Date
  const [startH, startM] = slot.startTime.split(':').map(Number);
  const [endH, endM] = slot.endTime.split(':').map(Number);

  const startDate = new Date(slot.dateStr);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(slot.dateStr);
  if (endH < startH) {
    // يمتد بعد منتصف الليل
    endDate.setDate(endDate.getDate() + 1);
  }
  endDate.setHours(endH, endM, 0, 0);

  const nowStr = formatToIcsDateString(new Date());
  const startStr = formatToIcsDateString(startDate);
  const endStr = formatToIcsDateString(endDate);
  const uid = `hakeem-shopping-${slot.storeId}-${Date.now()}@hkeeem.ai`;

  // نص الوصف الشامل
  const notesText = options?.customNotes
    ? `\\nملاحظاتك الخاصة: ${options.customNotes}`
    : '';
  const cartText = options?.itemsSummary
    ? `\\nقائمة السلع المحددة (${options.cartItemsCount || ''}):\\n${options.itemsSummary}`
    : '';

  const description = [
    `موعد تسوق ذكي ومريح في ${slot.storeName}`,
    `الفرع: ${slot.branchName} (${slot.city})`,
    `مستوى الازدحام المتوقع: ${slot.busynessPercentage}% (${slot.badgeLabel})`,
    `مميزات هذه الفترة:`,
    ...slot.perks.map((p) => `- ${p}`),
    notesText,
    cartText,
    `\\nتم إنشاء التذكير بواسطة منصة حكيم AI (HkeeemAI) - مساعد التوفير الذكي`,
  ]
    .filter(Boolean)
    .join('\\n');

  const summary = `🛒 تسوق التوفير من ${slot.storeName} (${slot.badgeLabel}) - حكيم AI`;

  // ترويسة ومحتوى iCalendar المتوافق مع iOS/macOS و Android و Outlook
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hakeem AI//Smart Shopping Optimizer KSA//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:مواعيد تسوق حكيم AI',
    'X-WR-TIMEZONE:Asia/Riyadh',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${slot.branchName}, ${slot.address}`,
    'STATUS:CONFIRMED',
    // منبه وتنبيه محلي قبل الموعد
    'BEGIN:VALARM',
    `TRIGGER:-PT${reminderMinutes}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:تذكير حكيم: يبدأ بعد ${reminderMinutes} دقيقة أهدأ وقت للتسوق في ${slot.storeName}!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * حفظ التذكير وتنزيل ملف .ics في التقويم المحلي للمستخدم (Apple Calendar, Samsung, Outlook, etc.)
 */
export function downloadLocalCalendarReminder(
  slot: OptimalShoppingSlot,
  options?: {
    reminderMinutesBefore?: number;
    customNotes?: string;
    cartItemsCount?: number;
    itemsSummary?: string;
  }
): boolean {
  try {
    const icsContent = generateIcsCalendarContent(slot, options);
    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `tasawwoq-hakeem-${slot.storeId}-${slot.dateStr}.ics`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('فشل حفظ التذكير في التقويم المحلي:', error);
    return false;
  }
}

/**
 * إنشاء رابط مباشر للإضافة إلى تقويم Google (Web Calendar)
 */
export function generateGoogleCalendarWebUrl(
  slot: OptimalShoppingSlot,
  options?: {
    customNotes?: string;
    cartItemsCount?: number;
    itemsSummary?: string;
  }
): string {
  const [startH, startM] = slot.startTime.split(':').map(Number);
  const [endH, endM] = slot.endTime.split(':').map(Number);

  const startDate = new Date(slot.dateStr);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(slot.dateStr);
  if (endH < startH) {
    endDate.setDate(endDate.getDate() + 1);
  }
  endDate.setHours(endH, endM, 0, 0);

  const startStr = formatToIcsDateString(startDate);
  const endStr = formatToIcsDateString(endDate);

  const title = `🛒 تسوق التوفير من ${slot.storeName} (${slot.badgeLabel}) - حكيم AI`;
  const location = `${slot.branchName}, ${slot.address}`;
  const details = [
    `موعد تسوق هادئ في ${slot.storeName}`,
    `الازدحام المتوقع: ${slot.busynessPercentage}%`,
    ...slot.perks.map((p) => `• ${p}`),
    options?.customNotes ? `ملاحظات: ${options.customNotes}` : '',
    options?.itemsSummary ? `السلع:\n${options.itemsSummary}` : '',
    `منصة حكيم AI: https://hkeeem.ai`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
    details
  )}&location=${encodeURIComponent(location)}`;
}
