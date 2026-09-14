import { Product, Store, CartItem, PriceAlert, PriceAlertNotification } from '../types.ts';

const STORAGE_KEY_FAVORITES = 'hakeem_favorites_v1';
const STORAGE_KEY_ALERTS = 'hakeem_price_alerts_v1';
const STORAGE_KEY_NOTIFICATIONS = 'hakeem_price_notifications_v1';

export const INITIAL_FAVORITES: string[] = ['p1', 'p2', 'p3'];

export const INITIAL_NOTIFICATIONS: PriceAlertNotification[] = [
  {
    id: 'notif-1',
    alertId: 'alert-p2',
    productId: 'p2',
    productName: 'أرز الشعلان سيلا بسمتي بنجابي (5 كجم)',
    productImage: '🍚',
    storeId: 'othaim',
    storeName: 'أسواق عبد الله العثيم',
    storeLogo: '🛒',
    oldPriceSar: 42.00,
    newPriceSar: 37.50,
    savingSar: 4.50,
    savingPercent: 10.7,
    timestamp: 'منذ 15 دقيقة',
    isRead: false,
    source: 'favorite',
    message: 'انخفض سعر أرز الشعلان في أسواق العثيم من 42.00 ر.س إلى 37.50 ر.س شامل الضريبة!'
  },
  {
    id: 'notif-2',
    alertId: 'alert-p3',
    productId: 'p3',
    productName: 'زيت عافية ذرة نقي (1.5 لتر)',
    productImage: '🌻',
    storeId: 'carrefour',
    storeName: 'كارفور السعودية',
    storeLogo: '🏬',
    oldPriceSar: 22.50,
    newPriceSar: 19.50,
    savingSar: 3.00,
    savingPercent: 13.3,
    timestamp: 'منذ ساعتين',
    isRead: false,
    source: 'cart',
    message: 'منتج في سلتك! كارفور خفّض سعر زيت عافية إلى 19.50 ر.س مع عرض توفير خاص.'
  }
];

export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_FAVORITES;
}

export function saveStoredFavorites(favs: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favs));
  } catch {
    // fallback
  }
}

export function getStoredAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveStoredAlerts(alerts: PriceAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
  } catch {
    // fallback
  }
}

export function getStoredNotifications(): PriceAlertNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: PriceAlertNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifs));
  } catch {
    // fallback
  }
}

// تشغيل صوت تنبيه خفيف لطيف عند هبوط السعر عبر Web Audio API
export function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio might be blocked by user gesture policies, fail silently
  }
}

// طلب إذن إشعارات المتصفح (Web Notifications)
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

export function sendBrowserNotification(title: string, body: string, icon?: string): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        dir: 'rtl',
        lang: 'ar',
      });
    } catch {
      // ignore
    }
  }
}

// حساب أقل سعر لمنتج مع المتجر
export function getProductLowestPrice(product: Product, stores: Store[]): { lowestPrice: number; store: Store | null } {
  let min = Infinity;
  let bestStore: Store | null = null;

  stores.forEach((store) => {
    const info = product.prices[store.id];
    if (info && info.inStock && info.priceInclVat < min) {
      min = info.priceInclVat;
      bestStore = store;
    }
  });

  return {
    lowestPrice: min === Infinity ? 0 : min,
    store: bestStore,
  };
}
