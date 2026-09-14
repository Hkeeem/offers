import React, { useState } from 'react';
import { Star, Truck, PackageCheck, Info } from 'lucide-react';
import { StoreRatingMetrics } from '../types.ts';
import { getRatingColorClasses } from '../lib/storeRatingEngine.ts';

interface StoreRatingBadgeProps {
  metrics: StoreRatingMetrics;
  storeName: string;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'light' | 'dark' | 'minimal';
  showDetailsOnHover?: boolean;
}

export const StoreRatingBadge: React.FC<StoreRatingBadgeProps> = ({
  metrics,
  storeName,
  onClick,
  size = 'sm',
  variant = 'light',
  showDetailsOnHover = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const colorClasses = getRatingColorClasses(metrics.averageRating);

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  }[size];

  const starSize = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  }[size];

  return (
    <div className="relative inline-flex items-center" onMouseLeave={() => setShowTooltip(false)}>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        className={`inline-flex items-center rounded-lg font-black font-mono transition-all cursor-pointer select-none ${sizeClasses} ${
          variant === 'dark'
            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30'
            : variant === 'minimal'
            ? 'text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
            : `${colorClasses.bg} border hover:shadow-xs`
        }`}
        title={`متوسط تقييم ${storeName}: ${metrics.averageRating.toFixed(1)} من 5 (سرعة التوصيل: ${metrics.deliverySpeedRating.toFixed(1)} | توفر المنتجات: ${metrics.availabilityRating.toFixed(1)})`}
        aria-label={`تقييم المتجر: ${metrics.averageRating.toFixed(1)}`}
      >
        <Star className={`${starSize} text-amber-500 fill-amber-400 shrink-0`} />
        <span>{metrics.averageRating.toFixed(1)}</span>
        {size !== 'xs' && (
          <span className="text-[10px] font-sans opacity-75 font-normal">
            (متوسط)
          </span>
        )}
      </button>

      {/* نافذة التلميح التفاعلي التفصيلي عند التحويم */}
      {showDetailsOnHover && showTooltip && (
        <div
          className="absolute z-50 bottom-full mb-2 right-0 w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 text-right pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          dir="rtl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-xs text-slate-200">
              نظام تقييم {storeName}
            </span>
            <span className="text-amber-400 font-mono font-black text-xs">
              ⭐ {metrics.averageRating.toFixed(1)} / 5.0
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            {/* سرعة التوصيل */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-0.5">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-sky-400" />
                  <span>سرعة التوصيل:</span>
                </span>
                <span className="font-mono font-bold text-sky-400">
                  {metrics.deliverySpeedRating.toFixed(1)} / 5
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${(metrics.deliverySpeedRating / 5) * 100}%` }}
                />
              </div>
              {metrics.deliverySpeedLabel && (
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {metrics.deliverySpeedLabel}
                </div>
              )}
            </div>

            {/* توفر المنتجات */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-0.5">
                <span className="flex items-center gap-1">
                  <PackageCheck className="w-3 h-3 text-emerald-400" />
                  <span>توفر المنتجات:</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {metrics.availabilityRating.toFixed(1)} / 5
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(metrics.availabilityRating / 5) * 100}%` }}
                />
              </div>
              {metrics.availabilityPercentage !== undefined && (
                <div className="text-[10px] text-slate-400 mt-0.5">
                  نسبة التوفر: {metrics.availabilityPercentage}% من السلع
                </div>
              )}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-amber-300/90 flex items-center gap-1 justify-center">
            <Info className="w-3 h-3 shrink-0" />
            <span>انقر للاطلاع على التفاصيل أو تقييم المتجر</span>
          </div>
        </div>
      )}
    </div>
  );
};
