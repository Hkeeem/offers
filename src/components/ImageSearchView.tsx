import React, { useState, useRef, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  TrendingDown,
  ArrowUpDown,
  ExternalLink,
  Store as StoreIcon,
  RefreshCw,
  ShieldCheck,
  Zap,
  Tag,
  Leaf,
  LineChart,
  Eye,
  Sliders,
  ChevronRight,
  Maximize2,
  Scan,
  Info,
} from 'lucide-react';
import { Product, Store, ImageSearchResponse, MatchedProductPriceAnalysis, CartItem } from '../types.ts';
import { SAMPLE_GROCERY_IMAGES, SampleGroceryImage } from '../data/sampleImagesData.ts';
import { ProductDetailModal } from './ProductDetailModal.tsx';
import { DealScoreBadge } from './DealScore.tsx';
import { calculateLocalDealScore } from '../lib/dealScoreEngine.ts';
import { HkeemLogo } from './HkeemLogo.tsx';

interface ImageSearchViewProps {
  products: Product[];
  stores: Store[];
  cart: CartItem[];
  onAddToCart: (productId: string, quantity?: number) => void;
  onSwapProductInCart?: (oldProductId: string, newProductId: string) => void;
  onNavigateTab: (tab: any) => void;
}

/**
 * دالة مساعدة لتصغير وضغط الصورة عبر HTML5 Canvas لتقليص حجم البايلود إلى أقل من 250 كيلوبايت
 * وتحقيق سرعة استجابة فائقة عند استدعاء Google Cloud Vision API
 */
async function compressImageForVision(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // تحويل إلى JPEG بجودة 0.85 المثالية لـ Google Cloud Vision OCR
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const ImageSearchView: React.FC<ImageSearchViewProps> = ({
  products,
  stores,
  cart,
  onAddToCart,
  onSwapProductInCart,
  onNavigateTab,
}) => {
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressText, setAnalysisProgressText] = useState('جاهز للفحص');
  const [searchResult, setSearchResult] = useState<ImageSearchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // إرسال الصورة إلى مسار الخادم POST /api/image-search
  const executeImageAnalysis = async (imageDataUrl: string, sampleHintId?: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisProgressText('الاتصال بخدمة Google Cloud Vision API...');

    try {
      // محاكاة مراحل المعالجة السريعة بصرياً لتجربة مستخدم ممتازة
      const t1 = setTimeout(() => setAnalysisProgressText('تحليل النصوص والباركود (OCR Detection)...'), 250);
      const t2 = setTimeout(() => setAnalysisProgressText('التعرف على الشعار والعلامة التجارية (Logo Analysis)...'), 500);
      const t3 = setTimeout(() => setAnalysisProgressText('مطابقة الكتالوج وحساب أفضل الأسعار في المتاجر...'), 750);

      const response = await fetch('/api/image-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
          targetProductId: sampleHintId,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      if (!response.ok) {
        throw new Error(`خطأ في استجابة الخادم (${response.status})`);
      }

      const data: ImageSearchResponse = await response.json();
      setSearchResult(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء فحص الصورة');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgressText('تم اكتمال الفحص');
    }
  };

  // معالجة اختيار ملف من القرص أو الكاميرا
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setAnalysisProgressText('ضغط وتجهيز الصورة بسرعة فائقة...');
      const optimizedDataUrl = await compressImageForVision(file);
      setSelectedImageDataUrl(optimizedDataUrl);
      await executeImageAnalysis(optimizedDataUrl);
    } catch (err) {
      setErrorMessage('تعذر قراءة ملف الصورة');
      setIsAnalyzing(false);
    }
  };

  // معالجة السحب والإفلات (Drag and Drop)
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setAnalysisProgressText('ضغط وتجهيز الصورة بسرعة فائقة...');
      const optimizedDataUrl = await compressImageForVision(file);
      setSelectedImageDataUrl(optimizedDataUrl);
      await executeImageAnalysis(optimizedDataUrl);
    } catch (err) {
      setErrorMessage('تعذر قراءة ملف الصورة المسقطة');
      setIsAnalyzing(false);
    }
  };

  // تجربة عينة جاهزة من السوبرماركت السعودي
  const handleSelectSample = async (sample: SampleGroceryImage) => {
    setSelectedImageDataUrl(sample.imageUrl);
    await executeImageAnalysis(sample.imageUrl, sample.targetProductId);
  };

  const handleAddToCartWithFeedback = (prodId: string) => {
    onAddToCart(prodId, 1);
    setAddedProductId(prodId);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const identified = searchResult?.identifiedProduct;
  const vision = searchResult?.visionDetails;

  return (
    <div className="space-y-6" id="image-search-container" dir="rtl">
      {/* نافذة تفاصيل المنتج والبدائل الصحية وسجل الأسعار التفاعلية */}
      {activeDetailProduct && (
        <ProductDetailModal
          product={activeDetailProduct}
          products={products}
          stores={stores}
          cart={cart}
          onClose={() => setActiveDetailProduct(null)}
          onAddToCart={onAddToCart}
          onSwapProductInCart={onSwapProductInCart}
        />
      )}

      {/* مدخلات الملف المخفية */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/webp, image/jpg"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* بطاقة الرأس والتعريف بميزة البحث البصري بالذكاء الاصطناعي */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white p-6 sm:p-8 border border-emerald-700/40 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>مدعوم بـ Google Cloud Vision API</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>البحث الذكي بصورة المنتج</span>
              <Camera className="w-7 h-7 text-amber-400" />
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              ارفع صورة أي منتج أو التقطها بكاميرا جوالك، وسيتعرف الذكاء الاصطناعي على السلعة فوراً،
              ليجلب لك <strong>أرخص الأسعار والعروض الترويجية</strong> بين المتاجر السعودية (بنده، العثيم، الدانوب، كارفور، أمازون ولولو).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs sm:text-sm hover:from-amber-400 hover:to-amber-300 shadow-md active:scale-95 transition-all cursor-pointer"
              title="التقاط صورة بكاميرا الجوال"
            >
              <Camera className="w-4 h-4" />
              <span>التقاط بالكاميرا</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
              title="رفع صورة من الجهاز"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>رفع صورة</span>
            </button>
          </div>
        </div>
      </div>

      {/* منطقة رفع وسحب الصور + خيارات التجربة السريعة */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* منطقة السحب والإسقاط والمعاينة */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all min-h-[340px] bg-white ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-emerald-400 shadow-xs'
            }`}
          >
            {selectedImageDataUrl ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                {/* حاوية الصورة مع خط المسح الليزري أثناء المعالجة */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 max-h-[260px] max-w-[280px] bg-slate-900 flex items-center justify-center">
                  <img
                    src={selectedImageDataUrl}
                    alt="معاينة المنتج"
                    className="max-h-[260px] w-auto object-contain"
                  />

                  {/* تأثير المسح الضوئي الليزري أثناء التحليل */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex flex-col justify-start">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#fbbf24] animate-[bounce_1.4s_infinite]" />
                      <div className="m-auto bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
                        <Scan className="w-3.5 h-3.5 animate-spin" />
                        <span>{analysisProgressText}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>تغيير الصورة</span>
                  </button>

                  <button
                    onClick={() => executeImageAnalysis(selectedImageDataUrl)}
                    disabled={isAnalyzing}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>إعادة الفحص الآن</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">اسحب صورة المنتج وأفلتها هنا</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    أو اضغط لاختيار صورة من جهازك، أو التقط صورة مباشرة للعبوة أو الباركود
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>تصفح الصور</span>
                  </button>

                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span>التقاط بالكاميرا</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 pt-1">يدعم صيغ JPG، PNG، WEBP حتى 25 ميجابايت</div>
              </div>
            )}
          </div>

          {/* قائمة العينات الجاهزة للتجربة السريعة بنقرة واحدة */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  جرّب بنماذج جاهزة من السوبرماركت 🇸🇦
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">نقرة واحدة للفحص</span>
            </div>

            <p className="text-xs text-slate-500">
              اختر أي عينة من أشهر المنتجات السعودية لتجربة تحليل Google Cloud Vision ومقارنة الأسعار فوراً:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {SAMPLE_GROCERY_IMAGES.map((sample) => {
                const isSelected = selectedImageDataUrl === sample.imageUrl;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    disabled={isAnalyzing}
                    className={`p-2 rounded-2xl border text-right transition-all flex flex-col items-start gap-1.5 touch-manipulation cursor-pointer group ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center p-1 border border-slate-100">
                      <img
                        src={sample.imageUrl}
                        alt={sample.titleAr}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="w-full space-y-0.5">
                      <div className="text-[10px] font-bold text-emerald-700 truncate">{sample.badge}</div>
                      <div className="text-xs font-bold text-slate-900 truncate" title={sample.titleAr}>
                        {sample.titleAr}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{sample.brand}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* منطقة نتائج التعرف ومقارنة الأسعار */}
        <div className="lg:col-span-7 space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                <Scan className="w-7 h-7 text-emerald-700 absolute inset-0 m-auto" />
              </div>

              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-slate-900">جاري مسح وتحليل الصورة بالذكاء الاصطناعي...</h3>
                <p className="text-xs text-emerald-700 font-medium animate-pulse">{analysisProgressText}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Google Cloud Vision API
                </span>
                <span>•</span>
                <span>مطابقة 6 متاجر سعودية</span>
              </div>
            </div>
          )}

          {!isAnalyzing && identified && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* بطاقة تعريف المنتج والتعرف البصري */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>دقة التعرف: {identified.confidenceScore}%</span>
                    </span>

                    {vision && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {vision.provider === 'google_cloud_vision'
                          ? 'Google Cloud Vision API'
                          : vision.provider === 'gemini_multimodal'
                          ? 'Gemini Multimodal Vision'
                          : 'تحليل بصري هجين'}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    سرعة المعالجة: {vision?.executionTimeMs || 420} مللي ثانية
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-inner border border-slate-200">
                      {identified.product.imageUrl}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700">{identified.product.category}</span>
                        {(() => {
                          const dealScore = calculateLocalDealScore(identified.product, identified.cheapestStore.id, stores);
                          return (
                            <DealScoreBadge
                              score={dealScore.overallScore}
                              grade={dealScore.grade}
                              onClick={() => setActiveDetailProduct(identified.product)}
                            />
                          );
                        })()}
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {identified.product.nameAr}
                      </h2>
                      <div className="text-xs text-slate-500 font-medium">{identified.product.nameEn}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5">
                        <span className="font-bold text-slate-700">{identified.product.unit}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">باركود: {identified.product.barcode}</span>
                      </div>
                    </div>
                  </div>

                  {/* أزرار الإجراءات السريعة للمنتج */}
                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleAddToCartWithFeedback(identified.product.id)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs ${
                        addedProductId === identified.product.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{addedProductId === identified.product.id ? 'تمت الإضافة للسلة ✓' : 'أضف للسلة'}</span>
                    </button>

                    <button
                      onClick={() => setActiveDetailProduct(identified.product)}
                      className="w-full sm:w-auto px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="فحص مقياس قوة العرض (Deal Score)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>مقياس العرض</span>
                    </button>

                    <button
                      onClick={() => setActiveDetailProduct(identified.product)}
                      className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      <span>البدائل الصحية</span>
                    </button>
                  </div>
                </div>

                {/* مؤشرات ورؤى Google Cloud Vision المستخرجة */}
                {vision && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Scan className="w-3 h-3 text-slate-400" />
                      <span>بيانات الرؤية الحاسوبية المستخرجة (Cloud Vision Signals):</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {vision.detectedLogos.length > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                          الشعار: {vision.detectedLogos.join(', ')}
                        </span>
                      )}

                      {vision.labels.slice(0, 4).map((lbl, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {lbl.description} ({Math.round(lbl.score * 100)}%)
                        </span>
                      ))}

                      {identified.matchReason && (
                        <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg font-medium border border-emerald-100">
                          {identified.matchReason}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ملخص أرخص متجر ومقدار التوفير الإجمالي */}
              <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 p-5 border border-amber-300/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shadow-md font-black">
                    🏆
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-900">أرخص متجر سعودي لهذا المنتج حالياً:</div>
                    <div className="text-lg font-black text-slate-950 flex items-center gap-2">
                      <span>{identified.cheapestStore.name}</span>
                      <span className="text-emerald-700 font-mono">
                        {identified.lowestPriceSar.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xs rounded-2xl px-4 py-2.5 border border-amber-200 text-right sm:text-left">
                  <div className="text-[11px] text-slate-500 font-medium">وفر يصل إلى:</div>
                  <div className="text-base font-black text-emerald-700 font-mono">
                    {identified.savingsVsHighestSar.toFixed(2)} ر.س ({identified.savingsPercentage}%)
                  </div>
                  <div className="text-[10px] text-slate-400">مقارنة بأعلى سعر في السوق</div>
                </div>
              </div>

              {/* جدول مقارنة الأسعار التفصيلية بين المتاجر السعودية الستة */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      مقارنة الأسعار اللحظية بين المتاجر السعودية 🇸🇦
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">شامل الضريبة 15%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {identified.storePrices.map((sp) => (
                    <div
                      key={sp.storeId}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        sp.isCheapest
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sp.storeLogo}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">{sp.storeName}</span>
                            {sp.isCheapest && (
                              <span className="text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-md">
                                الأرخص 🏆
                              </span>
                            )}
                            {sp.isPromo && (
                              <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-md">
                                عرض ترويجي
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            توصيل: {sp.deliveryFee} ر.س (مجاني فوق {sp.freeDeliveryThreshold} ر.س)
                          </div>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-sm sm:text-base font-black text-slate-900 font-mono">
                          {sp.priceInclVat.toFixed(2)} ر.س
                        </div>
                        {sp.differenceFromCheapestSar > 0 ? (
                          <div className="text-[10px] text-rose-600 font-bold">
                            + {sp.differenceFromCheapestSar.toFixed(2)} ر.س
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-700 font-bold">السعر الأفضل</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>جميع الأسعار مطابقة لأنظمة هيئة الزكاة والضريبة والجمارك (ZATCA) وشاملة 15% VAT.</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('matrix')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-xs whitespace-nowrap cursor-pointer"
                  >
                    عرض في مصفوفة المقارنة ←
                  </button>
                </div>
              </div>

              {/* البدائل الصحية المقترحة لهذا المنتج */}
              {identified.healthyAlternatives && identified.healthyAlternatives.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl p-5 border border-emerald-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-sm font-black text-emerald-950">
                        بدائل صحية ذكية مقترحة لهذا المنتج 🥗
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveDetailProduct(identified.product)}
                      className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      تأثير السعر على السلة ←
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {identified.healthyAlternatives.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-3 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{alt.nameAr}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {alt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{alt.reason}</p>
                        <div className="text-[11px] font-mono text-slate-700 font-bold flex items-center justify-between pt-1 border-t border-slate-100">
                          <span>أقل سعر متوفر:</span>
                          <span className="text-emerald-700">{alt.lowestPriceSar.toFixed(2)} ر.س</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* خيارات ومنتجات بديلة رصدتها الرؤية الحاسوبية */}
              {searchResult?.alternativeMatches && searchResult.alternativeMatches.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    أصناف أخرى مشابهة رصدتها الرؤية الحاسوبية:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {searchResult.alternativeMatches.map((alt) => (
                      <div
                        key={alt.product.id}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="text-xl mb-1">{alt.product.imageUrl}</div>
                          <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {alt.product.nameAr}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{alt.product.unit}</div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-xs font-black text-emerald-700 font-mono">
                            من {alt.lowestPriceSar.toFixed(2)} ر.س
                          </span>
                          <button
                            onClick={() => handleAddToCartWithFeedback(alt.product.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold cursor-pointer"
                            title="إضافة للسلة"
                          >
                            + سلة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isAnalyzing && !identified && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-slate-800">بانتظار صورتك لبدء الفحص</h3>
                <p className="text-xs text-slate-500">
                  اختر صورة من جهازك، التقط صورة للسلعة، أو اضغط على أي نموذج جاهز في القائمة الجانبية.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer shadow-xs"
                >
                  رفع صورة الآن
                </button>
                <button
                  onClick={() => handleSelectSample(SAMPLE_GROCERY_IMAGES[0])}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  تجربة حليب المراعي 2 لتر 🥛
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* نافذة التفاصيل والمقارنة الشاملة ومقياس قوة العرض والبدائل الصحية */}
      {activeDetailProduct && (
        <ProductDetailModal
          product={activeDetailProduct}
          products={products}
          stores={stores}
          cart={cart}
          onClose={() => setActiveDetailProduct(null)}
          onAddToCart={onAddToCart}
          onSwapProductInCart={onSwapProductInCart}
          initialTab="deal-score"
        />
      )}
    </div>
  );
};
