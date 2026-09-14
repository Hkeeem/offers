import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
  Tag,
  Database,
  MapPin,
  ShieldCheck,
  TrendingDown,
  Trophy,
  Flame,
  ExternalLink,
  House,
  LogIn,
  Globe,
  Bell,
  Heart,
  Zap,
  Check,
  ListPlus,
  Bot,
  Camera,
  ArrowLeftRight,
  CheckCircle2,
  Mic,
  Clock,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  Navigation,
  Loader2,
} from 'lucide-react';
import { HkeemLogo } from './HkeemLogo.tsx';
import { Product, Store, CartItem, PriceAlertNotification, StoreCategoryId } from '../types.ts';
import { CheaperAlternativeModal } from './CheaperAlternativeModal.tsx';
import { CityAndStoreFilterModal } from './CityAndStoreFilterModal.tsx';
import { STORE_CATEGORIES_CONFIG } from '../data/saudiData.ts';
import { requestGeolocationPermission } from '../lib/locationService.ts';

interface HeaderProps {
  activeTab: 'home' | 'quicklist' | 'image-search' | 'cart' | 'matrix' | 'bots' | 'history' | 'analysis' | 'coupons' | 'chat' | 'maps' | 'rewards' | 'schema' | 'alerts' | 'shopping-times';
  setActiveTab: (tab: 'home' | 'quicklist' | 'image-search' | 'cart' | 'matrix' | 'bots' | 'history' | 'analysis' | 'coupons' | 'chat' | 'maps' | 'rewards' | 'schema' | 'alerts' | 'shopping-times') => void;
  cartCount: number;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedStoreCategory?: StoreCategoryId;
  onSelectStoreCategory?: (category: StoreCategoryId) => void;
  unreadAlertsCount?: number;
  favoritesCount?: number;
  recentNotifications?: PriceAlertNotification[];
  products?: Product[];
  stores?: Store[];
  allStores?: Store[];
  cart?: CartItem[];
  onAddToCart?: (productId: string) => void;
  onSwapProductInCart?: (oldProductId: string, newProductId: string) => void;
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onSimulatePriceDrop?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  selectedCity,
  setSelectedCity,
  selectedStoreCategory = 'all',
  onSelectStoreCategory,
  unreadAlertsCount = 0,
  favoritesCount = 0,
  recentNotifications = [],
  products = [],
  stores = [],
  allStores = [],
  cart = [],
  onAddToCart,
  onSwapProductInCart,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onSimulatePriceDrop,
  onOpenVoiceAssistant,
}) => {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [selectedNotifForAlternative, setSelectedNotifForAlternative] = useState<PriceAlertNotification | null>(null);
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [isCityFilterModalOpen, setIsCityFilterModalOpen] = useState(false);
  const [isLocatingHeader, setIsLocatingHeader] = useState(false);
  const [headerLocationToast, setHeaderLocationToast] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cities = ['الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة المكرمة', 'المدينة المنورة', 'بريدة'];

  const handleHeaderQuickLocate = async () => {
    setIsLocatingHeader(true);
    setHeaderLocationToast(null);
    try {
      const res = await requestGeolocationPermission();
      if (res.status === 'success' && res.nearestCity) {
        setSelectedCity(res.nearestCity);
        setHeaderLocationToast(`تم رصد موقعك: ${res.nearestCity} (${res.distanceKm} كم)`);
      } else {
        setHeaderLocationToast(res.messageAr);
        setIsCityFilterModalOpen(true);
      }
    } catch {
      setHeaderLocationToast('تعذر رصد الموقع.');
      setIsCityFilterModalOpen(true);
    } finally {
      setIsLocatingHeader(false);
      setTimeout(() => {
        setHeaderLocationToast(null);
      }, 4500);
    }
  };

  const activeCategoryConfig =
    STORE_CATEGORIES_CONFIG.find((c) => c.id === selectedStoreCategory) ||
    STORE_CATEGORIES_CONFIG[0];

  const filteredNotifications = notifFilter === 'unread'
    ? recentNotifications.filter((n) => !n.isRead)
    : recentNotifications;

  const handleQuickAdd = (productId: string, notifId: string) => {
    if (onAddToCart) {
      onAddToCart(productId);
      setAddedFeedbackId(notifId);
      setTimeout(() => {
        setAddedFeedbackId(null);
      }, 1800);
    }
  };

  // إغلاق القائمة المنسدلة عند النقر في الخارج
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="app-header">
      {/* الشريط العلوي الوطني والتنظيمي */}
      <div className="bg-emerald-900 text-emerald-50 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/30">
              <span className="text-sm">🇸🇦</span> حكيم AI (HkeeemAI)
            </span>
            <span className="hidden sm:inline text-emerald-300">|</span>
            <span className="text-emerald-100 hidden md:inline font-medium">
              تسوّق أذكى… وفّر أكثر • مصلحتك أنت أولاً، لا المتجر
            </span>
            <span className="hidden sm:inline text-emerald-300">|</span>
            <span className="inline-flex items-center gap-1 text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              ضريبة القيمة المضافة 15% (ZATCA)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="header-location-filter-btn"
              type="button"
              onClick={() => setIsCityFilterModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-700/60 shadow-xs transition-all cursor-pointer font-bold text-xs group"
              title="تعديل المدينة وفلترة فئات المتاجر المعروضة (هايبر ماركت، تجزئة، صيدليات)"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="text-emerald-200">المدينة:</span>
              <span className="text-amber-300 font-black">{selectedCity}</span>
              <span className="text-emerald-400/40">|</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-100 bg-emerald-900/90 px-2 py-0.5 rounded-lg border border-emerald-700/40 group-hover:border-emerald-500/50">
                <span>{activeCategoryConfig.icon}</span>
                <span>{activeCategoryConfig.labelAr}</span>
                {stores.length > 0 && (
                  <span className="bg-emerald-800 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-emerald-600/60">
                    {stores.length}
                  </span>
                )}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* زر السماح بالموقع وتحديد الموقع السريع */}
            <button
              id="header-gps-detect-btn"
              type="button"
              onClick={handleHeaderQuickLocate}
              disabled={isLocatingHeader}
              className="inline-flex items-center gap-1.5 bg-amber-400/20 hover:bg-amber-400/30 active:bg-amber-400/40 text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-xl border border-amber-400/40 font-bold text-xs transition-all cursor-pointer shadow-2xs"
              title="طلب إذن الموقع وتحديد أقرب مدينة وفروع سعودية إليك فورياً"
            >
              {isLocatingHeader ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span className="text-[11px]">جارٍ تحديد موقعك...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px]">السماح بالموقع 📍</span>
                </>
              )}
            </button>

            {headerLocationToast && (
              <span className="text-[11px] font-bold text-emerald-100 bg-emerald-900/90 px-2 py-1 rounded-lg border border-emerald-700/60 animate-in fade-in duration-150">
                {headerLocationToast}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* شريط الشعار والتبويبات الرئيسية */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
              title="العودة للرئيسية"
            >
              {/* أيقونة شعار H الذهبي الخاصة بـ HkeeemAI */}
              <HkeemLogo size="md" withGlow />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>حكيم AI</span>
                    <span className="text-xs font-mono font-bold text-amber-600">HkeeemAI</span>
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    مساعد التوفير الذكي
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  المقارن الشامل للسلال والعروض والكوبونات في السعودية
                </p>
              </div>
            </div>

            {/* أزرار الإجراءات للشاشات الصغيرة */}
            <div className="flex items-center gap-1.5 lg:hidden">
              {/* زر الأوامر الصوتية للشاشات الصغيرة */}
              {onOpenVoiceAssistant && (
                <button
                  id="mobile-voice-assistant-btn"
                  type="button"
                  onClick={onOpenVoiceAssistant}
                  className="relative min-w-[42px] min-h-[42px] p-2 text-amber-900 bg-amber-100/90 rounded-xl hover:bg-amber-200 active:bg-amber-300 transition-all flex items-center justify-center touch-manipulation cursor-pointer border border-amber-300 shadow-2xs"
                  aria-label="تحدث مع حكيم الصوتي"
                  title="أوامر صوتية ذكية (Web Speech API)"
                >
                  <Mic className="w-5 h-5 text-amber-700" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1 ring-white" />
                </button>
              )}

              {/* زر التنبيهات للشاشات الصغيرة */}
              <button
                id="mobile-alerts-toggle"
                onClick={() => setActiveTab('alerts')}
                className="relative min-w-[42px] min-h-[42px] p-2 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center justify-center touch-manipulation cursor-pointer"
                aria-label="عرض التنبيهات والمفضلة"
              >
                <Bell className="w-5 h-5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* مؤشر السلة للشاشات الصغيرة */}
              <button
                id="mobile-cart-toggle"
                onClick={() => setActiveTab('cart')}
                className="relative min-w-[42px] min-h-[42px] p-2 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 active:bg-slate-300 transition-all flex items-center justify-center touch-manipulation active:scale-95 cursor-pointer"
                aria-label="عرض سلة التسوق"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* أزرار التبويبات الرئيسية والقوائم السريعة */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none" id="main-navigation">
              <button
                id="nav-home"
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <House className="w-4 h-4" />
                <span>الرئيسية والعروض</span>
              </button>

              {/* تبويب القائمة السريعة الجديد */}
              <button
                id="nav-quicklist"
                onClick={() => setActiveTab('quicklist')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'quicklist'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ListPlus className="w-4 h-4 text-emerald-500" />
                <span>القائمة السريعة</span>
                <span className="text-[10px] font-extrabold bg-amber-400/30 text-amber-900 px-1.5 py-0.2 rounded-md">
                  جديد
                </span>
              </button>

              {/* تبويب البحث بالصور (Google Cloud Vision API) */}
              <button
                id="nav-image-search"
                onClick={() => setActiveTab('image-search')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'image-search'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-amber-900 bg-amber-50/80 hover:bg-amber-100/90 hover:text-amber-950 border border-amber-300/40'
                }`}
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <span>البحث بالصور</span>
                <span className="text-[10px] font-black bg-amber-600 text-white px-1.5 py-0.2 rounded-md">
                  Vision AI
                </span>
              </button>

              <button
                id="nav-cart"
                onClick={() => setActiveTab('cart')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'cart'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>السلة والتحسين</span>
                {cartCount > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'cart' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                id="nav-matrix"
                onClick={() => setActiveTab('matrix')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <StoreIcon className="w-4 h-4" />
                <span>مقارن المتاجر</span>
              </button>

              {/* تبويب بوتات حكيم الذكية (الشريطي، الوسيط العقاري، رادار العروض، صياد الكوبونات) */}
              <button
                id="nav-bots"
                onClick={() => setActiveTab('bots')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'bots'
                    ? 'bg-indigo-800 text-white shadow-xs'
                    : 'text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/80 hover:text-indigo-950 font-black'
                }`}
              >
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>بوتات حكيم</span>
                <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.2 rounded-md">
                  4 بوتات
                </span>
              </button>

              {/* تبويب تنبيهات الأسعار والمفضلة */}
              <button
                id="nav-alerts"
                onClick={() => setActiveTab('alerts')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'alerts'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Bell className={`w-4 h-4 ${unreadAlertsCount > 0 ? 'text-amber-500 animate-pulse' : ''}`} />
                <span>التنبيهات والمفضلة</span>
                {unreadAlertsCount > 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      activeTab === 'alerts' ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              <button
                id="nav-maps"
                onClick={() => setActiveTab('maps')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'maps'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>خريطتي</span>
              </button>

              {/* تبويب أوقات التسوق الذكية وتذكير التقويم */}
              <button
                id="nav-shopping-times"
                onClick={() => setActiveTab('shopping-times')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'shopping-times'
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-sky-900 bg-sky-50/70 hover:bg-sky-100/90 hover:text-sky-950 font-black border border-sky-300/40'
                }`}
              >
                <Clock className="w-4 h-4 text-sky-600" />
                <span>أوقات التسوق</span>
                <span className="text-[10px] font-black bg-sky-600 text-white px-1.5 py-0.2 rounded-md">
                  تذكير التقويم
                </span>
              </button>

              <button
                id="nav-coupons"
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'coupons'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Tag className="w-4 h-4 text-amber-500" />
                <span>الكوبونات</span>
              </button>

              <button
                id="nav-chat"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>مساعد حكيم</span>
              </button>

              <button
                id="nav-rewards"
                onClick={() => setActiveTab('rewards')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'rewards'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>الجوائز</span>
              </button>

              <button
                id="nav-history"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>تاريخ الأسعار</span>
              </button>

              <button
                id="nav-schema"
                onClick={() => setActiveTab('schema')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all touch-manipulation cursor-pointer ${
                  activeTab === 'schema'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>المعمارية</span>
              </button>
            </nav>

            {/* زر الأوامر الصوتية بالذكاء الاصطناعي لشاشات سطح المكتب */}
            {onOpenVoiceAssistant && (
              <button
                id="desktop-voice-assistant-btn"
                type="button"
                onClick={onOpenVoiceAssistant}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition-all cursor-pointer shadow-2xs group"
                title="تحدث مع حكيم (Web Speech API) لإضافة السلع والبحث الصوتي"
              >
                <Mic className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">أمر صوتي</span>
                <span className="text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded-sm font-black">AI</span>
              </button>
            )}

            {/* جرس التنبيهات المنسدل لشاشات سطح المكتب */}
            <div className="relative hidden lg:block" ref={dropdownRef}>
              <button
                id="desktop-alerts-bell-btn"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                title="إشعارات انخفاض الأسعار"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* القائمة المنبثقة السريعة للتنبيهات المحسنة بالإجراءات المباشرة */}
              {showNotificationDropdown && (
                <div
                  id="header-notifications-dropdown"
                  dir="rtl"
                  className="absolute left-0 mt-2 w-96 sm:w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 text-right animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* رأس قائمة التنبيهات */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Bell className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          تنبيهات هبوط الأسعار
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          مراقبة حية للمتاجر السعودية 🇸🇦
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {unreadAlertsCount > 0 && onMarkAllNotificationsAsRead && (
                        <button
                          onClick={onMarkAllNotificationsAsRead}
                          className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          تحديد الكل كمقروء
                        </button>
                      )}
                      <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                        {unreadAlertsCount} جديد
                      </span>
                    </div>
                  </div>

                  {/* شريط الفرز السريع: الكل / غير مقروء */}
                  <div className="flex items-center gap-1.5 pt-2 pb-1 text-xs">
                    <button
                      onClick={() => setNotifFilter('all')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                        notifFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      كل التنبيهات ({recentNotifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter('unread')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                        notifFilter === 'unread'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      غير مقروءة ({unreadAlertsCount})
                    </button>
                  </div>

                  {/* قائمة الإشعارات */}
                  <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-0.5 py-1 space-y-2.5">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                          <Bell className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {notifFilter === 'unread'
                            ? 'تمت قراءة كافة التنبيهات!'
                            : 'لا توجد تنبيهات أسعار حالية'}
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map((n) => {
                        const isItemInCart = cart.some((c) => c.productId === n.productId);
                        const isJustAdded = addedFeedbackId === n.id;

                        return (
                          <div
                            key={n.id}
                            className={`p-3 rounded-2xl border transition-all space-y-2 ${
                              n.isRead
                                ? 'bg-white border-slate-200/70 opacity-95'
                                : 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                            }`}
                          >
                            {/* رأس الإشعار: المتجر والتوقيت */}
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-950 border border-emerald-200">
                                  <span>{n.storeLogo}</span>
                                  <span>{n.storeName}</span>
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-md font-bold ${
                                    n.source === 'cart'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-rose-100 text-rose-900'
                                  }`}
                                >
                                  {n.source === 'cart' ? '🛒 بسلتك' : '❤️ بالمفضلة'}
                                </span>
                              </div>
                              <span className="text-slate-400 font-mono">{n.timestamp}</span>
                            </div>

                            {/* اسم المنتج وتفاصيل السعر */}
                            <div className="flex items-start gap-2.5">
                              <span className="text-2xl p-1 bg-white rounded-xl border border-slate-100 shadow-2xs shrink-0">
                                {n.productImage}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-black text-slate-900 text-xs truncate">
                                  {n.productName}
                                </h5>

                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="line-through text-slate-400 font-mono text-[11px]">
                                    {n.oldPriceSar.toFixed(2)} ر.س
                                  </span>
                                  <span className="text-emerald-700 font-mono font-black text-xs">
                                    {n.newPriceSar.toFixed(2)} ر.س
                                  </span>
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md">
                                    وفر {n.savingSar.toFixed(2)} ر.س
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* أزرار الإجراءات السريعة المباشرة */}
                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                              {/* زر إضافة للسلة السريع */}
                              <button
                                onClick={() => handleQuickAdd(n.productId, n.id)}
                                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                                  isJustAdded
                                    ? 'bg-emerald-700 text-white ring-2 ring-emerald-500'
                                    : isItemInCart
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                }`}
                              >
                                {isJustAdded ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce" />
                                    <span>تمت الإضافة! ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>{isItemInCart ? 'بالسلة (+1)' : 'إضافة للسلة'}</span>
                                  </>
                                )}
                              </button>

                              {/* زر عرض البديل الأرخص الذكي */}
                              <button
                                onClick={() => setSelectedNotifForAlternative(n)}
                                className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                                title="فحص المتاجر المنافسة والبدائل الأوفر للسلعة"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                                <span>البديل الأرخص</span>
                              </button>

                              {/* زر مقارنة المتاجر */}
                              <button
                                onClick={() => {
                                  setShowNotificationDropdown(false);
                                  setActiveTab('matrix');
                                }}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="مصفوفة مقارنة الأسعار"
                              >
                                <StoreIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* زر تمييز كمقروء */}
                              {!n.isRead && onMarkNotificationAsRead && (
                                <button
                                  onClick={() => onMarkNotificationAsRead(n.id)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                                  title="تحديد كمقروء"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* تذييل القائمة المنبثقة */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveTab('alerts');
                        setShowNotificationDropdown(false);
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      إدارة كافة التنبيهات والمفضلة ←
                    </button>

                    {onSimulatePriceDrop && (
                      <button
                        onClick={() => {
                          onSimulatePriceDrop();
                        }}
                        className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-200 cursor-pointer"
                        title="إنشاء تنبيه تجريبي لهبوط سعر"
                      >
                        <Zap className="w-3 h-3 fill-amber-600 text-amber-600" />
                        <span>محاكاة هبوط</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* شريط الفلترة السريع لفئات المتاجر (هايبر ماركت، تجزئة، صيدليات) */}
      <div className="bg-slate-50/95 border-t border-slate-200/90 px-4 sm:px-6 py-2" id="store-categories-filter-bar">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline">فئة المتاجر:</span>
            </span>

            <div className="flex items-center gap-1.5 flex-nowrap">
              {STORE_CATEGORIES_CONFIG.map((cat) => {
                const isSelected = selectedStoreCategory === cat.id;
                const pool = allStores.length > 0 ? allStores : stores;
                const count = pool.filter((s) => {
                  const matchCity =
                    s.supportedCities.includes('كافة مدن ومحافظات المملكة') ||
                    s.supportedCities.includes(selectedCity);
                  if (!matchCity) return false;
                  if (cat.id === 'all') return true;
                  return s.category === cat.id;
                }).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectStoreCategory?.(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap touch-manipulation ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-500/30'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.labelAr}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-emerald-950 text-emerald-100'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-500 hidden lg:inline">
              {selectedStoreCategory !== 'all' ? (
                <span>
                  تصفية نشطة: <strong>{activeCategoryConfig.labelAr}</strong> ({stores.length} متاجر في {selectedCity})
                </span>
              ) : (
                <span>كافة المتاجر ({stores.length}) في {selectedCity}</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setIsCityFilterModalOpen(true)}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <MapPin className="w-3 h-3 text-emerald-700" />
              <span>تغيير المدينة والتفضيلات</span>
            </button>
          </div>
        </div>
      </div>

      {/* نافذة اختيار المدينة وفلترة فئات المتاجر */}
      <CityAndStoreFilterModal
        isOpen={isCityFilterModalOpen}
        onClose={() => setIsCityFilterModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        selectedStoreCategory={selectedStoreCategory}
        onSelectStoreCategory={(cat) => onSelectStoreCategory?.(cat)}
        allStores={allStores.length > 0 ? allStores : stores}
        filteredStores={stores}
      />

      {/* نافذة البديل الأوفر والصفقة الأفضل المنبثقة */}
      <CheaperAlternativeModal
        isOpen={!!selectedNotifForAlternative}
        onClose={() => setSelectedNotifForAlternative(null)}
        notification={selectedNotifForAlternative}
        products={products}
        stores={stores}
        cart={cart}
        onAddToCart={(pId) => {
          if (onAddToCart) onAddToCart(pId);
        }}
        onSwapProductInCart={onSwapProductInCart}
        onNavigateTab={setActiveTab}
      />
    </header>
  );
};
