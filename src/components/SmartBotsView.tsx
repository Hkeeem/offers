import React, { useState } from 'react';
import {
  Bot,
  Car,
  Building2,
  Tag,
  Zap,
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Flame,
  Percent,
  Copy,
  Check,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { BotType, BotMetadata, CarDeal, RealEstateDeal, MarketOfferDeal, VerifiedCouponDeal } from '../types.ts';
import {
  SMART_BOTS_METADATA,
  CAR_DEALS_SAMPLE,
  REAL_ESTATE_DEALS_SAMPLE,
  MARKET_OFFERS_SAMPLE,
  VERIFIED_COUPONS_SAMPLE,
} from '../data/smartBotsData.ts';

interface SmartBotsViewProps {
  initialBotTab?: BotType;
  onNavigateTab: (tab: any) => void;
}

export const SmartBotsView: React.FC<SmartBotsViewProps> = ({
  initialBotTab = 'cars',
  onNavigateTab,
}) => {
  const [activeBot, setActiveBot] = useState<BotType>(initialBotTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // حالة محاكاة الفحص اليدوي المباشر للبوت
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccessMessage, setRefreshSuccessMessage] = useState<string | null>(null);

  // حالة نسخ الكوبونات
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  // البوت الحالي النشط
  const currentBotMeta = SMART_BOTS_METADATA.find(b => b.id === activeBot)!;

  // تشغيل الفحص المباشر للبوت
  const handleTriggerBotRefresh = () => {
    setIsRefreshing(true);
    setRefreshSuccessMessage(null);

    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSuccessMessage(`تم فحص وتحديث عروض بوت «${currentBotMeta.name}» بنجاح ورصد أحدث الصفقات!`);
      setTimeout(() => setRefreshSuccessMessage(null), 4000);
    }, 1200);
  };

  // نسخ كود الكوبون
  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    setTimeout(() => setCopiedCouponId(null), 2500);
  };

  // تصفية عروض السيارات (بوت الشريطي)
  const filteredCarDeals = CAR_DEALS_SAMPLE.filter(deal => {
    const matchSearch =
      deal.carModel.includes(searchQuery) ||
      deal.agencyName.includes(searchQuery) ||
      deal.dealType.includes(searchQuery);
    const matchCat = selectedCategoryFilter === 'all' || deal.category === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  // تصفية عروض العقارات (بوت الوسيط العقاري)
  const filteredRealEstateDeals = REAL_ESTATE_DEALS_SAMPLE.filter(deal => {
    const matchSearch =
      deal.title.includes(searchQuery) ||
      deal.district.includes(searchQuery) ||
      deal.propertyType.includes(searchQuery);
    const matchCity = selectedCityFilter === 'all' || deal.city === selectedCityFilter;
    const matchCat = selectedCategoryFilter === 'all' || deal.propertyType === selectedCategoryFilter;
    return matchSearch && matchCity && matchCat;
  });

  // تصفية عروض السوق (بوت عروض الهايبرماركت)
  const filteredMarketOffers = MARKET_OFFERS_SAMPLE.filter(deal => {
    return (
      deal.productName.includes(searchQuery) ||
      deal.storeName.includes(searchQuery) ||
      deal.category.includes(searchQuery)
    );
  });

  // تصفية الكوبونات الموثقة (بوت صياد الكوبونات)
  const filteredVerifiedCoupons = VERIFIED_COUPONS_SAMPLE.filter(deal => {
    return (
      deal.storeName.includes(searchQuery) ||
      deal.couponCode.includes(searchQuery) ||
      deal.discountSummary.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6" dir="rtl" id="smart-bots-view">
      {/* رأس الصفحة والهوية */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>روبوتات حكيم الآلية الذكية • مسح ومطابقة العروض بالمملكة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>مركز البوتات الذكية</span>
              <span className="text-amber-400 font-mono text-xl">Hakeem Bots</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              روبوتات مبرمجة لمسح وجلب وتحديث أقوى العروض والصفقات يومياً في المواعيد المحددة: عروض وكالات السيارات
              (الساعة 1:00 ظهراً)، الفرص العقارية المعتمدة (الساعة 2:00 ظهراً)، ونشرات عروض الهايبرماركت والكوبونات
              الفعالة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerBotRefresh}
              disabled={isRefreshing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'جاري الفحص المباشر...' : 'فحص فوري الآن'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* شريط اختيار البوتات الأربعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SMART_BOTS_METADATA.map(bot => {
          const isActive = activeBot === bot.id;
          return (
            <button
              key={bot.id}
              onClick={() => {
                setActiveBot(bot.id);
                setSearchQuery('');
                setSelectedCategoryFilter('all');
                setSelectedCityFilter('all');
              }}
              className={`p-4 rounded-3xl border text-right transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{bot.avatarIcon}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    bot.id === 'cars'
                      ? 'bg-blue-100 text-blue-800'
                      : bot.id === 'real_estate'
                      ? 'bg-emerald-100 text-emerald-800'
                      : bot.id === 'offers'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  موعده: {bot.scheduleTime}
                </span>
              </div>

              <div className="text-sm font-black text-slate-900">{bot.name}</div>
              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{bot.title}</div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">تم رصد</span>
                <span className="font-mono font-bold text-slate-900">{bot.dealsFoundCount} صفقة</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* بطاقة معلومات البوت النشط وموعد التحديث اليومي */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shadow-xs">
              {currentBotMeta.avatarIcon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">بوت «{currentBotMeta.name}»</h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {currentBotMeta.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{currentBotMeta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs">
              <div className="text-slate-400 text-[10px] font-medium">جدول التحديث اليومي</div>
              <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{currentBotMeta.cronTimeDescription}</span>
              </div>
            </div>

            <button
              onClick={handleTriggerBotRefresh}
              disabled={isRefreshing}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>تحديث البوت</span>
            </button>
          </div>
        </div>

        {/* رسالة نجاح الفحص المباشر */}
        {refreshSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{refreshSuccessMessage}</span>
          </div>
        )}

        {/* شريط البحث والتصفية */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`ابحث داخل صفقات ${currentBotMeta.name}...`}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-2 px-3 pl-9 text-xs text-slate-900 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* فلاتر خاصة بكل بوت */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {activeBot === 'cars' && (
              <>
                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="all">جميع فئات السيارات</option>
                  <option value="سيدان">سيدان</option>
                  <option value="عائلية SUV">عائلية SUV</option>
                  <option value="بيك أب">بيك أب</option>
                </select>
              </>
            )}

            {activeBot === 'real_estate' && (
              <>
                <select
                  value={selectedCityFilter}
                  onChange={e => setSelectedCityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="all">جميع مدن المملكة</option>
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                </select>

                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="all">جميع أنواع العقار</option>
                  <option value="شقة للإيجار">شقة للإيجار</option>
                  <option value="شقة للبيع">شقة للبيع</option>
                  <option value="فيلا للبيع">فيلا للبيع</option>
                  <option value="دور مستقل">دور مستقل</option>
                  <option value="أرض سكنية">أرض سكنية</option>
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. عرض عروض السيارات - بوت الشريطي (تحديث يومي 1:00 ظهراً) */}
      {/* ============================================================== */}
      {activeBot === 'cars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span>عروض وكالات السيارات بالمملكة المحدثة اليوم (1:00 ظهراً)</span>
            </h3>
            <span className="text-xs text-slate-500">تم جلب {filteredCarDeals.length} عرض</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCarDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-xl">
                      {deal.agencyName}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">
                      {deal.badgeText}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">{deal.agencyLogo}</span>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                      {deal.carModel}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>فئة: {deal.category}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">{deal.dealType}</span>
                  </div>

                  {/* تفاصيل الأسعار والأقساط */}
                  <div className="bg-slate-50 rounded-2xl p-3 my-3 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">السعر النقدي المخفض:</span>
                      <div className="text-left font-mono">
                        <span className="line-through text-slate-400 text-[11px] ml-1.5">
                          {deal.cashPriceSar.toLocaleString()} ر.س
                        </span>
                        <span className="font-black text-blue-800 text-sm">
                          {deal.discountedPriceSar.toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>

                    {deal.monthlyInstallmentSar && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-600 font-medium">القسط الشهري التقديري:</span>
                        <span className="font-mono font-black text-emerald-700 text-sm">
                          {deal.monthlyInstallmentSar} ر.س / شهرياً
                        </span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 font-medium pt-1">
                      💡 {deal.profitRate}
                    </div>
                  </div>

                  {/* مميزات العرض */}
                  <ul className="space-y-1 text-xs text-slate-600 my-2">
                    {deal.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-400 text-[11px]">ساري: {deal.validUntil}</span>
                  <a
                    href={`https://google.com/search?q=${encodeURIComponent(deal.agencyName + ' ' + deal.carModel + ' عروض')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>تفاصيل الوكالة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. عرض عروض العقارات - بوت الوسيط العقاري (تحديث يومي 2:00 ظهراً) */}
      {/* ============================================================== */}
      {activeBot === 'real_estate' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>الفرص العقارية المرخصة بالمملكة المحدثة اليوم (2:00 ظهراً)</span>
            </h3>
            <span className="text-xs text-slate-500">تم جلب {filteredRealEstateDeals.length} عقار</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRealEstateDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                      {deal.propertyType}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{deal.postedAt}</span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 leading-snug">{deal.title}</h4>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>
                      {deal.city} - {deal.district}
                    </span>
                  </div>

                  {/* السعر والخصائص */}
                  <div className="bg-emerald-50/50 rounded-2xl p-3 my-3 border border-emerald-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">السعر المطلوب:</span>
                      <span className="font-mono font-black text-emerald-800 text-base">
                        {deal.priceSar.toLocaleString()} ر.س{' '}
                        <span className="text-xs font-normal text-slate-500">
                          {deal.pricePeriod ? `/${deal.pricePeriod}` : ''}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-700 pt-1 border-t border-emerald-200/50">
                      <span>المساحة: {deal.areaSqm} م²</span>
                      {deal.roomsCount && <span>• {deal.roomsCount} غرف</span>}
                      {deal.bathroomsCount && <span>• {deal.bathroomsCount} دورات مياه</span>}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{deal.dealHighlight}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{deal.falLicenseNumber}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {deal.sourcePlatform}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. عرض تخفيضات الهايبرماركت - بوت عروض السوق */}
      {/* ============================================================== */}
      {activeBot === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>عروض الهايبرماركت الأسبوعية ومهرجانات التوفير</span>
            </h3>
            <span className="text-xs text-slate-500">تحديث آلي مستمر</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketOffers.map(deal => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <span>{deal.storeLogo}</span>
                      <span>{deal.storeName}</span>
                    </div>
                    <span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                      خصم {deal.discountPercentage}%
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug mt-1">{deal.productName}</h4>
                  <div className="text-xs text-slate-500 mt-1">الفئة: {deal.category}</div>

                  <div className="bg-amber-50/60 rounded-2xl p-3 my-3 border border-amber-200/50 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500 line-through">
                        {deal.originalPriceSar.toFixed(2)} ر.س
                      </div>
                      <div className="text-base font-black font-mono text-slate-900">
                        {deal.offerPriceSar.toFixed(2)} ر.س
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-1 rounded-xl">
                      {deal.offerType}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>ساري حتى: {deal.validUntil}</span>
                  <button
                    onClick={() => onNavigateTab('matrix')}
                    className="text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    مقارنة بالمتاجر
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. عرض الكوبونات الموثقة - بوت صياد الكوبونات */}
      {/* ============================================================== */}
      {activeBot === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              <span>كوبونات الخصم التي تم فحصها آلياً وتأكيد فعاليتها</span>
            </h3>
            <span className="text-xs text-slate-500">فحص دوري كل ساعتين</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVerifiedCoupons.map(deal => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-purple-400 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <span>{deal.storeLogo}</span>
                      <span>{deal.storeName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      نجاح {deal.successRate}%
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 leading-relaxed mt-1">
                    {deal.discountSummary}
                  </p>

                  {/* كود الكوبون وزر النسخ */}
                  <div className="bg-purple-50 rounded-2xl p-3 my-3 border border-purple-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-purple-700 font-medium">كود الخصم الفعال:</div>
                      <div className="text-base font-mono font-black text-purple-950 tracking-wider">
                        {deal.couponCode}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCode(deal.id, deal.couponCode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        copiedCouponId === deal.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {copiedCouponId === deal.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الكود</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>آخر فحص: {deal.verifiedAt}</span>
                  {deal.minSpendSar && <span>حد أدنى: {deal.minSpendSar} ر.س</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
