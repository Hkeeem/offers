// خدمة تحديد الموقع الجغرافي وحساب أقرب الفروع والمدن السعودية
export interface SaudiCityLocation {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  region: string;
  icon: string;
}

export const SAUDI_CITIES_COORDINATES: SaudiCityLocation[] = [
  { name: 'الرياض', nameEn: 'Riyadh', lat: 24.7136, lng: 46.6753, region: 'الوسطى', icon: '🏙️' },
  { name: 'جدة', nameEn: 'Jeddah', lat: 21.5433, lng: 39.1728, region: 'الغربية', icon: '🌊' },
  { name: 'مكة المكرمة', nameEn: 'Makkah', lat: 21.3891, lng: 39.8579, region: 'الغربية', icon: '🕋' },
  { name: 'المدينة المنورة', nameEn: 'Madinah', lat: 24.5247, lng: 39.5692, region: 'الغربية', icon: '🕌' },
  { name: 'الدمام', nameEn: 'Dammam', lat: 26.4207, lng: 50.0888, region: 'الشرقية', icon: '🛢️' },
  { name: 'الخبر', nameEn: 'Khobar', lat: 26.2172, lng: 50.1971, region: 'الشرقية', icon: '🌉' },
  { name: 'بريدة', nameEn: 'Buraidah', lat: 26.3260, lng: 43.9750, region: 'القصيم', icon: '🌴' },
];

export interface LocationDetectionResult {
  status: 'success' | 'denied' | 'unavailable' | 'timeout' | 'unsupported';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  nearestCity?: string;
  distanceKm?: number;
  messageAr: string;
}

// حساب المسافة الكروية بدقة (Haversine Formula) بالكيلومتر
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// إيجاد أقرب مدينة سعودية بناءً على الإحداثيات
export function findNearestSaudiCity(latitude: number, longitude: number): {
  city: SaudiCityLocation;
  distanceKm: number;
} {
  let closest = SAUDI_CITIES_COORDINATES[0];
  let minDistance = Infinity;

  for (const city of SAUDI_CITIES_COORDINATES) {
    const dist = calculateDistanceKm(latitude, longitude, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return {
    city: closest,
    distanceKm: minDistance,
  };
}

// طلب إذن الموقع الجغرافي من المتصفح وتحديد موقع المستخدم
export function requestGeolocationPermission(): Promise<LocationDetectionResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve({
        status: 'unsupported',
        messageAr: 'خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك الحالي.',
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = findNearestSaudiCity(latitude, longitude);

        // حفظ الموقع المكتشف في التخزين المحلي
        try {
          localStorage.setItem(
            'hakeem_detected_location',
            JSON.stringify({
              latitude,
              longitude,
              city: nearest.city.name,
              timestamp: Date.now(),
            })
          );
        } catch {
          // ignore
        }

        resolve({
          status: 'success',
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          nearestCity: nearest.city.name,
          distanceKm: nearest.distanceKm,
          messageAr: `تم السماح بالموقع وتحديد موقعك بنجاح بالقرب من مدينة ${nearest.city.name} (المسافة: ${nearest.distanceKm} كم)!`,
        });
      },
      (error) => {
        let status: LocationDetectionResult['status'] = 'unavailable';
        let messageAr = 'تعذر الحصول على إحداثيات الموقع الحالية.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            status = 'denied';
            messageAr =
              'تم رفض إذن الوصول للموقع في المتصفح. يمكنك تفعيله من إعدادات المتصفح أو أيقونة القفل بجانب شريط العنوان.';
            break;
          case error.POSITION_UNAVAILABLE:
            status = 'unavailable';
            messageAr = 'إشارة الموقع غير متوفرة حالياً، يرجى التأكد من تشغيل الـ GPS.';
            break;
          case error.TIMEOUT:
            status = 'timeout';
            messageAr = 'استغرق طلب تحديد الموقع وقتاً أطول من المعتاد. يرجى المحاولة مرة أخرى.';
            break;
        }

        resolve({
          status,
          messageAr,
        });
      },
      options
    );
  });
}

// فحص حالة إذن الموقع الحالية إن أمكن
export async function getGeolocationPermissionStatus(): Promise<'granted' | 'prompt' | 'denied' | 'unknown'> {
  if (typeof window === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unknown';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'unknown';
  }
}
