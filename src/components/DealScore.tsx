import React, { useState, useEffect, useMemo } from 'react';
import { Product, Store, Coupon, DealScoreResult } from '../types.ts';
import { calculateLocalDealScore } from '../lib/dealScoreEngine.ts';
import { SAUDI_STORES, SAUDI_COUPONS } from '../data/saudiData.ts';
import {
  Sparkles,
  TrendingDown,
  Tag,
  Store as StoreIcon,
  CheckCircle,
  AlertTriangle,
  Flame,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  LineChart,
  X,
  Info,
  ChevronRight,
  Zap,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

interface DealScoreProps {
  product: Product;
  selectedStoreId?: string;
  stores?: Store[];
  coupons?: Coupon[];
  onAddToCart?: (productId: string) => void;
  onOpenPriceHistory?: (product: Product) => void;
  className?: string;
  mode?: 'full' | 'compact' | 'card';
}

/**
 * دالة مساعدة لتحديد تدرج الألوان حسب قوة العرض من 1 إلى 10
 */
export function getDealScoreColor(score: number): {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  progressColor: string;
  glowColor: string;
  level: string;
  emoji: string;
} {
  if (score >= 8.8) {
    return {
      bg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900',
      border: 'border-emerald-500/80',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      badgeText: 'text-emerald-300',
      progressColor: 'from-emerald-400 via-teal-300 to-green-500',
      glowColor: 'shadow-emerald-500/30',
      level: 'صفقة صائدة استثنائية (صيد ذهبي)',
      emoji: '⚡',
    };
  }
  if (score >= 7.5) {
    return {
      bg: 'bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950',
      border: 'border-teal-500/60',
      text: 'text-teal-400',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      badgeText: 'text-teal-300',
      progressColor: 'from-teal-400 to-emerald-500',
      glowColor: 'shadow-teal-500/20',
      level: 'عرض ممتاز وتوفير حقيقي',
      emoji: '✓',
    };
  }
  if (score >= 6.0) {
    return {
      bg: 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950',
      border: 'border-amber-500/60',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      badgeText: 'text-amber-300',
      progressColor: 'from-amber-400 to-yellow-500',
      glowColor: 'shadow-amber-500/20',
      level: 'عرض معتدل ومناسب',
      emoji: '⚖️',
    };
  }
  return {
    bg: 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    badgeText: 'text-rose-300',
    progressColor: 'from-rose-500 to-orange-400',
    glowColor: 'shadow-rose-500/20',
    level: 'عرض عادي / غير مؤثر',
    emoji: '⚠️',
  };
}

/**
 * مكون مقياس قوة العرض (Deal Score Gauge & Component)
 */
export const DealScore: React.FC<DealScoreProps> = ({
  product,
  selectedStoreId,
  stores = SAUDI_STORES,
  coupons = SAUDI_COUPONS,
  onAddToCart,
  onOpenPriceHistory,
  className = '',
  mode = 'full',
}) => {
  const [dealScore, setDealScore] = useState<DealScoreResult>(() =>
    calculateLocalDealScore(product, selectedStoreId, stores, coupons)
  );
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // تحديث التقييم عند تغيير المنتج أو المتجر، واستدعاء الخادم لتقييم الذكاء الاصطناعي
  useEffect(() => {
    // 1. حساب فوري غير متزامن محلياً
    const initial = calculateLocalDealScore(product, selectedStoreId, stores, coupons);
    setDealScore(initial);

    // 2. استدعاء API الذكاء الاصطناعي لتقييم معمق
    let isMounted = true;
    setIsLoadingAi(true);

    fetch('/api/deal-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        storeId: selectedStoreId,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setDealScore(data);
        }
      })
      .catch(() => {
        // الاعتماد على الحساب المحلي دون خطأ
      })
      .finally(() => {
        if (isMounted) setIsLoadingAi(false);
      });

    return () => {
      isMounted = false;
    };
  }, [product.id, selectedStoreId]);

  const colorConfig = getDealScoreColor(dealScore.overallScore);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  // زاوية ونسبة القوس في المقياس الدائري (1 إلى 10)
  const scorePercent = Math.min(100, Math.max(10, dealScore.overallScore * 10));

  if (mode === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${colorConfig.badgeBg} font-mono text-xs font-bold ${className}`}>
        <span className="text-sm">{colorConfig.emoji}</span>
        <span>قوة العرض:</span>
        <span className="text-sm font-black">{dealScore.overallScore} / 10</span>
        {dealScore.isAiGenerated && (
          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-sm">AI</span>
        )}
      </div>
    );
  }

  return (
    <div
      id={`deal-score-${product.id}`}
      className={`rounded-3xl p-5 sm:p-6 text-white border transition-all ${colorConfig.bg} ${colorConfig.border} shadow-xl ${colorConfig.glowColor} ${className}`}
    >
      {/* الرأس: شارة التقييم بالذكاء الاصطناعي */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                مقياس قوة العرض (Deal Score)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {dealScore.isAiGenerated ? 'Gemini AI مدعوم بـ' : 'خوارزمية حكيم الذكية'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              تقييم ذكي ثلاثي الأبعاد: السعر التاريخي + المنافسين + الكوبونات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 bg-black/40 px-3 py-1 rounded-xl border border-slate-700">
            {dealScore.storeLogo} {dealScore.storeName}
          </span>
          <span className="text-sm font-mono font-black text-amber-400 bg-black/50 px-3 py-1 rounded-xl border border-amber-500/30">
            {dealScore.dealPriceSar.toFixed(2)} ر.س
          </span>
        </div>
      </div>

      {/* لوحة العرض المركزية: الدائرة الرقمية + النتيجة والقرار */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-6">
        {/* المقياس الدائري التفاعلي */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-slate-800 relative">
          {/* دائرة النسبة */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* الخلفية الدائرية */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* مسار النسبة المتحرك */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * scorePercent) / 100}
                strokeLinecap="round"
                stroke="url(#dealScoreGradient)"
                fill="transparent"
              />
              <defs>
                <linearGradient id="dealScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>

            {/* الرقم داخل الدائرة */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {dealScore.overallScore}
              </span>
              <span className="text-[11px] font-bold text-slate-400 -mt-1">من 10</span>
            </div>
          </div>

          {/* الدرجة اللفظية */}
          <div className="mt-3 text-center">
            <div className={`text-xs font-black px-3 py-1 rounded-full border ${colorConfig.badgeBg}`}>
              {dealScore.grade}
            </div>
          </div>
        </div>

        {/* ملخص رأي الذكاء الاصطناعي وتوصية القرار */}
        <div className="md:col-span-8 space-y-3">
          <div className="bg-black/40 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                خلاصة قرار الذكاء الاصطناعي
              </span>
              {dealScore.shouldBuyNow ? (
                <span className="mr-auto inline-flex items-center gap-1 text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  اشترِ الآن
                </span>
              ) : (
                <span className="mr-auto inline-flex items-center gap-1 text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  تريّث أو انتظر
                </span>
              )}
            </div>

            <p className="text-sm font-black text-amber-200 leading-snug">
              «{dealScore.verdict}»
            </p>

            <p className="text-xs text-slate-300 leading-relaxed">
              {dealScore.aiAdvice}
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>التوقيت المثالي: <strong className="text-slate-200">{dealScore.bestTimeBuy}</strong></span>
              </span>
              <span className="text-emerald-400 font-bold">دقة التحليل: {dealScore.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* الركائز الثلاث للتقييم: السعر التاريخي + سعر المنافسين + الكوبونات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {/* 1. السعر التاريخي */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">1. السعر التاريخي</span>
              </div>
              <span className="font-mono text-sm font-black text-blue-400">
                {dealScore.historicalFactor.score} / 10
              </span>
            </div>

            {/* شريط التقدم */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${dealScore.historicalFactor.score * 10}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              {dealScore.historicalFactor.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>أدنى سعر مسجّل:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {dealScore.historicalFactor.historicalLowest.toFixed(2)} ر.س
              </span>
            </div>
            <div className="flex justify-between">
              <span>متوسط السعر:</span>
              <span className="font-mono text-slate-300">
                {dealScore.historicalFactor.historicalAvg.toFixed(2)} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* 2. أسعار المنافسين */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <StoreIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">2. سعر المنافسين</span>
              </div>
              <span className="font-mono text-sm font-black text-emerald-400">
                {dealScore.competitorFactor.score} / 10
              </span>
            </div>

            {/* شريط التقدم */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${dealScore.competitorFactor.score * 10}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              {dealScore.competitorFactor.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>المرتبة بالسوق:</span>
              <span className="font-bold text-emerald-300">
                {dealScore.competitorFactor.metric}
              </span>
            </div>
            <div className="flex justify-between">
              <span>وفر مقارنة بالأعلى:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {dealScore.competitorFactor.savingVsHighest.toFixed(2)} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* 3. الكوبونات الإضافية */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Tag className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">3. كوبونات إضافية</span>
              </div>
              <span className="font-mono text-sm font-black text-amber-400">
                {dealScore.couponFactor.score} / 10
              </span>
            </div>

            {/* شريط التقدم */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${dealScore.couponFactor.score * 10}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              {dealScore.couponFactor.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            {dealScore.couponFactor.couponCode ? (
              <div className="flex items-center justify-between gap-2 bg-amber-500/10 p-2 rounded-xl border border-amber-500/30">
                <div className="font-mono text-xs font-black text-amber-300">
                  {dealScore.couponFactor.couponCode}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(dealScore.couponFactor.couponCode!)}
                  className="flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-1 rounded-lg hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
                >
                  {copiedCoupon === dealScore.couponFactor.couponCode ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>انسخ الكود</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>الكوبون الفعال:</span>
                <span className="text-slate-500">لا يتوفر كود حالياً</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* شريط الإجراءات السريعة في أسفل المكون */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(product.id)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>أضف للسلة الذكية بهذا السعر</span>
            </button>
          )}

          {onOpenPriceHistory && (
            <button
              type="button"
              onClick={() => onOpenPriceHistory(product)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <LineChart className="w-3.5 h-3.5 text-emerald-400" />
              <span>سجل تاريخ الأسعار</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          * تم تحديث مؤشرات التقييم وفق الأسعار الرسمية الشاملة للضريبة 15%
        </div>
      </div>
    </div>
  );
};

/**
 * شارة مصغرة لـ Deal Score تعرض داخل بطاقات العروض والمنتجات مع زر سريع للفحص
 */
interface DealScoreBadgeProps {
  score: number;
  grade?: string;
  onClick?: () => void;
  className?: string;
  showDetailsText?: boolean;
}

export const DealScoreBadge: React.FC<DealScoreBadgeProps> = ({
  score,
  grade,
  onClick,
  className = '',
  showDetailsText = true,
}) => {
  const config = getDealScoreColor(score);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border shadow-2xs group cursor-pointer active:scale-95 ${config.badgeBg} ${className}`}
      title="انقر لعرض تفاصيل مقياس قوة العرض (Deal Score) المدعوم بالذكاء الاصطناعي"
    >
      <span className="text-amber-400 group-hover:scale-110 transition-transform">
        {config.emoji}
      </span>
      <span className="font-mono font-black">{score.toFixed(1)}</span>
      <span className="text-[10px] opacity-80">/ 10</span>
      {showDetailsText && (
        <span className="text-[10px] hidden sm:inline mr-1 opacity-90 border-r border-current pr-1.5">
          {grade || config.level}
        </span>
      )}
      <Sparkles className="w-3 h-3 text-amber-300 opacity-70 group-hover:opacity-100 animate-pulse" />
    </button>
  );
};

/**
 * نافذة منبثقة تفاعلية بالكامل لمقياس قوة العرض (Deal Score Modal)
 */
interface DealScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedStoreId?: string;
  stores?: Store[];
  coupons?: Coupon[];
  onAddToCart?: (productId: string) => void;
  onOpenPriceHistory?: (product: Product) => void;
}

export const DealScoreModal: React.FC<DealScoreModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedStoreId,
  stores = SAUDI_STORES,
  coupons = SAUDI_COUPONS,
  onAddToCart,
  onOpenPriceHistory,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-slate-950 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden animate-scale-up">
        {/* شريط الإغلاق */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1 bg-slate-800 rounded-xl">{product.imageUrl}</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">{product.nameAr}</h2>
              <span className="text-xs text-slate-400">{product.unit} • {product.category}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          <DealScore
            product={product}
            selectedStoreId={selectedStoreId}
            stores={stores}
            coupons={coupons}
            onAddToCart={onAddToCart}
            onOpenPriceHistory={onOpenPriceHistory}
          />
        </div>
      </div>
    </div>
  );
};
