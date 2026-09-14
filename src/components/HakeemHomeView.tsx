import React, { useState, useMemo } from 'react';
import { Product, Store } from '../types.ts';
import {
  Search,
  Sparkles,
  Store as StoreIcon,
  ShoppingBag,
  TrendingDown,
  Tag,
  MapPin,
  Trophy,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Flame,
  Filter,
  ListPlus,
  Bot,
  Leaf,
  Camera,
  Scan,
  Mic,
} from 'lucide-react';
import { HkeemLogo } from './HkeemLogo.tsx';
import { DealScore, DealScoreBadge, DealScoreModal } from './DealScore.tsx';
import { calculateLocalDealScore } from '../lib/dealScoreEngine.ts';
import { SAUDI_COUPONS } from '../data/saudiData.ts';

interface HakeemHomeViewProps {
  products: Product[];
  stores: Store[];
  onAddToCart: (productId: string) => void;
  cartProductIds: string[];
  onNavigateTab: (tab: any) => void;
  onSelectProductForChart?: (product: Product) => void;
  favorites?: string[];
  onToggleFavorite?: (productId: string) => void;
  onOpenVoiceAssistant?: () => void;
}

export const HakeemHomeView: React.FC<HakeemHomeViewProps> = ({
  products,
  stores,
  onAddToCart,
  cartProductIds,
  onNavigateTab,
  onSelectProductForChart,
  favorites = [],
  onToggleFavorite,
  onOpenVoiceAssistant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDealScoreItem, setSelectedDealScoreItem] = useState<{
    product: Product;
    storeId?: string;
  } | null>(null);
  const [showcaseDealId, setShowcaseDealId] = useState<string>('p1');

  const popularKeywords = [
    'أرز بسمتي',
    'زيت دوار الشمس',
    'حليب المراعي',
    'طبق بيض',
    'سكر الأسرة',
    'دجاج مبرد',
    'أريال',
    'شاي ربيع',
  ];

  // استخراج العروض والتخفيضات المميزة المرتّبة بمقياس قوة العرض (Deal Score) ونسب التوفير الأعلى
  const featuredDeals = useMemo(() => {
    const dealsList: Array<{
      product: Product;
      bestStore: Store;
      lowestPrice: number;
      highestPrice: number;
      savingSar: number;
      savingPercent: number;
      category: string;
      dealScore: ReturnType<typeof calculateLocalDealScore>;
    }> = [];

    products.forEach((prod) => {
      const validStorePrices: Array<{ storeId: string; price: number }> = [];
      Object.entries(prod.prices).forEach(([storeId, rawInfo]) => {
        const info = rawInfo as { priceInclVat: number; inStock: boolean };
        if (info && info.inStock) {
          validStorePrices.push({ storeId, price: info.priceInclVat });
        }
      });

      if (validStorePrices.length >= 2) {
        validStorePrices.sort((a, b) => a.price - b.price);
        const lowest = validStorePrices[0];
        const highest = validStorePrices[validStorePrices.length - 1];
        const savingSar = highest.price - lowest.price;
        const savingPercent = Math.round((savingSar / highest.price) * 100);

        const storeObj = stores.find((s) => s.id === lowest.storeId) || stores[0];

        if (savingPercent > 5) {
          const score = calculateLocalDealScore(prod, lowest.storeId, stores, SAUDI_COUPONS);
          dealsList.push({
            product: prod,
            bestStore: storeObj,
            lowestPrice: lowest.price,
            highestPrice: highest.price,
            savingSar,
            savingPercent,
            category: prod.category,
            dealScore: score,
          });
        }
      }
    });

    // الترتيب حسب مقياس قوة العرض (Deal Score) أولاً، ثم نسبة التوفير
    return dealsList.sort((a, b) => b.dealScore.overallScore - a.dealScore.overallScore);
  }, [products, stores]);

  const filteredDeals = useMemo(() => {
    return featuredDeals.filter((deal) => {
      const matchesSearch =
        !searchTerm ||
        deal.product.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.bestStore.name.includes(searchTerm);

      const matchesCat = selectedCategory === 'all' || deal.product.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [featuredDeals, searchTerm, selectedCategory]);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="space-y-8" id="hakeem-home-view">
      {/* Hero Banner الرئيسي لحكيم AI المستوحى من منصة alhkmystore مع شعار H الذهبي */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#3a280a] via-[#1f1606] to-[#0c0903] text-white p-6 sm:p-10 border border-amber-600/40 shadow-2xl">
        {/* توهجات ذهبية وخلفية فاخرة */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-12 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-72 h-72 rounded-full bg-yellow-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center space-y-5">
          {/* أيقونة شعار H الذهبي المجسم الفاخر */}
          <div className="pt-2 pb-1">
            <HkeemLogo size="hero" withGlow className="shadow-2xl shadow-amber-500/30 ring-1 ring-amber-400/30" />
          </div>

          {/* وسام HkeeemAI */}
          <div className="inline-flex items-center gap-2 bg-black/40 text-amber-300 border border-amber-500/40 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>HkeeemAI — وفّر أكثر… لا تدفع أكثر</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          </div>

          {/* العنوان المقتبس من الهوية البصرية */}
          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight space-y-1">
            <span className="block text-amber-100">تسوّق ذكي...</span>
            <span className="block text-amber-400">توفير أكثر</span>
          </h1>

          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
            نجمع كل العروض ونقارن الأسعار بين المتاجر السعودية لحظيًا — حتى تشتري نفس المنتج بأرخص سعر.
            <strong className="text-white block mt-1">مصلحتك أنت أولاً، لا المتجر.</strong>
          </p>

          {/* شريط البحث المباشر بأسلوب الهوية المطابقة للقطة الشاشة */}
          <div className="w-full pt-2">
            <div className="relative flex items-center bg-white rounded-full shadow-2xl p-1.5 focus-within:ring-2 focus-within:ring-amber-400 transition-all">
              <button
                type="button"
                onClick={() => onNavigateTab('matrix')}
                aria-label="بحث"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 active:scale-95 text-slate-950 flex items-center justify-center shrink-0 transition-all shadow-md touch-manipulation cursor-pointer"
              >
                <Search className="w-5 h-5 text-slate-950" />
              </button>

              <input
                id="hakeem-hero-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="اسأل حكيم: مثلاً «أرخص أرز بسمتي»، «حليب المراعي»..."
                className="w-full text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm px-3 py-2 focus:outline-hidden font-medium"
              />

              {/* زر التعرف الصوتي والأوامر الصوتية Web Speech API */}
              {onOpenVoiceAssistant && (
                <button
                  type="button"
                  id="hero-voice-search-btn"
                  onClick={onOpenVoiceAssistant}
                  className="flex items-center gap-1.5 px-3 py-1.5 mx-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all border border-amber-300 active:scale-95 cursor-pointer shadow-xs shrink-0"
                  title="الأوامر الصوتية بالذكاء الاصطناعي (Web Speech API) للبحث والإضافة للسلة"
                >
                  <Mic className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline">أمر صوتي</span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">Voice</span>
                </button>
              )}

              {/* زر البحث بصورة المنتج عبر Google Cloud Vision API */}
              <button
                type="button"
                onClick={() => onNavigateTab('image-search')}
                className="flex items-center gap-1.5 px-3 py-1.5 mx-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 active:scale-95 cursor-pointer shadow-xs shrink-0"
                title="البحث بصورة المنتج والتعرف البصري بالذكاء الاصطناعي (Google Cloud Vision API)"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">ابحث بصورة</span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">Vision</span>
              </button>

              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1 font-bold"
                >
                  مسح
                </button>
              ) : (
                <div className="px-3 text-amber-500">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
              )}
            </div>

            {/* الكلمات المفتاحية الشائعة */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs">
              <span className="text-amber-300/90 font-bold">شائع الآن:</span>
              {popularKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSearchTerm(kw)}
                  className="bg-black/30 hover:bg-amber-500/20 text-amber-200 hover:text-white px-3 py-1 rounded-full text-[11px] font-medium transition-all active:scale-95 border border-amber-500/30"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* أرقام وإحصائيات حكيم AI */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 border-t border-emerald-700/50 text-center sm:text-right">
            <div className="bg-emerald-950/50 rounded-xl p-3 border border-emerald-800/60 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">+65</div>
              <div className="text-[11px] sm:text-xs text-emerald-200 font-medium mt-0.5">متجرًا موثّقًا 🇸🇦</div>
            </div>
            <div className="bg-emerald-950/50 rounded-xl p-3 border border-emerald-800/60 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">60%</div>
              <div className="text-[11px] sm:text-xs text-emerald-200 font-medium mt-0.5">متوسط التوفير</div>
            </div>
            <div className="bg-emerald-950/50 rounded-xl p-3 border border-emerald-800/60 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-white font-mono">24/7</div>
              <div className="text-[11px] sm:text-xs text-emerald-200 font-medium mt-0.5">مساعد حكيم الذكي</div>
            </div>
          </div>
        </div>
      </div>

      {/* بوابات المنصة السريعة (استكشف HkeeemAI - كل أقسام المنصة في مكان واحد) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">استكشف خدمات HkeeemAI</h2>
            <p className="text-xs text-slate-500">كل أدوات التوفير ومقارنة الأسعار الذكية في مكان واحد</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
            تحديث لحظي
          </span>
        </div>

        {/* بانر ميزات الذكاء الاصطناعي والأتمتة والبحث بالصور الجديد */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div
            onClick={() => onNavigateTab('image-search')}
            className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-950 rounded-3xl p-5 text-white shadow-md cursor-pointer hover:shadow-lg transition-all border border-amber-600/50 flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Google Cloud Vision API</span>
              </div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>البحث الذكي بالصور</span>
                <span className="text-amber-400 text-xs">Vision AI</span>
              </h3>
              <p className="text-xs text-amber-100/80 max-w-sm">
                التقط أو ارفع صورة السلعة ليتعرف عليها الذكاء الاصطناعي فوراً ويجلب أرخص الأسعار!
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all flex items-center justify-center text-xl shrink-0">
              <Camera className="w-6 h-6 text-amber-300 group-hover:text-slate-950" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('quicklist')}
            className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-md cursor-pointer hover:shadow-lg transition-all border border-emerald-700/50 flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>ميزة سريعة</span>
              </div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>القائمة السريعة الذكية</span>
                <span className="text-amber-400 text-xs">QuickList</span>
              </h3>
              <p className="text-xs text-emerald-100/80 max-w-sm">
                اكتب أسماء مقاضيك مباشرة وسيقوم حكيم بمطابقتها فورياً مع قاعدة السلع وأرخص المتاجر!
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all flex items-center justify-center text-xl shrink-0">
              <ListPlus className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('bots')}
            className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md cursor-pointer hover:shadow-lg transition-all border border-indigo-700/50 flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                <Bot className="w-3 h-3 text-indigo-400" />
                <span>أتمتة ذكية ومجدولة</span>
              </div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>مركز البوتات الذكية</span>
                <span className="text-amber-400 text-xs">الشريطي والوسيط</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-sm">
                عروض وكالات السيارات (1:00 م)، الفرص العقارية المعتمدة (2:00 م)، ورادارات الكوبونات.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all flex items-center justify-center text-xl shrink-0">
              <Bot className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button
            onClick={() => onNavigateTab('quicklist')}
            className="p-3.5 rounded-2xl bg-emerald-50/60 border-2 border-emerald-500/30 hover:border-emerald-600 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <ListPlus className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight flex items-center gap-1">
              <span>القائمة السريعة</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">مطابقة مقاضيك بالاسم</div>
          </button>

          <button
            onClick={() => onNavigateTab('bots')}
            className="p-3.5 rounded-2xl bg-indigo-50/60 border-2 border-indigo-500/30 hover:border-indigo-600 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight flex items-center gap-1">
              <span>بوتات حكيم</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">سيارات، عقار، كوبونات</div>
          </button>

          <button
            onClick={() => onNavigateTab('cart')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">السلة الذكية</div>
            <div className="text-[10px] text-slate-500 mt-1">تقسيم المتاجر والتوفير</div>
          </button>

          <button
            onClick={() => onNavigateTab('matrix')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">مقارن الأسعار</div>
            <div className="text-[10px] text-slate-500 mt-1">نفس المنتج، أرخص متجر</div>
          </button>

          <button
            onClick={() => onNavigateTab('coupons')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">الكوبونات</div>
            <div className="text-[10px] text-slate-500 mt-1">أحدث الأكواد الفعّالة</div>
          </button>

          <button
            onClick={() => onNavigateTab('maps')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">خريطتي</div>
            <div className="text-[10px] text-slate-500 mt-1">أقرب الفروع والعروض</div>
          </button>

          <button
            onClick={() => onNavigateTab('chat')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">مساعد حكيم AI</div>
            <div className="text-[10px] text-slate-500 mt-1">اسأله بالعربي فورا</div>
          </button>

          <button
            onClick={() => onNavigateTab('shopping-times')}
            className="p-3.5 rounded-2xl bg-sky-50/60 border-2 border-sky-500/30 hover:border-sky-600 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight flex items-center gap-1">
              <span>أوقات التسوق</span>
              <span className="w-2 h-2 rounded-full bg-sky-500" />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">ساعات الهدوء والتقويم</div>
          </button>

          <button
            onClick={() => onNavigateTab('rewards')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-right group touch-manipulation active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-700 flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">جوائز ونقاط</div>
            <div className="text-[10px] text-slate-500 mt-1">مستويات التوفير الذكي</div>
          </button>
        </div>
      </div>

      {/* قسم مقياس قوة العرض (Deal Score Engine) التفاعلي */}
      {featuredDeals.length > 0 && (() => {
        const currentShowcase = featuredDeals.find((d) => d.product.id === showcaseDealId) || featuredDeals[0];
        return (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      مقياس قوة العرض (Deal Score)
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      1 - 10 نقاط بالذكاء الاصطناعي
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    تقييم تلقائي دقيق بناءً على: السعر التاريخي + أسعار المنافسين + توافر كوبونات إضافية
                  </p>
                </div>
              </div>

              {/* أزرار التبديل بين أهم العروض المعروضة */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-slate-400 font-bold whitespace-nowrap hidden md:inline">اختر للفحص:</span>
                {featuredDeals.slice(0, 5).map((d) => (
                  <button
                    key={d.product.id}
                    type="button"
                    onClick={() => setShowcaseDealId(d.product.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-manipulation cursor-pointer flex items-center gap-1.5 ${
                      currentShowcase.product.id === d.product.id
                        ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{d.product.imageUrl}</span>
                    <span>{d.product.nameAr.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-black">
                      {d.dealScore.overallScore}★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* بطاقة المقياس التفاعلي الشامل */}
            <DealScore
              product={currentShowcase.product}
              selectedStoreId={currentShowcase.bestStore.id}
              stores={stores}
              coupons={SAUDI_COUPONS}
              onAddToCart={onAddToCart}
              onOpenPriceHistory={onSelectProductForChart}
            />
          </div>
        );
      })()}

      {/* قسم أفضل العروض والخصومات المرتبة بالذكاء الاصطناعي */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                أفضل العروض المرتبة بالذكاء الاصطناعي
              </h2>
              <p className="text-xs text-slate-500">
                مرتبة حسب مقياس قوة العرض (Deal Score) وأكبر فوارق سعرية بين المتاجر السعودية
              </p>
            </div>
          </div>

          {/* تصفية التصنيفات */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap touch-manipulation ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'جميع العروض' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* شبكة بطاقات العروض */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => {
            const isInCart = cartProductIds.includes(deal.product.id);

            return (
              <div
                key={deal.product.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 p-4 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* رأس البطاقة: المتجر الأرخص + مقياس قوة العرض + نسبة الوفر */}
                  <div className="flex items-center justify-between gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      <span>{deal.bestStore.logo}</span>
                      <span>أرخص متجر: {deal.bestStore.name}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <DealScoreBadge
                        score={deal.dealScore.overallScore}
                        grade={deal.dealScore.grade}
                        onClick={() =>
                          setSelectedDealScoreItem({
                            product: deal.product,
                            storeId: deal.bestStore.id,
                          })
                        }
                      />
                      <span className="bg-rose-50 text-rose-700 text-xs font-black px-2 py-0.5 rounded-md border border-rose-200/60 font-mono">
                        وفر {deal.savingPercent}%
                      </span>
                    </div>
                  </div>

                  {/* تفاصيل السلعة */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <span className="text-3xl p-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
                      {deal.product.imageUrl}
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-snug">
                        {deal.product.nameAr}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {deal.product.unit} • <span className="text-emerald-700 font-medium">{deal.product.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* الأسعار المقارنة */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">أوفر سعر متاح:</span>
                      <div className="font-mono font-black text-emerald-700 text-base">
                        {deal.lowestPrice.toFixed(2)} <span className="text-xs font-sans">ر.س</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>السعر في المتجر الأعلى:</span>
                      <span className="line-through font-mono">{deal.highestPrice.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 text-emerald-800 font-bold">
                      <span>فرق التوفير الصافي:</span>
                      <span className="font-mono">{deal.savingSar.toFixed(2)} ر.س وفر بالقطعة</span>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات السريعة */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    id={`deal-add-btn-${deal.product.id}`}
                    onClick={() => onAddToCart(deal.product.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all touch-manipulation active:scale-95 ${
                      isInCart
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {isInCart ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-700" />
                        <span>في السلة (+1)</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>أضف للسلة الذكية</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDealScoreItem({
                        product: deal.product,
                        storeId: deal.bestStore.id,
                      })
                    }
                    className="py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors text-xs font-bold flex items-center gap-1.5 touch-manipulation active:scale-95 cursor-pointer"
                    title="فحص مقياس قوة العرض (Deal Score) بالذكاء الاصطناعي"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">مقياس العرض</span>
                  </button>

                  {onSelectProductForChart && (
                    <button
                      onClick={() => onSelectProductForChart(deal.product)}
                      className="py-2.5 px-3 rounded-xl border border-emerald-200/80 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors text-xs font-bold flex items-center gap-1.5 touch-manipulation active:scale-95 cursor-pointer"
                      title="عرض البدائل الصحية وسجل تاريخ الأسعار"
                      aria-label="عرض البدائل الصحية وسجل تاريخ الأسعار"
                    >
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">بدائل صحية</span>
                    </button>
                  )}

                  {onSelectProductForChart && (
                    <button
                      onClick={() => onSelectProductForChart(deal.product)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors touch-manipulation active:scale-95 cursor-pointer"
                      title="عرض سجل تاريخ تغير الأسعار"
                      aria-label="عرض سجل تاريخ تغير الأسعار"
                    >
                      <TrendingDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* لافتة الربط الرسمي مع المنصة alhkmystore.lovable.app والدعم */}
      <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HkeemLogo size="md" withGlow />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">منظومة حكيم AI المتكاملة للتوفير</h3>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                موثّق
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              تم دمج خواص <strong className="text-slate-800">alhkmystore.lovable.app</strong> (الخرائط، الكوبونات، الذكاء الاصطناعي، والسلة المقسمة) لخدمة المتسوق السعودي.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="mailto:support@alhkmy.store"
            className="text-xs bg-white hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            support@alhkmy.store
          </a>
          <button
            onClick={() => onNavigateTab('chat')}
            className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            مستشار حكيم AI
          </button>
        </div>
      </div>

      {/* نافذة تفاصيل مقياس قوة العرض (Deal Score Modal) */}
      <DealScoreModal
        isOpen={Boolean(selectedDealScoreItem)}
        onClose={() => setSelectedDealScoreItem(null)}
        product={selectedDealScoreItem?.product || null}
        selectedStoreId={selectedDealScoreItem?.storeId}
        stores={stores}
        coupons={SAUDI_COUPONS}
        onAddToCart={onAddToCart}
        onOpenPriceHistory={onSelectProductForChart}
      />
    </div>
  );
};
