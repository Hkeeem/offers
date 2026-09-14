import React, { useState } from 'react';
import { Coupon, Store } from '../types.ts';
import { Copy, Check, Tag, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface CouponsViewProps {
  coupons: Coupon[];
  stores: Store[];
  cartSubtotal: number;
}

export const CouponsView: React.FC<CouponsViewProps> = ({ coupons, stores, cartSubtotal }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons.filter(
    c => selectedStoreFilter === 'all' || c.storeId === selectedStoreFilter
  );

  return (
    <div className="space-y-6" id="coupons-container">
      {/* رأس الصفحة وفلاتر المتاجر */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <Tag className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-slate-900">رادار الكوبونات والخصومات السعودية الموثقة</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              أكواد خصم نشطة ومحققة 100% تعمل مع تطبيقات بنده كليك، العثيم أونلاين، كارفور، وأمازون
            </p>
          </div>

          <div className="bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>يتم تطبيق الكوبونات تلقائياً في خوارزمية السلة الذكية</span>
          </div>
        </div>

        {/* فلاتر المتاجر */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 shrink-0">المتجر:</span>
          <button
            onClick={() => setSelectedStoreFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              selectedStoreFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع المتاجر ({coupons.length})
          </button>
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => setSelectedStoreFilter(store.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStoreFilter === store.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{store.logo}</span>
              <span>{store.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* شبكة الكوبونات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="coupons-grid">
        {filteredCoupons.map(coupon => {
          const store = stores.find(s => s.id === coupon.storeId);
          const isCopied = copiedCode === coupon.code;
          const isEligible = cartSubtotal >= coupon.minSpend;

          return (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-5 shadow-xs transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* شريط المتجر */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{store?.logo}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{store?.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{store?.nameEn}</span>
                    </div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    مُحقق ونشط
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4">
                  {coupon.description}
                </p>
              </div>

              {/* بطاقة كود الكوبون وزر النسخ */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between bg-slate-50 border border-dashed border-slate-300 rounded-xl p-2.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold">كود الخصم:</span>
                    <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                      {coupon.code}
                    </span>
                  </div>

                  <button
                    id={`copy-coupon-${coupon.code}`}
                    onClick={() => handleCopy(coupon.code)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-xs'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                </div>

                {/* شروط الكوبون */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    سارٍ حتى: {coupon.validUntil}
                  </span>
                  <span>الحد الأدنى: <strong>{coupon.minSpend} ر.س</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
