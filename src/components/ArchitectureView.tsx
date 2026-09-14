import React, { useState } from 'react';
import { SUPABASE_SQL_SCHEMA } from '../data/databaseSchema.ts';
import { Database, Code, Cpu, Copy, Check, Table, ShieldCheck, Server } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'entities' | 'algorithm' | 'deploy'>('entities');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tablesSummary = [
    {
      name: 'stores',
      nameAr: 'المتاجر السعودية',
      desc: 'بيانات بنده، العثيم، الدانوب، كارفور، أمازون مع رسوم التوصيل وحدود الشحن المجاني.',
      columns: 'id (PK), name_ar, name_en, delivery_fee, free_delivery_threshold, minimum_order, delivery_sla, rating, supported_cities',
      vatRole: 'تخزين اشتراطات التوصيل والحد الأدنى لتطبيق الشحن المجاني.',
    },
    {
      name: 'products',
      nameAr: 'المنتجات والسلع',
      desc: 'سجل السلع الرئيسي الموحد مع وحدات القياس (لتر، كجم، حبة) وأكواد الباركود.',
      columns: 'id (UUID PK), category_id (FK), name_ar, name_en, unit, barcode, image_url, is_active',
      vatRole: 'المنتج الأساسي قبل تخصيص التسعيرة.',
    },
    {
      name: 'store_product_prices',
      nameAr: 'أسعار المتاجر والضريبة 15%',
      desc: 'سعر كل منتج في كل متجر مع احتساب الضريبة تلقائياً بالعمود الفيزيائي GENERATED ALWAYS STORED.',
      columns: 'id (UUID), product_id (FK), store_id (FK), price_excl_vat, vat_rate (15.00), price_incl_vat (STORED), in_stock, is_promo',
      vatRole: 'ROUND(price_excl_vat * 1.15, 2) لضمان التوافق الصارم مع متطلبات ZATCA.',
    },
    {
      name: 'coupons',
      nameAr: 'كوبونات الخصم النشطة',
      desc: 'أكواد الخصم النشطة لكل متجر مع نوع الخصم (نسبة مئوية أو مبلغ مقطوع) والحد الأدنى للإنفاق.',
      columns: 'id (UUID), store_id (FK), code, discount_type, discount_value, max_discount, min_spend, valid_until, verified',
      vatRole: 'يُخصم الكوبون بعد تجميع إجمالي السلة المحتسبة شاملة الضريبة.',
    },
    {
      name: 'price_history',
      nameAr: 'سجل تاريخ الأسعار',
      desc: 'تتبع حركة الأسعار تاريخياً لكشف الخصومات الحقيقية مقابل الخصومات المصطنعة قبل مواسم التخفيض.',
      columns: 'id (UUID), product_id (FK), store_id (FK), recorded_price_incl_vat, recorded_at',
      vatRole: 'رصد مؤشر التضخم والوفر الحقيقي للمستهلك السعودي.',
    },
  ];

  return (
    <div className="space-y-6" id="architecture-container">
      {/* رأس صفحة المعمارية */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-slate-800 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-slate-700">
            <Cpu className="w-3.5 h-3.5" />
            هندسة البرمجيات والبيانات السحابية
          </div>
          <h2 className="text-xl font-black">المعمارية التقنية، مخطط Supabase، وخوارزميات السلة</h2>
          <p className="text-xs text-slate-400 mt-1">
            توثيق هندسي شامل لجداول قاعدة البيانات، معادلات ضريبة القيمة المضافة 15%، وخوارزمية التوزيع الذكي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('entities')}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'entities' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            جداول البيانات
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'sql' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            كود Supabase SQL
          </button>
          <button
            onClick={() => setActiveTab('algorithm')}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'algorithm' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            خوارزمية السلة
          </button>
        </div>
      </div>

      {/* تبويب الجداول وهيكلية البيانات */}
      {activeTab === 'entities' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Table className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">نماذج الجداول السحابية (Supabase / PostgreSQL Schemas)</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                    <th className="py-3 px-4 min-w-[140px]">اسم الجدول</th>
                    <th className="py-3 px-4 min-w-[180px]">الوصف الوظيفي</th>
                    <th className="py-3 px-4 min-w-[260px]">الأعمدة والمفاتيح (Columns & Constraints)</th>
                    <th className="py-3 px-4 min-w-[200px]">آلية معالجة الضريبة 15%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tablesSummary.map((tbl, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="block text-emerald-700">{tbl.name}</span>
                        <span className="text-[11px] text-slate-500 font-sans">{tbl.nameAr}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed">{tbl.desc}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 text-[11px] leading-relaxed">
                        {tbl.columns}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <span className="inline-block bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-[11px]">
                          {tbl.vatRole}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* تبويب كود SQL المباشر للنسخ والتنفيذ */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">مخطط SQL الجاهز للإنتاج (Production DDL)</h3>
                <span className="text-xs text-slate-500">يتضمن دوال PL/pgSQL لاحتساب السلة وسياسات RLS</span>
              </div>
            </div>

            <button
              id="copy-schema-sql"
              onClick={handleCopySql}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-xl transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم نسخ كود SQL!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ مخطط DDL</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-950 p-4 border border-slate-800">
            <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-[500px] leading-relaxed dir-ltr text-left">
              <code>{SUPABASE_SQL_SCHEMA}</code>
            </pre>
          </div>
        </div>
      )}

      {/* تبويب منطق الخوارزميات الرياضية */}
      {activeTab === 'algorithm' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">هندسة خوارزميات تحسين السلال الشرائية</h3>
            <p className="text-xs text-slate-500">
              كيف يحل النظام مسألة التحسين التوافقي (Constrained Multi-Store Knapsack Problem)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-black text-sm text-slate-900">1. نموذج السلة الأحادية (Single-Store Evaluator)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                لكل متجر Sj، يتم جمع أسعار السلع المتوفرة شاملة الضريبة:
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-xs text-emerald-900 text-center dir-ltr">
                {"Total(S_j) = Σ (Price_incl_vat) + Delivery(S_j) - BestCoupon(S_j)"}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                حيث Delivery(S_j) = 0 إذا كان إجمالي المشتريات يتجاوز حد الشحن المجاني المحدد في جدول المتاجر.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-black text-sm text-slate-900">2. خوارزمية التوزيع الذكي (Multi-Store Optimizer)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                تقوم بتعيين كل صنف إلى المتجر الأرخص سعراً شاملاً الضريبة، ثم تقييم الجدوى الاقتصادية:
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-xs text-emerald-900 text-center dir-ltr">
                {"NetSavings = Min(SingleStoreTotal) - GrandTotal(SmartSplit)"}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                إذا كانت رسوم التوصيل الإضافية للمتاجر المجزأة أكبر من فرق سعر المنتجات، تقوم الخوارزمية بدمج الأصناف تلقائياً في المتجر الأكبر (Consolidation Heuristic).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
