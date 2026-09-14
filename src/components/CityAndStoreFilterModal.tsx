import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Check,
  X,
  Sparkles,
  Store as StoreIcon,
  RotateCcw,
  CheckCircle2,
  Building2,
  HelpCircle,
  Navigation,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Store, StoreCategoryId } from '../types.ts';
import { STORE_CATEGORIES_CONFIG } from '../data/saudiData.ts';
import { requestGeolocationPermission, LocationDetectionResult } from '../lib/locationService.ts';

interface CityAndStoreFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  selectedStoreCategory: StoreCategoryId;
  onSelectStoreCategory: (category: StoreCategoryId) => void;
  allStores: Store[];
  filteredStores: Store[];
}

export const CityAndStoreFilterModal: React.FC<CityAndStoreFilterModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
  selectedStoreCategory,
  onSelectStoreCategory,
  allStores,
  filteredStores,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationDetectionResult | null>(null);

  if (!isOpen) return null;

  const handleRequestLocation = async () => {
    setIsLocating(true);
    setLocationResult(null);
    try {
      const res = await requestGeolocationPermission();
      setLocationResult(res);
      if (res.status === 'success' && res.nearestCity) {
        onSelectCity(res.nearestCity);
      }
    } catch {
      setLocationResult({
        status: 'unavailable',
        messageAr: 'حدث خطأ غير متوقع أثناء محاولة تحديد موقعك الجغرافي.',
      });
    } finally {
      setIsLocating(false);
    }
  };

  const cities = [
    { name: 'الرياض', region: 'الوسطى', icon: '🏙️' },
    { name: 'جدة', region: 'الغربية', icon: '🌊' },
    { name: 'الدمام', region: 'الشرقية', icon: '🛢️' },
    { name: 'الخبر', region: 'الشرقية', icon: '🌉' },
    { name: 'مكة المكرمة', region: 'الغربية', icon: '🕋' },
    { name: 'المدينة المنورة', region: 'الغربية', icon: '🕌' },
    { name: 'بريدة', region: 'القصيم', icon: '🌴' },
  ];

  // احتساب عدد المتاجر المتاحة لكل فئة بناءً على المدينة المحددة
  const getCategoryStoresCount = (catId: StoreCategoryId) => {
    return allStores.filter((s) => {
      const matchCity =
        s.supportedCities.includes('كافة مدن ومحافظات المملكة') ||
        s.supportedCities.includes(selectedCity);
      if (!matchCity) return false;
      if (catId === 'all') return true;
      return s.category === catId;
    }).length;
  };

  const activeCategory =
    STORE_CATEGORIES_CONFIG.find((c) => c.id === selectedStoreCategory) ||
    STORE_CATEGORIES_CONFIG[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      id="city-and-store-filter-modal"
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس النافذة التفاعلية */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-5 p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400/20 text-amber-300 p-1.5 rounded-xl border border-amber-400/30">
              <MapPin className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              الموقع وتفضيلات المتاجر
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white">
            تحديد المدينة وتصفية فئات المتاجر
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
            خصص تجربة التسوق في حكيم AI باختيار مدينتك لتحديث تكلفة التوصيل، وتصفية المتاجر حسب فئتك المفضلة (هايبر ماركت، تجزئة، صيدليات) لتقليل النتائج بدقة.
          </p>
        </div>

        {/* محتوى النافذة القابل للتمرير */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* بطاقة السماح بالموقع وتحديد موقعي تلقائياً */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <span>السماح بالموقع الجغرافي (GPS)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      تحديد تلقائي
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    اسمح للتطبيق بقراءة موقعك لاكتشاف أقرب مدينة وفروع المتاجر ومقارنة الأسعار فورياً.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="modal-request-location-btn"
                onClick={handleRequestLocation}
                disabled={isLocating}
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-60 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ رصد الإحداثيات...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-amber-300" />
                    <span>السماح بالموقع وتحديد مدينتي</span>
                  </>
                )}
              </button>
            </div>

            {/* رسالة النتيجة */}
            {locationResult && (
              <div
                className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 animate-in fade-in duration-200 ${
                  locationResult.status === 'success'
                    ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {locationResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{locationResult.messageAr}</p>
                  {locationResult.status === 'success' && locationResult.accuracy && (
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      دقة الرصد: ±{locationResult.accuracy} متر • تم تحديث أسعار التوصيل وقوائم الفروع تلقائياً.
                    </p>
                  )}
                  {locationResult.status === 'denied' && (
                    <p className="text-[11px] text-amber-800 mt-1">
                      💡 <strong>كيفية السماح:</strong> اضغط على أيقونة القفل أو الإعدادات بجانب شريط عنوان المتصفح، ثم فعّل خيار "الموقع" (Location) وأعد المحاولة.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* القسم الأول: اختيار المدينة */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  اختر مدينتك في المملكة العربية السعودية
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                الحالية: {selectedCity}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cities.map((city) => {
                const isSelected = selectedCity === city.name;
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => onSelectCity(city.name)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 touch-manipulation cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-500/40'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-base">{city.icon}</span>
                      <span className="font-bold text-xs sm:text-sm truncate">
                        {city.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* القسم الثاني: فلترة المتاجر حسب الفئات المطلوبة */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    فلترة المتاجر المعروضة حسب الفئة
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    حدد فئة المتاجر المفضلة لديك لتقليل النتائج والتركيز على ما يهمك
                  </p>
                </div>
              </div>

              {selectedStoreCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectStoreCategory('all')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>عرض الكل</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STORE_CATEGORIES_CONFIG.map((cat) => {
                const isSelected = selectedStoreCategory === cat.id;
                const count = getCategoryStoresCount(cat.id);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectStoreCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-right transition-all touch-manipulation cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/30 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xl p-1 bg-white rounded-lg shadow-2xs border border-slate-100">
                          {cat.icon}
                        </span>
                        <div>
                          <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{cat.labelAr}</span>
                            {isSelected && (
                              <span className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                                مفعّل
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {cat.labelEn}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-700'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {count} متاجر
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {cat.descriptionAr}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* معاينة حية للمتاجر المشمولة في التفضيل الحالي */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <StoreIcon className="w-4 h-4 text-emerald-600" />
                <span>
                  المتاجر المشمولة في مقارناتك الآن ({filteredStores.length} متاجر في {selectedCity}):
                </span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                فئة: {activeCategory.labelAr}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                >
                  <span>{store.logo}</span>
                  <span>{store.name}</span>
                  {store.categoryNameAr && (
                    <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-sm">
                      {store.categoryNameAr}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {selectedStoreCategory !== 'all' && (
              <p className="text-[11px] text-amber-800 bg-amber-50 rounded-xl p-2.5 mt-3 border border-amber-200/60 leading-relaxed flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  يتم الآن تضييق جداول الأسعار ومصفوفة المقارنة وحاسبة السلة لتركز حصرياً على{' '}
                  <strong>{activeCategory.labelAr}</strong>.
                </span>
              </p>
            )}
          </div>
        </div>

        {/* أسفل النافذة وأزرار التأكيد */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            تنعكس هذه التفضيلات فورياً على جميع صفحات ومقارنات التطبيق.
          </div>

          <div className="flex items-center gap-2">
            {selectedStoreCategory !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectStoreCategory('all')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                إلغاء الفلترة (الكل)
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد وحفظ التفضيل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
