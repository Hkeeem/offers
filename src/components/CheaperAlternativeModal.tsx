import React, { useState } from 'react';
import { Product, Store, CartItem, PriceAlertNotification } from '../types.ts';
import {
  findCheaperAlternativesForNotification,
  CheaperAlternativeOption,
} from '../lib/cheaperAlternativeFinder.ts';
import {
  X,
  Sparkles,
  ShoppingBag,
  ArrowLeftRight,
  TrendingDown,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Leaf,
  Store as StoreIcon,
  ChevronLeft,
} from 'lucide-react';

interface CheaperAlternativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: PriceAlertNotification | null;
  products: Product[];
  stores: Store[];
  cart: CartItem[];
  onAddToCart: (productId: string) => void;
  onSwapProductInCart?: (oldProductId: string, newProductId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CheaperAlternativeModal: React.FC<CheaperAlternativeModalProps> = ({
  isOpen,
  onClose,
  notification,
  products,
  stores,
  cart,
  onAddToCart,
  onSwapProductInCart,
  onNavigateTab,
}) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !notification) return null;

  const analysis = findCheaperAlternativesForNotification(
    notification,
    products,
    stores,
    cart
  );

  const selectedOption = analysis.options[selectedOptionIndex] || analysis.recommendedOption;
  const isOriginalItemInCart = cart.some((c) => c.productId === notification.productId);
  const isAlternativeInCart = selectedOption
    ? cart.some((c) => c.productId === selectedOption.productId)
    : false;

  const handleAddToCart = (productId: string, productName: string) => {
    onAddToCart(productId);
    setActionSuccessMessage(`تمت إضافة «${productName}» إلى سلة المشتريات بنجاح! 🛒`);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 2500);
  };

  const handleSwap = (oldId: string, newId: string, newName: string) => {
    if (onSwapProductInCart) {
      onSwapProductInCart(oldId, newId);
      setActionSuccessMessage(`تم استبدال السلعة بـ «${newName}» في السلة وتوفير الفرق! ⚡`);
      setTimeout(() => {
        setActionSuccessMessage(null);
        onClose();
      }, 1600);
    } else {
      onAddToCart(newId);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-right">
        {/* رأس النافذة المنبثقة */}
        <div className="bg-gradient-to-l from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Zap className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  اقتراح البديل الأوفر والصفقة الأفضل
                </h3>
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  حكيم AI
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                فحص فوري للبدائل الأرخص والمتاجر المنافسة في السوق السعودي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* رسالة نجاح الإجراء اللحظية */}
        {actionSuccessMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* مقارنة السلعة الحالية بالبديل الأرخص */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* بطاقة السلعة الأصلية في التنبيه */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-bold mb-1.5">
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    سلعة التنبيه الحالية
                  </span>
                  <span className="flex items-center gap-1">
                    <span>{notification.storeLogo}</span>
                    <span>{notification.storeName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    {notification.productImage}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {notification.productName}
                    </h4>
                    <div className="text-[10px] text-slate-400 line-through mt-0.5">
                      قبل الهبوط: {notification.oldPriceSar.toFixed(2)} ر.س
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200 flex items-center justify-between text-right">
                <span className="text-xs font-bold text-slate-700">السعر بالتنبيه:</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {notification.newPriceSar.toFixed(2)} ر.س
                </span>
              </div>
            </div>

            {/* بطاقة البديل الأوفر المقترح */}
            {selectedOption && (
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-2xl p-3.5 border border-emerald-300 shadow-xs flex flex-col justify-between space-y-2.5 relative">
                <div className="absolute -top-2.5 left-3">
                  <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    أوفر بـ {selectedOption.savingsSar.toFixed(2)} ر.س
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md border ${selectedOption.badgeColor}`}>
                      {selectedOption.badgeTitle}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <span>{selectedOption.storeLogo}</span>
                      <span>{selectedOption.storeName}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                      {selectedOption.productImage}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        {selectedOption.title}
                      </h4>
                      {selectedOption.unit && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {selectedOption.unit}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-emerald-200 flex items-center justify-between text-right">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block">السعر الأوفر</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {selectedOption.alternativePriceSar.toFixed(2)} ر.س
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-rose-600 font-bold block">وفر إضافي</span>
                    <span className="text-xs font-black text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded-md">
                      -{selectedOption.savingsPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* تفاصيل القيمة والفائدة الذكية للبديل المختار */}
          {selectedOption && (
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>تحليل حكيم AI للبديل:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedOption.subtitle}
              </p>

              {selectedOption.isHealthBenefit && selectedOption.healthBenefitBadge && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg mt-1 border border-emerald-200">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedOption.healthBenefitBadge}</span>
                </div>
              )}
            </div>
          )}

          {/* تبديل بين البدائل المتاحة إن وجدت أكثر من خيار */}
          {analysis.options.length > 1 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700">خيارات بديلة إضافية رصدها النظام:</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {analysis.options.map((opt, idx) => (
                  <button
                    key={opt.productId + opt.storeName + idx}
                    onClick={() => setSelectedOptionIndex(idx)}
                    className={`text-right p-2 rounded-xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                      selectedOptionIndex === idx
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{opt.productImage}</span>
                      <span className="truncate max-w-[140px]">{opt.productName}</span>
                    </div>
                    <div className="text-[10px] mt-1 opacity-90">
                      {opt.alternativePriceSar.toFixed(2)} ر.س ({opt.storeName.split(' ')[0]})
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات السريعة في أسفل النافذة */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
          {/* زر 1: استبدال في السلة إن كانت السلعة الأصلية موجودة */}
          {isOriginalItemInCart && selectedOption && selectedOption.canSwapInCart && (
            <button
              onClick={() =>
                handleSwap(notification.productId, selectedOption.productId, selectedOption.productName)
              }
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs sm:text-sm font-black transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-emerald-200" />
              <span>استبدال بالسلة وتوفير الفرق</span>
            </button>
          )}

          {/* زر 2: إضافة البديل الأرخص للسلة مباشرة */}
          {selectedOption && (
            <button
              onClick={() =>
                handleAddToCart(selectedOption.productId, selectedOption.productName)
              }
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isAlternativeInCart
                  ? 'موجود بالسلة (+1 إضافي)'
                  : 'أضف البديل الأوفر للسلة'}
              </span>
            </button>
          )}

          {/* زر 3: إضافة السلعة الأصلية بسعر التنبيه إن رغب المستخدم بها */}
          <button
            onClick={() => handleAddToCart(notification.productId, notification.productName)}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="إضافة السلعة الحالية بسعر التنبيه المخفض"
          >
            <span>أضف الأصلية ({notification.newPriceSar.toFixed(2)} ر.س)</span>
          </button>

          {/* زر 4: فتح مصفوفة مقارنة المتاجر */}
          <button
            onClick={() => {
              onClose();
              onNavigateTab('matrix');
            }}
            className="w-full sm:w-auto p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="عرض مصفوفة الأسعار للمتاجر"
          >
            <StoreIcon className="w-4 h-4" />
            <span className="sm:hidden">مصفوفة الأسعار</span>
          </button>
        </div>
      </div>
    </div>
  );
};
