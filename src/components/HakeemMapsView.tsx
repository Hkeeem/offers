import React, { useState, useMemo } from 'react';
import { SAUDI_STORE_BRANCHES, StoreBranch } from '../data/storesLocationData.ts';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  Star,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getStoreCurrentBusyness,
  getStoreScheduleInfo,
  getOptimalShoppingSlots,
  downloadLocalCalendarReminder,
} from '../lib/optimalShoppingTimeEngine.ts';
import { requestGeolocationPermission, calculateDistanceKm } from '../lib/locationService.ts';

interface HakeemMapsViewProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const HakeemMapsView: React.FC<HakeemMapsViewProps> = ({
  selectedCity,
  onSelectCity,
  onNavigateTab,
}) => {
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [activeBranch, setActiveBranch] = useState<StoreBranch | null>(
    SAUDI_STORE_BRANCHES.find((b) => b.city === selectedCity) || SAUDI_STORE_BRANCHES[0]
  );
  const [calendarSavedNotice, setCalendarSavedNotice] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);

  const cities = ['الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة المكرمة', 'المدينة المنورة'];

  const handleRequestLocation = async () => {
    setIsLocating(true);
    setLocationFeedback(null);
    try {
      const res = await requestGeolocationPermission();
      if (res.status === 'success' && res.latitude && res.longitude) {
        setUserCoords({ lat: res.latitude, lng: res.longitude });
        if (res.nearestCity) {
          onSelectCity(res.nearestCity);
        }
        setLocationFeedback(res.messageAr);
      } else {
        setLocationFeedback(res.messageAr);
      }
    } catch {
      setLocationFeedback('تعذر تحديد موقعك الحالي.');
    } finally {
      setIsLocating(false);
      setTimeout(() => {
        setLocationFeedback(null);
      }, 5000);
    }
  };

  const filteredBranches = useMemo(() => {
    const list = SAUDI_STORE_BRANCHES.filter((b) => {
      const matchCity = b.city === selectedCity;
      const matchStore = selectedStoreFilter === 'all' || b.storeId === selectedStoreFilter;
      const matchDistrict =
        !searchDistrict ||
        b.district.includes(searchDistrict) ||
        b.branchName.includes(searchDistrict) ||
        b.address.includes(searchDistrict);

      return matchCity && matchStore && matchDistrict;
    });

    if (userCoords) {
      return [...list].sort((a, b) => {
        const distA = calculateDistanceKm(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return list;
  }, [selectedCity, selectedStoreFilter, searchDistrict, userCoords]);

  const storeFilterOptions = [
    { id: 'all', label: 'جميع المتاجر' },
    { id: 'panda', label: 'بنده' },
    { id: 'othaim', label: 'العثيم' },
    { id: 'danube', label: 'الدانوب' },
    { id: 'carrefour', label: 'كارفور' },
    { id: 'lulu', label: 'لولو' },
    { id: 'nahdi', label: 'النهدي' },
  ];

  return (
    <div className="space-y-6" id="hakeem-maps-view">
      {/* Header Banner الخاص بخريطتي */}
      <div className="bg-gradient-to-r from-emerald-800 via-slate-900 to-teal-900 text-white p-6 rounded-3xl border border-emerald-700/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <MapPin className="w-3.5 h-3.5" />
            <span>خريطتي وفروع المتاجر السعودية (Hkeeem Maps) 🇸🇦</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">أقرب العروض والفروع حولك في {selectedCity}</h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
            اكتشف فروع المتاجر القريبة منك، ساعات العمل، ومهرجانات التخفيضات الحية في كل فرع للتسوق الفوري أو الاستلام بالسيارة.
          </p>
        </div>

        {/* محدد المدينة التفاعلي وتحديد الموقع الجغرافي */}
        <div className="bg-emerald-950/70 p-3.5 rounded-2xl border border-emerald-700/40 shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] font-bold text-emerald-300">اختر مدينتك:</label>
            <button
              type="button"
              id="maps-detect-location-btn"
              onClick={handleRequestLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 hover:bg-amber-300 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="السماح بالوصول للموقع لتحديد أقرب فرع إليك تلقائياً"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>جارٍ الرصد...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-slate-950" />
                  <span>السماح بالموقع (GPS)</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => onSelectCity(city)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all touch-manipulation active:scale-95 ${
                  selectedCity === city
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {locationFeedback && (
            <div className="text-[11px] font-bold text-amber-200 bg-emerald-900/80 px-2 py-1 rounded-lg border border-emerald-600/50 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{locationFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* خيارات البحث والتصفية */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="ابحث بالحي أو اسم الفرع (النرجس، التحلية...)"
            value={searchDistrict}
            onChange={(e) => setSearchDistrict(e.target.value)}
            className="w-full text-xs pr-9 pl-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {storeFilterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedStoreFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all touch-manipulation ${
                selectedStoreFilter === opt.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* تخطيط الخريطة التفاعلية وقائمة الفروع */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* قائمة الفروع في المدينة (5 أعمدة) */}
        <div className="lg:col-span-5 space-y-3 max-h-[620px] overflow-y-auto pr-1">
          {filteredBranches.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-sm">لا توجد فروع مطابقة في {selectedCity} حالياً</div>
              <p className="text-xs text-slate-500 mt-1">جرب تغيير الفلتر أو اختيار مدينة مجاورة كالرياض أو جدة.</p>
            </div>
          ) : (
            filteredBranches.map((branch) => {
              const isSelected = activeBranch?.id === branch.id;

              return (
                <div
                  key={branch.id}
                  onClick={() => setActiveBranch(branch)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-right ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        {branch.logo}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{branch.branchName}</h4>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{branch.district}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold font-mono">تبعد {branch.distanceKm} كم</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        branch.isOpenNow
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {branch.isOpenNow ? 'مفتوح الآن' : 'مغلق'}
                    </span>
                  </div>

                  {/* عرض خاص بالفرع */}
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 text-xs text-amber-900 font-medium flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{branch.featuredOffer}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{branch.openHours}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-mono">{branch.rating}</span>
                      <span className="text-slate-400">({branch.reviewsCount})</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* عرض تفاصيل الفرع المختار والخريطة التفاعلية (7 أعمدة) */}
        <div className="lg:col-span-7 space-y-4">
          {activeBranch ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                    {activeBranch.logo}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{activeBranch.branchName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{activeBranch.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${activeBranch.branchName} ${activeBranch.address}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs touch-manipulation"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>الاتجاهات في الخريطة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* محاكي خريطة تفاعلي بصري لمنطقة الفرع */}
              <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center">
                {/* شبكة الطرق البصرية */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 text-center p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-black text-xl animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="font-black text-slate-900 text-sm">{activeBranch.branchName}</div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    إحداثيات: {activeBranch.lat.toFixed(4)}, {activeBranch.lng.toFixed(4)}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 rounded-lg py-1 px-2.5 mt-2.5 inline-block">
                    تبعد عن موقعك التقديري قرابة {activeBranch.distanceKm} كم
                  </div>
                </div>
              </div>

              {/* مميزات وخدمات الفرع */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium">ساعات الدوام</div>
                  <div className="font-bold text-slate-800 mt-0.5">{activeBranch.openHours}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium">رقم الاتصال الموحد</div>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">{activeBranch.phone}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium">خدمات إضافية</div>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {activeBranch.hasDriveThru ? 'طلب من السيارة (Drive-thru)' : 'مخبز وملحمة طازجة'}
                  </div>
                </div>
              </div>

              {/* بطاقة أفضل أوقات التسوق وساعات الهدوء لهذا الفرع */}
              {(() => {
                const branchBusyness = getStoreCurrentBusyness(activeBranch.storeId);
                const branchSchedule = getStoreScheduleInfo(activeBranch.storeId);
                const optimalSlots = getOptimalShoppingSlots(activeBranch.storeId, selectedCity);
                const goldenSlot = optimalSlots.find((s) => s.type === 'golden') || optimalSlots[0];

                const handleQuickCalendarSave = () => {
                  if (goldenSlot) {
                    const ok = downloadLocalCalendarReminder(goldenSlot, {
                      reminderMinutesBefore: 30,
                    });
                    if (ok) {
                      setCalendarSavedNotice(`تم حفظ تذكير الفترة الذهبية (${goldenSlot.startTime} - ${goldenSlot.endTime}) في تقويمك!`);
                      setTimeout(() => setCalendarSavedNotice(null), 4000);
                    }
                  }
                };

                return (
                  <div className="bg-gradient-to-br from-sky-50/70 to-indigo-50/40 rounded-2xl p-4 border border-sky-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                        <Clock className="w-4 h-4 text-sky-700" />
                        <span>أوقات الهدوء والازدحام في هذا الفرع:</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-sky-800 border border-sky-300">
                        الازدحام الآن: {branchBusyness.currentBusyness}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/80 rounded-xl p-2.5 border border-sky-100">
                        <div className="text-[11px] text-slate-500 font-medium">الفترة الذهبية (أقل زحام):</div>
                        <div className="font-bold text-emerald-800 mt-0.5 flex items-center justify-between">
                          <span>{branchSchedule.quietHoursMorning}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">كاشير سريع</span>
                        </div>
                      </div>
                      <div className="bg-white/80 rounded-xl p-2.5 border border-sky-100">
                        <div className="text-[11px] text-slate-500 font-medium">ساعات الذروة (تجنبها):</div>
                        <div className="font-bold text-rose-700 mt-0.5 flex items-center justify-between">
                          <span>{branchSchedule.peakHoursToAvoid}</span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-md">انتظار كاشير</span>
                        </div>
                      </div>
                    </div>

                    {calendarSavedNotice && (
                      <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                        {calendarSavedNotice}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={handleQuickCalendarSave}
                        className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer touch-manipulation active:scale-95"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>حفظ تذكير بالتقويم المحلي (.ics)</span>
                      </button>

                      <button
                        onClick={() => onNavigateTab('shopping-times')}
                        className="text-xs text-sky-800 hover:text-sky-950 font-bold hover:underline"
                      >
                        عرض منحنى الازدحام بالتفصيل ←
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* زر سريع للمقارنة في هذا المتجر */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">تريد مقارنة أسعار سلتك في {activeBranch.storeName}؟</span>
                <button
                  onClick={() => onNavigateTab('matrix')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                >
                  الانتقال لمقارن الأسعار ←
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
