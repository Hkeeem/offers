import React, { useEffect } from 'react';
import { PriceAlertNotification } from '../types.ts';
import { Bell, ShoppingBag, X, TrendingDown, ExternalLink, Zap } from 'lucide-react';

interface PriceAlertToastProps {
  notification: PriceAlertNotification | null;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
  onViewAlerts: () => void;
  onViewCheaperAlternative?: (notification: PriceAlertNotification) => void;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
  notification,
  onClose,
  onAddToCart,
  onViewAlerts,
  onViewCheaperAlternative,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 7500);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-5 left-5 z-50 max-w-md w-full sm:w-[420px] bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-4 animate-in slide-in-from-bottom-5 duration-300"
      id="price-alert-toast"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* أيقونة التنبيه النابضة */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-emerald-700" />
                تنبيه هبوط السعر!
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {notification.source === 'cart' ? 'سلعة بسلتك 🛒' : 'في المفضلة ❤️'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">{notification.productImage}</span>
              <h4 className="text-xs font-black text-slate-900 truncate">
                {notification.productName}
              </h4>
            </div>

            <div className="text-xs text-slate-600 mt-1">
              في <strong className="text-slate-900">{notification.storeName}</strong>: انخفض من{' '}
              <span className="line-through text-slate-400 font-mono">
                {notification.oldPriceSar.toFixed(2)} ر.س
              </span>{' '}
              إلى{' '}
              <span className="text-emerald-700 font-black font-mono text-sm">
                {notification.newPriceSar.toFixed(2)} ر.س
              </span>
            </div>

            <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
              وفر صافي: {notification.savingSar.toFixed(2)} ر.س ({notification.savingPercent.toFixed(1)}%)
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="إغلاق التنبيه"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* أزرار الإجراء السريع */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
        <button
          onClick={() => {
            onAddToCart(notification.productId);
            onClose();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>أضف للسلة</span>
        </button>

        {onViewCheaperAlternative && (
          <button
            onClick={() => {
              onViewCheaperAlternative(notification);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>البديل الأرخص</span>
          </button>
        )}

        <button
          onClick={() => {
            onViewAlerts();
            onClose();
          }}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>التفاصيل</span>
        </button>
      </div>
    </div>
  );
};
