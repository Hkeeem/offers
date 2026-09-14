import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Download,
  Share2,
  ExternalLink,
  Info,
  Truck,
  ShoppingBag,
  Bell,
  Sun,
  Moon,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Store, CartItem, Product, OptimalShoppingSlot } from '../types.ts';
import {
  STORE_SCHEDULES,
  getStoreScheduleInfo,
  getNearestStoreBranch,
  getStoreCurrentBusyness,
  getOptimalShoppingSlots,
  downloadLocalCalendarReminder,
  generateGoogleCalendarWebUrl,
} from '../lib/optimalShoppingTimeEngine.ts';
import { requestGeolocationPermission } from '../lib/locationService.ts';

interface OptimalShoppingTimesViewProps {
  stores: Store[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
  cart?: CartItem[];
  products?: Product[];
  onNavigateTab?: (tab: any) => void;
  initialStoreId?: string;
}

export const OptimalShoppingTimesView: React.FC<OptimalShoppingTimesViewProps> = ({
  stores,
  selectedCity,
  onSelectCity,
  cart = [],
  products = [],
  onNavigateTab,
  initialStoreId,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    initialStoreId || 'panda'
  );
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = اليوم, 1 = غداً, 2 = بعد غد
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(30);
  const [customNote, setCustomNote] = useState<string>('');
  const [includeCartInReminder, setIncludeCartInReminder] = useState<boolean>(true);
  const [activeSlotForCustomModal, setActiveSlotForCustomModal] =
    useState<OptimalShoppingSlot | null>(null);
  const [savedFeedbackSlotId, setSavedFeedbackSlotId] = useState<string | null>(
    null
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const cities = ['الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة المكرمة', 'المدينة المنورة', 'بريدة'];

  // احتساب التاريخ المستهدف
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDayOffset);
    return d;
  }, [selectedDayOffset]);

  // استخراج جدول المتجر والفرع الأقرب
  const schedule = useMemo(
    () => getStoreScheduleInfo(selectedStoreId),
    [selectedStoreId]
  );
  const currentStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId) || stores[0],
    [stores, selectedStoreId]
  );
  const nearestBranch = useMemo(
    () => getNearestStoreBranch(selectedStoreId, selectedCity),
    [selectedStoreId, selectedCity]
  );

  // حالة الازدحام اللحظية
  const liveStatus = useMemo(
    () => getStoreCurrentBusyness(selectedStoreId, new Date()),
    [selectedStoreId]
  );

  // الفترات المقترحة للتسوق
  const shoppingSlots = useMemo(
    () => getOptimalShoppingSlots(selectedStoreId, selectedCity, targetDate),
    [selectedStoreId, selectedCity, targetDate]
  );

  // ملخص عناصر السلة لإدراجه في التذكير إذا وُجد
  const cartSummary = useMemo(() => {
    if (!cart || cart.length === 0 || !includeCartInReminder) return '';
    return cart
      .map((item) => {
        const p = products.find((prod) => prod.id === item.productId);
        return p ? `• ${p.nameAr} (${item.quantity} ${p.unit})` : '';
      })
      .filter(Boolean)
      .join('\n');
  }, [cart, products, includeCartInReminder]);

  // تحديد الموقع عبر المتصفح (Geolocation)
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationMessage(null);
    try {
      const res = await requestGeolocationPermission();
      if (res.status === 'success' && res.nearestCity) {
        onSelectCity(res.nearestCity);
        setLocationMessage(`تم السماح بالموقع ورصد موقعك بالقرب من ${res.nearestCity} (${res.distanceKm} كم)!`);
      } else {
        setLocationMessage(res.messageAr);
      }
    } catch {
      setLocationMessage('تعذر الوصول للإحداثيات، يرجى اختيار مدينتك يدوياً.');
    } finally {
      setIsDetectingLocation(false);
      setTimeout(() => setLocationMessage(null), 4000);
    }
  };

  // حفظ التذكير في التقويم المحلي
  const handleSaveToLocalCalendar = (slot: OptimalShoppingSlot) => {
    const success = downloadLocalCalendarReminder(slot, {
      reminderMinutesBefore,
      customNotes: customNote,
      cartItemsCount: cart.length,
      itemsSummary: cartSummary,
    });

    if (success) {
      setSavedFeedbackSlotId(slot.id);
      setActiveSlotForCustomModal(null);
      setTimeout(() => {
        setSavedFeedbackSlotId(null);
      }, 4500);
    }
  };

  // فتح تقويم جوجل
  const handleOpenGoogleCalendar = (slot: OptimalShoppingSlot) => {
    const url = generateGoogleCalendarWebUrl(slot, {
      customNotes: customNote,
      cartItemsCount: cart.length,
      itemsSummary: cartSummary,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // بيانات منحنى الازدحام على مدار 24 ساعة لليوم المحدد
  const dayIndex = targetDate.getDay();
  const isWeekend = dayIndex === 4 || dayIndex === 5 || dayIndex === 6;
  const busynessCurve = isWeekend
    ? schedule.hourlyBusynessWeekend
    : schedule.hourlyBusynessWeekday;

  return (
    <div className="space-y-6" id="optimal-shopping-times-container" dir="rtl">
      {/* بطاقة الترويسة الرئيسية والتعريفية */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-sky-700/50 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-sky-300" />
            <span>خوارزمية اقتراح أوقات التسوق الهادئة وتذكير التقويم 🇸🇦</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            أفضل أوقات التسوق وساعات الهدوء في {currentStore.name}
          </h1>

          <p className="text-xs sm:text-sm text-sky-100/90 max-w-2xl leading-relaxed">
            وفّر وقتك وتجنب طوابير الكاشير وازدحام المواقف! نقترح لك التوقيت المثالي للتسوق في منطقتك
            بناءً على ساعات عمل المتاجر وأوقات الهدوء وتوفر السلع الطازجة، مع إمكانية حفظ تذكير فوري في تقويم جهازك المحلي.
          </p>

          {/* شريط الموقع واختيار المدينة وتحديد GPS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">المدينة المحددة:</span>
              <span className="font-bold text-white">{selectedCity}</span>
            </div>

            <button
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Compass className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'جارٍ تحديد موقعك...' : 'تحديد موقعي التلقائي (GPS)'}</span>
            </button>

            {/* محدد المدن السريع */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => onSelectCity(city)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all touch-manipulation cursor-pointer ${
                    selectedCity === city
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'bg-white/5 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {locationMessage && (
            <div className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-400/30 inline-block animate-in fade-in">
              {locationMessage}
            </div>
          )}
        </div>
      </div>

      {/* توست تأكيد حفظ التذكير في التقويم */}
      {savedFeedbackSlotId && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">
                تم تحميل ملف التذكير للتقويم المحلي بنجاح! 📅
              </div>
              <div className="text-xs text-emerald-100">
                افتح الملف الذي تم تنزيله لإضافته مباشرة إلى تقويم Apple، سامسونج، Outlook أو تقويم أندرويد.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSavedFeedbackSlotId(null)}
            className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-all shrink-0 cursor-pointer"
          >
            حسناً
          </button>
        </div>
      )}

      {/* شريط اختيار المتجر واليوم المستهدف */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <span>اختر المتجر لمشاهدة ساعات عمله وأهدأ فتراته:</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تختلف ساعات الهدوء والازدحام بين المتاجر باختلاف مواعيد العروض والشحنات.
            </p>
          </div>

          {/* محدد اليوم المستهدف */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 self-start md:self-center">
            <button
              onClick={() => setSelectedDayOffset(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDayOffset === 0
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setSelectedDayOffset(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDayOffset === 1
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              غداً
            </button>
            <button
              onClick={() => setSelectedDayOffset(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDayOffset === 2
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بعد غد
            </button>
          </div>
        </div>

        {/* أزرار اختيار المتاجر */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {stores.map((st) => {
            const isSelected = selectedStoreId === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStoreId(st.id)}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{st.logo}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {st.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    تقييم {st.rating}⭐
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* بطاقة الحالة اللحظية للفرع الأقرب وساعات العمل */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* تفاصيل الفرع والحالة اللحظية (5 أعمدة) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {currentStore.logo}
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {nearestBranch?.branchName || currentStore.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {nearestBranch?.district || selectedCity}
                      {nearestBranch?.distanceKm && ` • يبعد ${nearestBranch.distanceKm} كم`}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  liveStatus.isOpen
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {liveStatus.isOpen ? 'مفتوح الآن' : 'مغلق حالياً'}
              </span>
            </div>

            {/* ساعات العمل الرسمية */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-xs space-y-1">
              <div className="text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ساعات العمل المعتمدة:</span>
              </div>
              <div className="font-bold text-slate-900 font-mono text-xs pr-5">
                {schedule.openHours}
              </div>
            </div>

            {/* مؤشر الازدحام اللحظي الآن */}
            <div className="bg-gradient-to-l from-slate-50 to-white rounded-2xl p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">مستوى الازدحام الآن:</span>
                <span className="font-black font-mono text-emerald-800">
                  {liveStatus.currentBusyness}% من الطاقة الاستيعابية
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    liveStatus.currentBusyness <= 35
                      ? 'bg-emerald-500'
                      : liveStatus.currentBusyness <= 65
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${liveStatus.currentBusyness}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 font-medium pt-0.5">
                {liveStatus.statusText}
              </p>
            </div>
          </div>

          {/* نصائح حكيم للتسوق الذكي في هذا المتجر */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>نصائح حكيم لهذا المتجر:</span>
            </div>
            {schedule.tips.slice(0, 2).map((tip, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* الرسم البياني لمنحنى الازدحام على مدار 24 ساعة (7 أعمدة) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <span>منحنى الازدحام وساعات الذروة والهدوء (24 ساعة)</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                    {isWeekend ? 'عطلة نهاية الأسبوع' : 'أيام الأسبوع العادية'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  نسبة إشغال الكاشير والمواقف لكل ساعة خلال اليوم
                </p>
              </div>

              {/* مفتاح الألوان */}
              <div className="flex items-center gap-3 text-[11px] text-slate-600 shrink-0">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>هادئ (&lt;35%)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>معتدل</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>ذروة (&gt;65%)</span>
                </span>
              </div>
            </div>

            {/* أعمدة الازدحام التفاعلية لجميع ساعات اليوم */}
            <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 border-b border-slate-100">
              {busynessCurve.map((value, hour) => {
                const isCurrentHour =
                  selectedDayOffset === 0 && hour === new Date().getHours();
                const isGoldenHour = hour >= 9 && hour <= 11;
                const isPeakHour = hour >= 19 && hour <= 22;

                let barColor = 'bg-emerald-400 hover:bg-emerald-500';
                if (value > 65) barColor = 'bg-rose-500 hover:bg-rose-600';
                else if (value > 35) barColor = 'bg-amber-400 hover:bg-amber-500';

                return (
                  <div
                    key={hour}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    title={`الساعة ${hour}:00 - نسبة الازدحام: ${value}%`}
                  >
                    {/* وسم علوي للساعة الحالية أو الذهبية */}
                    {isCurrentHour && (
                      <span className="absolute -top-6 text-[9px] font-black text-white bg-slate-900 px-1 py-0.2 rounded-md shadow-xs whitespace-nowrap z-10 animate-bounce">
                        الآن
                      </span>
                    )}

                    {isGoldenHour && !isCurrentHour && hour === 10 && (
                      <span className="absolute -top-6 text-[9px] font-black text-amber-900 bg-amber-200 px-1 py-0.2 rounded-md whitespace-nowrap z-10">
                        ⭐ أهدأ
                      </span>
                    )}

                    {/* العمود الرأسي */}
                    <div
                      className={`w-full rounded-t-sm sm:rounded-t-md transition-all duration-300 ${barColor} ${
                        isCurrentHour ? 'ring-2 ring-slate-900 ring-offset-1' : ''
                      }`}
                      style={{ height: `${Math.max(value, 4)}%` }}
                    />

                    {/* رقم الساعة بالأسفل كل ساعتين */}
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1 select-none">
                      {hour % 3 === 0 ? `${hour}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>أهدأ فترة صباحية: <strong className="text-slate-900">{schedule.quietHoursMorning}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>أهدأ فترة مسائية: <strong className="text-slate-900">{schedule.quietHoursEvening}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>تجنب الذروة: <strong className="font-bold">{schedule.peakHoursToAvoid}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* قسم الفترات المقترحة للتسوق مع زر حفظ التذكير في التقويم المحلي */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>الفترات المقترحة للتسوق الذكي وحفظ تذكير بالتقويم</span>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                {targetDate.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              اختر الفترة المناسبة لك واضغط "حفظ تذكير في التقويم" ليتم تنبيهك قبل الموعد على جوالك مباشرة
            </p>
          </div>

          {cart && cart.length > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>سلتك بها {cart.length} أصناف وسيتم تضمينها في التذكير!</span>
            </div>
          )}
        </div>

        {/* شبكة بطاقات الفترات المقترحة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shoppingSlots.map((slot) => {
            const isGolden = slot.type === 'golden';
            const isPeak = slot.type === 'avoid_peak';

            return (
              <div
                key={slot.id}
                className={`rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between gap-4 ${
                  isGolden
                    ? 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border-amber-300 shadow-md ring-1 ring-amber-400/40'
                    : isPeak
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {isGolden && (
                  <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-br-2xl shadow-xs">
                    ⭐ الخيار الأفضل
                  </div>
                )}

                <div className="space-y-3">
                  {/* العنوان والوقت ونسبة الازدحام */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                        {slot.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {slot.dayName} • فرع {slot.branchName}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span
                        className={`inline-block font-mono font-black text-xs px-2.5 py-1 rounded-xl border ${
                          isPeak
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-bold">
                        {slot.badgeLabel}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {slot.description}
                  </p>

                  {/* مميزات هذه الفترة */}
                  <div className="space-y-1.5 bg-white/80 rounded-2xl p-3 border border-slate-100 text-xs">
                    <div className="text-[11px] font-bold text-slate-700">
                      ما يميز هذا التوقيت:
                    </div>
                    {slot.perks.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* أزرار الإجراءات وحفظ التذكير بالتقويم */}
                <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                  {!isPeak ? (
                    <>
                      <div className="flex items-center gap-2">
                        {/* زر التنزيل المباشر لملف .ics في التقويم المحلي */}
                        <button
                          onClick={() => handleSaveToLocalCalendar(slot)}
                          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer touch-manipulation"
                          title="حفظ التذكير في تقويم جوالك (آبل، سامسونج، أوتلوك، أو أندرويد)"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>حفظ تذكير بالتقويم المحلي (.ics)</span>
                        </button>

                        {/* زر فتح تقويم جوجل */}
                        <button
                          onClick={() => handleOpenGoogleCalendar(slot)}
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          title="إضافة مباشرة إلى تقويم Google"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>تقويم Google</span>
                        </button>
                      </div>

                      {/* زر تخصيص التذكير */}
                      <button
                        onClick={() => setActiveSlotForCustomModal(slot)}
                        className="text-xs text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
                      >
                        تخصيص التنبيه وملاحظاتي...
                      </button>
                    </>
                  ) : (
                    <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5 w-full justify-between">
                      <span>⚠️ يُفضّل التسوق في الفترات الصباحية أو الليلية البديلة</span>
                      <button
                        onClick={() => setSelectedDayOffset(0)}
                        className="text-[11px] text-slate-600 underline cursor-pointer"
                      >
                        عرض الفترة الذهبية ↑
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* نافذة تخصيص التذكير والملاحظات وقائمة السلة (Modal) */}
      {activeSlotForCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveSlotForCustomModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeSlotForCustomModal.logo}</span>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    تخصيص تذكير التقويم لـ {activeSlotForCustomModal.storeName}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {activeSlotForCustomModal.dayName} ({activeSlotForCustomModal.startTime} - {activeSlotForCustomModal.endTime})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveSlotForCustomModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* تحديد وقت التنبيه المسبق */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>التنبيه المسبق قبل بدء وقت التسوق:</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setReminderMinutesBefore(mins)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reminderMinutesBefore === mins
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    قبل {mins} دقيقة
                  </button>
                ))}
              </div>
            </div>

            {/* تضمين سلة المقاضي في التذكير */}
            {cart && cart.length > 0 && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCartInReminder}
                    onChange={(e) => setIncludeCartInReminder(e.target.checked)}
                    className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-emerald-900">
                    تضمين أصناف سلتك ({cart.length} سلع) في وصف تذكير التقويم
                  </span>
                </label>
                <div className="text-[11px] text-emerald-700 max-h-24 overflow-y-auto whitespace-pre-line pr-6">
                  {cartSummary}
                </div>
              </div>
            )}

            {/* ملاحظات إضافية */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                ملاحظات أو مقاضٍ إضافية (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثلاً: أخذ أكياس قماشية، المرور على قسم المخبز أولاً..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveSlotForCustomModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleSaveToLocalCalendar(activeSlotForCustomModal)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>حفظ التذكير في التقويم المحلي (.ics)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
