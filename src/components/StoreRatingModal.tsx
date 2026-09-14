import React, { useState } from 'react';
import {
  X,
  Star,
  Truck,
  PackageCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Calculator,
  Send,
} from 'lucide-react';
import { Store, Product, StoreRatingMetrics } from '../types.ts';
import {
  calculateStoreRatingMetrics,
  saveUserStoreRating,
  getRatingColorClasses,
} from '../lib/storeRatingEngine.ts';

interface StoreRatingModalProps {
  store: Store | null;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRatingUpdated?: (storeId: string, updatedMetrics: StoreRatingMetrics) => void;
}

export const StoreRatingModal: React.FC<StoreRatingModalProps> = ({
  store,
  products,
  isOpen,
  onClose,
  onRatingUpdated,
}) => {
  if (!isOpen || !store) return null;

  // حساب التقييم المباشر
  const [metrics, setMetrics] = useState<StoreRatingMetrics>(() =>
    calculateStoreRatingMetrics(store.id, products)
  );

  // حالة نموذج التقييم من قِبل المستخدم
  const [userDeliveryRating, setUserDeliveryRating] = useState<number>(
    metrics.userRating?.deliverySpeed || 5
  );
  const [userAvailabilityRating, setUserAvailabilityRating] = useState<number>(
    metrics.userRating?.availability || 5
  );
  const [userComment, setUserComment] = useState<string>(
    metrics.userRating?.comment || ''
  );
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  const colorClasses = getRatingColorClasses(metrics.averageRating);

  // إرسال تقييم المستخدم
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveUserStoreRating(store.id, {
      deliverySpeed: userDeliveryRating,
      availability: userAvailabilityRating,
      comment: userComment,
    });
    setMetrics(updated);
    setIsSubmittedSuccess(true);
    if (onRatingUpdated) {
      onRatingUpdated(store.id, updated);
    }
    setTimeout(() => {
      setIsSubmittedSuccess(false);
    }, 4000);
  };

  // مساعد لاحتساب النجوم التفاعلية
  const renderInteractiveStars = (
    value: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= value;
          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => onChange(starIndex)}
              className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-hidden"
              title={`${starIndex} من 5`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 hover:text-amber-200'
                }`}
              />
            </button>
          );
        })}
        <span className="font-mono font-bold text-sm text-slate-700 mr-2">
          {value}.0 / 5
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس النافذة */}
        <div className="relative p-6 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl p-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              {store.logo}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  {store.name}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>متجر موثق</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {store.nameEn} • {store.branchesCount} فرعاً في المملكة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتوى التقييم والتحليل */}
        <div className="p-6 space-y-6">
          {/* بطاقة متوسط التقييم العام المشتق */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl p-5 border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>متوسط التقييم المعتمد بالمنصة</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-mono text-slate-900">
                    {metrics.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500 font-bold">من 5.0</span>
                  <div className="flex items-center gap-0.5 mr-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= Math.round(metrics.averageRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  يُحسب التقييم بموازنة دقيقة بين <strong className="text-slate-900">سرعة التوصيل</strong> و<strong className="text-slate-900">توفر السلع بالمخزون</strong>.
                </p>
              </div>

              {/* بطاقة المعادلة الحسابية */}
              <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200 shadow-2xs text-xs space-y-1.5 shrink-0 sm:min-w-[190px]">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                  <Calculator className="w-3.5 h-3.5 text-amber-600" />
                  <span>معادلة الاحتساب:</span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  (سرعة التوصيل + توفر المنتجات) ÷ 2
                </div>
                <div className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ({metrics.deliverySpeedRating.toFixed(1)} + {metrics.availabilityRating.toFixed(1)}) ÷ 2 = {metrics.averageRating.toFixed(1)} ⭐
                </div>
              </div>
            </div>
          </div>

          {/* الركيزتان الأساسيتان للتقييم */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* الركيزة 1: سرعة التوصيل */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">
                      سرعة التوصيل
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      زمن الإنجاز والشحن
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                  {metrics.deliverySpeedRating.toFixed(1)} / 5
                </span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.deliverySpeedRating / 5) * 100}%` }}
                />
              </div>

              <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span>{metrics.deliverySpeedLabel || store.deliveryTime}</span>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span>رسوم التوصيل الأساسية:</span>
                <span className="font-mono font-bold text-slate-800">
                  {store.deliveryFee} ر.س (مجاني &gt; {store.freeDeliveryThreshold} ر.س)
                </span>
              </div>
            </div>

            {/* الركيزة 2: توفر المنتجات */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">
                      توفر المنتجات
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      نسبة المخزون والسلع
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {metrics.availabilityRating.toFixed(1)} / 5
                </span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.availabilityRating / 5) * 100}%` }}
                />
              </div>

              <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
                <span>نسبة توفر الأصناف في الكتالوج:</span>
                <span className="font-bold font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {metrics.availabilityPercentage}% متوفر
                </span>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span>الحد الأدنى للطلب:</span>
                <span className="font-mono font-bold text-slate-800">
                  {store.minimumOrder === 0 ? 'لا يوجد حد أدنى' : `${store.minimumOrder} ر.س`}
                </span>
              </div>
            </div>
          </div>

          {/* نموذج تقييم المتجر بواسطة المستخدم */}
          <form
            onSubmit={handleSubmitRating}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <span>قيّم تجربة هذا المتجر بنفسك</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    مشارك
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  شارك تقييمك لسرعة التوصيل وتوفر المنتجات ليتم تحديث متوسط التقييم فوراً.
                </p>
              </div>

              {metrics.userRating && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-bold border border-emerald-200">
                  تم تقييمك سابقاً ✅
                </span>
              )}
            </div>

            {isSubmittedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم تسجيل تقييمك وتحديث متوسط التقييم لـ {store.name} بنجاح!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* تقييم سرعة التوصيل */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  تقييمك لسرعة التوصيل:
                </label>
                {renderInteractiveStars(userDeliveryRating, setUserDeliveryRating)}
              </div>

              {/* تقييم توفر المنتجات */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  تقييمك لتوفر المنتجات:
                </label>
                {renderInteractiveStars(userAvailabilityRating, setUserAvailabilityRating)}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ملاحظات إضافية (اختياري):
              </label>
              <input
                type="text"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="مثلاً: التوصيل جاء قبل الوقت المحدد والسلع طازجة ومكتملة..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>حفظ التقييم وتحديث المتوسط</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
