import React, { useState, useMemo } from 'react';
import { Product, Store, CartItem } from '../types.ts';
import {
  getHealthyAlternativesForProduct,
  calculateHealthySwapImpact,
  HealthyAlternative,
} from '../data/healthyAlternativesData.ts';
import {
  X,
  Sparkles,
  Heart,
  TrendingDown,
  TrendingUp,
  Check,
  CheckCircle,
  RefreshCw,
  ShoppingBag,
  Store as StoreIcon,
  Tag,
  AlertCircle,
  ShieldCheck,
  Scale,
  Leaf,
  LineChart as ChartIcon,
  Info,
} from 'lucide-react';
import { ProductPriceHistoryChart } from './ProductPriceHistoryChart.tsx';
import { DealScore, DealScoreBadge } from './DealScore.tsx';
import { calculateLocalDealScore } from '../lib/dealScoreEngine.ts';

interface ProductDetailModalProps {
  product: Product;
  products: Product[];
  stores: Store[];
  cart: CartItem[];
  onClose: () => void;
  onAddToCart: (productId: string, quantity?: number) => void;
  onSwapProductInCart?: (oldProductId: string, newProductId: string) => void;
  initialTab?: 'deal-score' | 'healthy' | 'chart' | 'stores';
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  products,
  stores,
  cart,
  onClose,
  onAddToCart,
  onSwapProductInCart,
  initialTab = 'deal-score',
}) => {
  const [activeTab, setActiveTab] = useState<'deal-score' | 'healthy' | 'chart' | 'stores'>(initialTab);
  const [swapSuccessToast, setSwapSuccessToast] = useState<string | null>(null);

  // البحث عما إذا كان هذا المنتج موجوداً بالسلة الحالية وكميته
  const cartItem = cart.find(c => c.productId === product.id);
  const isInCart = Boolean(cartItem);
  const cartQuantity = cartItem ? cartItem.quantity : 1;

  // جلب البدائل الصحية المخصصة لهذا المنتج
  const healthyAlternatives = useMemo(() => {
    return getHealthyAlternativesForProduct(product.id);
  }, [product.id]);

  // أقل سعر حالي للمنتج الأصلي
  const lowestPriceInfo = useMemo(() => {
    let lowest = Infinity;
    let storeName = '';
    let storeLogo = '🛒';

    stores.forEach(s => {
      const p = product.prices[s.id];
      if (p && p.inStock && p.priceInclVat < lowest) {
        lowest = p.priceInclVat;
        storeName = s.name;
        storeLogo = s.logo;
      }
    });

    return {
      price: lowest === Infinity ? 0 : lowest,
      storeName,
      storeLogo,
    };
  }, [product, stores]);

  // حساب مقياس قوة العرض للمنتج
  const dealScore = useMemo(() => {
    return calculateLocalDealScore(product);
  }, [product]);

  // تنفيذ استبدال المنتج بالبديل الصحي في السلة
  const handlePerformSwap = (alternative: HealthyAlternative) => {
    if (onSwapProductInCart) {
      onSwapProductInCart(product.id, alternative.id);
      setSwapSuccessToast(`تم بنجاح استبدال «${product.nameAr}» بالبديل الصحي «${alternative.nameAr}» في سلتك!`);
      setTimeout(() => setSwapSuccessToast(null), 4000);
    } else {
      // بديل احتياطي: إضافة البديل للسلة
      onAddToCart(alternative.id, cartQuantity);
      setSwapSuccessToast(`تمت إضافة «${alternative.nameAr}» إلى السلة!`);
      setTimeout(() => setSwapSuccessToast(null), 4000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      dir="rtl"
      id="product-detail-modal"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس تفاصيل المنتج */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-4xl p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs shrink-0">
              {product.imageUrl}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {product.category}
                </span>
                {isInCart && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>في سلتك (الكمية: {cartQuantity})</span>
                  </span>
                )}
                {product.barcode && (
                  <span className="text-[11px] font-mono text-slate-400">
                    باركود: {product.barcode}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {product.nameAr}
              </h2>
              <div className="text-xs text-slate-500 font-sans mt-0.5">
                {product.nameEn} • <span className="font-bold text-slate-700">{product.unit}</span>
              </div>
            </div>

            {/* بطاقة السعر الأدنى وإضافة السلة ومقياس قوة العرض */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <div className="text-right sm:text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">أقل سعر في السوق</span>
                  <DealScoreBadge
                    score={dealScore.overallScore}
                    grade={dealScore.grade}
                    onClick={() => setActiveTab('deal-score')}
                  />
                </div>
                <div className="text-lg font-black font-mono text-emerald-700">
                  {lowestPriceInfo.price.toFixed(2)} <span className="text-xs font-sans">ر.س</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  في {lowestPriceInfo.storeLogo} {lowestPriceInfo.storeName}
                </div>
              </div>

              <button
                onClick={() => onAddToCart(product.id)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isInCart
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isInCart ? 'زيادة بالسلة (+1)' : 'إضافة للسلة'}</span>
              </button>
            </div>
          </div>

          {/* شريط التبويبات الأربعة */}
          <div className="flex items-center gap-2 mt-5 border-t border-slate-200/80 pt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('deal-score')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'deal-score'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-400/40'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>مقياس قوة العرض (Deal Score)</span>
              <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black">
                {dealScore.overallScore}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('healthy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'healthy'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Leaf className="w-4 h-4 text-emerald-300" />
              <span>البدائل الصحية وتأثير السعر</span>
              {healthyAlternatives.length > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {healthyAlternatives.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chart')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ChartIcon className="w-4 h-4" />
              <span>سجل تاريخ الأسعار</span>
            </button>

            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'stores'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <StoreIcon className="w-4 h-4" />
              <span>مقارنة المتاجر</span>
            </button>
          </div>
        </div>

        {/* إشعار نجاح الاستبدال إن وُجد */}
        {swapSuccessToast && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{swapSuccessToast}</span>
          </div>
        )}

        {/* محتوى التبويبات */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* ========================================================= */}
          {/* 0. تبويب مقياس قوة العرض (Deal Score Engine بالذكاء الاصطناعي) */}
          {/* ========================================================= */}
          {activeTab === 'deal-score' && (
            <div className="space-y-5">
              <DealScore
                product={product}
                stores={stores}
                onAddToCart={onAddToCart}
                onOpenPriceHistory={() => setActiveTab('chart')}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. تبويب البدائل الصحية وتأثير السعر على السلة (الأساسي) */}
          {/* ========================================================= */}
          {activeTab === 'healthy' && (
            <div className="space-y-5">
              {/* بطاقة توجيهية عن البدائل الصحية وتأثيرها على السعر */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-4 text-white shadow-md flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-400/30">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-200">
                    نظام اقتراح البدائل الصحية الذكي لسلتك
                  </h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    يقترح لك التطبيق منتجات بديلة صحية مبنية على تصنيف السلعة (مثل: سكر أقل 0%، محليات نباتية، مكونات طبيعية غير مكررة، حبوب كاملة، ودهون أقل) مع حساب تأثير استبدالها على{' '}
                    <span className="font-black text-amber-300 underline underline-offset-2">
                      السعر الإجمالي الكلي لسلتك
                    </span>.
                  </p>
                </div>
              </div>

              {/* حالة المنتج في السلة الحالية */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700">
                    {isInCart ? (
                      <>
                        المنتج الأصلي <span className="font-bold text-slate-900">«{product.nameAr}»</span> موجود في سلتك الحالية (الكمية: <span className="font-bold text-emerald-700">{cartQuantity}</span>).
                      </>
                    ) : (
                      <>
                        المنتج الأصلي غير مضاف لسلتك حالياً — يمكنك إضافة البديل الصحي مباشرة لسلتك ومقارنة تكلفته.
                      </>
                    )}
                  </span>
                </div>

                {isInCart && (
                  <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                    متاح للاستبدال الفوري
                  </span>
                )}
              </div>

              {/* قائمة البدائل الصحية المتوفرة */}
              {healthyAlternatives.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>البدائل الصحية المقترحة لهذا المنتج ({healthyAlternatives.length}):</span>
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {healthyAlternatives.map(alt => {
                      // حساب الأثر المالي على السلة الكلية
                      const impact = calculateHealthySwapImpact(cart, products, product, alt);
                      const isAltAlreadyInCart = cart.some(c => c.productId === alt.id);

                      return (
                        <div
                          key={alt.id}
                          className="bg-white rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 p-4 sm:p-5 transition-all shadow-xs space-y-4"
                        >
                          {/* رأس بطاقة البديل */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="text-3xl p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
                                {alt.imageUrl}
                              </span>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Leaf className="w-3 h-3" />
                                    <span>{alt.healthBadgeText}</span>
                                  </span>

                                  {isAltAlreadyInCart && (
                                    <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                                      موجود بالسلة حالياً ✓
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm sm:text-base font-black text-slate-900">
                                  {alt.nameAr}
                                </h4>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {alt.unit} • {alt.nameEn}
                                </div>
                              </div>
                            </div>

                            {/* سعر البديل الصحي */}
                            <div className="text-right sm:text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100 shrink-0">
                              <div className="text-[10px] text-slate-400">أقل سعر للبديل</div>
                              <div className="font-mono font-black text-base text-emerald-700">
                                {impact.alternativePriceSar.toFixed(2)}{' '}
                                <span className="text-xs font-sans">ر.س</span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                شامل ضريبة القيمة المضافة 15%
                              </div>
                            </div>
                          </div>

                          {/* سبب الاختيار الصحي والمزايا الغذائية */}
                          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/70 space-y-2">
                            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>لماذا هذا البديل صحي أكثر؟</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {alt.summaryReason}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {alt.nutritionalHighlights.map((highlight, idx) => (
                                <div
                                  key={idx}
                                  className="text-[11px] text-emerald-800 flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded-lg border border-emerald-200/50"
                                >
                                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{highlight}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ======================================================== */}
                          {/* صندوق تحليل تأثير الاستبدال على سعر السلة الكلي فقط */}
                          {/* ======================================================== */}
                          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
                            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                                <Scale className="w-4 h-4" />
                                <span>تأثير اختيار هذا البديل على إجمالي سعر السلة:</span>
                              </span>
                              <span className="text-[11px] text-slate-400">
                                حساب فوري شامل الضريبة 15%
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              {/* فرق سعر السلعة المفردة */}
                              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                                <div className="text-[10px] text-slate-400">فرق سعر القطعة:</div>
                                <div className="font-mono font-bold text-sm mt-0.5">
                                  {impact.itemPriceDiffSar <= 0 ? (
                                    <span className="text-emerald-400">
                                      وفر {Math.abs(impact.itemPriceDiffSar).toFixed(2)} ر.س 🟢
                                    </span>
                                  ) : (
                                    <span className="text-amber-300">
                                      +{impact.itemPriceDiffSar.toFixed(2)} ر.س (فارق جودة)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  الأصل: {impact.currentProductPriceSar.toFixed(2)} ر.س
                                </div>
                              </div>

                              {/* سعر السلة الحالي */}
                              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                                <div className="text-[10px] text-slate-400">سعر السلة الحالي:</div>
                                <div className="font-mono font-bold text-sm mt-0.5 text-slate-200">
                                  {impact.currentCartTotalSar.toFixed(2)} ر.س
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {cart.length} سلع في السلة
                                </div>
                              </div>

                              {/* سعر السلة الجديد بعد استبدال البديل */}
                              <div className="bg-emerald-500/10 rounded-xl p-2.5 border border-emerald-500/30">
                                <div className="text-[10px] text-emerald-300 font-bold">
                                  سعر السلة الكلي الجديد:
                                </div>
                                <div className="font-mono font-black text-sm mt-0.5 text-white">
                                  {impact.newCartTotalSar.toFixed(2)} ر.س
                                </div>
                                <div className="text-[10px] mt-0.5 font-bold">
                                  {impact.isCheaperOverall ? (
                                    <span className="text-emerald-400">
                                      وفر إجمالي {Math.abs(impact.netCartDiffSar).toFixed(2)} ر.س في السلة 🎉
                                    </span>
                                  ) : impact.netCartDiffSar === 0 ? (
                                    <span className="text-slate-300">نفس تكلفة السلة الحالية</span>
                                  ) : (
                                    <span className="text-amber-300">
                                      فارق +{impact.netCartDiffSar.toFixed(2)} ر.س ({impact.percentageChange}%+)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* أزرار الإجراء السريع: الاستبدال أو الإضافة */}
                          <div className="flex items-center justify-end gap-2 pt-1">
                            {isInCart ? (
                              <button
                                onClick={() => handlePerformSwap(alt)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>استبدال في السلة بالبديل الصحي الآن</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onAddToCart(alt.id, 1)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  <span>إضافة البديل الصحي للسلة</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* في حال لم تكن هناك بدائل مخصصة في قاعدة البيانات لهذا المنتج تحديداً */
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                    🥗
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      نصيحة حكيم الصحية لتصنيف ({product.category})
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                      هذا المنتج يُعد خياراً أساسياً وممتازاً. ننصحك دائماً بمراجعة جدول المكونات
                      واختيار المنتجات ذات الصوديوم والسكريات المكررة الأقل، والاعتماد على العبوات الطبيعية 100%.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. تبويب سجل وتاريخ تغير الأسعار عبر Recharts */}
          {/* ========================================================= */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <ProductPriceHistoryChart
                product={product}
                stores={stores}
                onAddToCart={onAddToCart}
                isAlreadyInCart={isInCart}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. تبويب مقارنة أسعار المتاجر التفصيلي */}
          {/* ========================================================= */}
          {activeTab === 'stores' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">المتجر</th>
                      <th className="py-3 px-3 text-center">السعر شامل الضريبة 15%</th>
                      <th className="py-3 px-3 text-center">حالة التوفر</th>
                      <th className="py-3 px-3 text-center">مدة التوصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stores.map(store => {
                      const pInfo = product.prices[store.id];
                      const isLowest = pInfo && pInfo.inStock && pInfo.priceInclVat === lowestPriceInfo.price;

                      return (
                        <tr key={store.id} className={isLowest ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{store.logo}</span>
                              <div>
                                <div className="font-bold text-slate-900">{store.name}</div>
                                <div className="text-[10px] text-slate-400">{store.nameEn}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            {pInfo && pInfo.inStock ? (
                              <div
                                className={`inline-block py-1 px-2.5 rounded-lg font-mono font-bold ${
                                  isLowest
                                    ? 'bg-emerald-600 text-white font-black'
                                    : 'text-slate-800 bg-slate-100'
                                }`}
                              >
                                {pInfo.priceInclVat.toFixed(2)} ر.س
                                {pInfo.isPromo && (
                                  <span className="block text-[9px] font-sans text-rose-500 font-bold">
                                    عرض ترويجي
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                غير متوفر
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {pInfo?.inStock ? (
                              <span className="text-emerald-700 font-bold">متوفر بالمخزون</span>
                            ) : (
                              <span className="text-slate-400">نفد من المتجر</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center text-slate-500 text-[11px]">
                            {store.deliveryTime}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
