import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';
import { Product, Store, CartItem } from '../types.ts';
import { SAMPLE_VOICE_COMMANDS, ParsedVoiceCommand } from '../lib/voiceCommandEngine.ts';
import { useVoiceCommand } from '../lib/useVoiceCommand.ts';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  stores: Store[];
  cart: CartItem[];
  onAddToCart: (productId: string, quantity?: number) => void;
  onSearch: (query: string) => void;
  onNavigateTab: (tab: any) => void;
  onClearCart?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  products,
  stores,
  cart,
  onAddToCart,
  onSearch,
  onNavigateTab,
  onClearCart,
}) => {
  const [activeTab, setActiveTab] = useState<'listen' | 'cheat-sheet' | 'help'>('listen');

  const {
    isListening,
    transcript,
    interimTranscript,
    lastCommand,
    error,
    isSupported,
    speechSynthesisEnabled,
    setSpeechSynthesisEnabled,
    startListening,
    stopListening,
    simulateVoiceCommand,
    clearError,
  } = useVoiceCommand({
    products,
    stores,
    onAddToCart,
    onSearch: (query) => {
      onSearch(query);
      onClose();
    },
    onNavigateTab: (tab) => {
      onNavigateTab(tab);
      onClose();
    },
    onClearCart,
    enableAudioFeedbackDefault: true,
  });

  // بدء الاستماع تلقائياً عند فتح النافذة
  useEffect(() => {
    if (isOpen && isSupported && !isListening && !lastCommand && !error) {
      const timer = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isSupported]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* رأس النافذة مع هوية حكيم الصوتية */}
        <div className="bg-gradient-to-r from-[#2a1d06] via-[#1a1204] to-[#0c0903] text-white p-5 flex items-center justify-between border-b border-amber-600/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 ring-4 ring-amber-400/30 animate-pulse'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                }`}
              >
                <Mic className="w-5 h-5" />
              </div>
              {isListening && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-amber-100 flex items-center gap-1.5">
                  <span>المساعد الصوتي الذكي</span>
                  <span className="text-xs font-mono font-bold text-amber-400">Web Speech API</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  🇸🇦 لهجة سعودية
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                تحدث بحرية لإضافة المنتجات للسلة، فحص الأسعار، أو البحث
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* زر تفعيل/كتم الرد الصوتي */}
            <button
              type="button"
              onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer border ${
                speechSynthesisEnabled
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
              title={speechSynthesisEnabled ? 'الرد الصوتي مفعّل (انقر للكتم)' : 'الرد الصوتي مكتوم (انقر للتفعيل)'}
            >
              {speechSynthesisEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* زر الإغلاق */}
            <button
              type="button"
              onClick={() => {
                stopListening();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* شريط تبويبات النافذة */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-slate-100 bg-slate-50 text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('listen')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'listen'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>الاستماع المباشر</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cheat-sheet')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cheat-sheet'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>أوامر جاهزة سريعة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('help')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'help'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>طريقة الاستخدام</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-normal hidden sm:block">
            {isSupported ? '🎙️ الميكروفون مدعوم' : '⚠️ التعرف الصوتي غير مدعوم'}
          </div>
        </div>

        {/* المحتوى الرئيسي للنافذة */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'listen' && (
            <div className="space-y-5">
              {/* قسم الميكروفون المركزي والموجات الصوتية */}
              <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-amber-50/70 to-emerald-50/40 rounded-3xl border border-amber-200/60 text-center relative overflow-hidden">
                {/* تموجات صوتية متحدة المركز عند الاستماع */}
                {isListening && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border border-amber-400/30 animate-ping opacity-30" />
                    <div className="w-64 h-64 rounded-full border border-emerald-400/20 animate-pulse opacity-40" />
                  </div>
                )}

                {/* زر الميكروفون التفاعلي الكبير */}
                <div className="relative mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation cursor-pointer ${
                      isListening
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-2xl shadow-amber-500/50 scale-105 ring-8 ring-amber-300/40'
                        : 'bg-white text-slate-700 hover:bg-slate-100 shadow-md border-2 border-slate-200 hover:border-amber-400'
                    }`}
                    aria-label={isListening ? 'إيقاف الاستماع' : 'بدء الاستماع'}
                  >
                    {isListening ? (
                      <Mic className="w-9 h-9 sm:w-11 sm:h-11 animate-bounce" />
                    ) : (
                      <MicOff className="w-9 h-9 sm:w-11 sm:h-11 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* مؤشر الحالة والموجات الصوتية الرقمية */}
                <div className="space-y-2 relative z-10 max-w-sm">
                  <div className="flex items-center justify-center gap-1.5">
                    {isListening ? (
                      <>
                        {/* محاكاة أعمدة التردد الصوتي الحية */}
                        <div className="flex items-center gap-1 h-5 mx-2">
                          {[12, 24, 16, 28, 20, 10, 26, 18, 22].map((height, i) => (
                            <span
                              key={i}
                              className="w-1 bg-amber-500 rounded-full animate-pulse"
                              style={{
                                height: `${height}px`,
                                animationDuration: `${0.4 + (i % 4) * 0.2}s`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-black text-amber-900">
                          أستمع إليك الآن... تفضل بالكلام
                        </span>
                      </>
                    ) : (
                      <span className="text-xs sm:text-sm font-bold text-slate-600">
                        انقر على الميكروفون لبدء التحدث
                      </span>
                    )}
                  </div>

                  {/* الكلام المكتشف حالياً (Interim or Final) */}
                  <div className="min-h-[44px] flex items-center justify-center">
                    {interimTranscript || transcript ? (
                      <p className="text-sm sm:text-base font-bold text-slate-900 bg-white px-4 py-2 rounded-2xl shadow-xs border border-amber-300/70 inline-block font-sans">
                        « {interimTranscript || transcript} »
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        مثلاً: «أضف حليب المراعي حبتين» أو «أرخص أرز الشعلان وين؟»
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* تنبيه الأخطاء إن وجد */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="font-bold">{error}</p>
                    <p className="text-[11px] text-amber-700">
                      نصيحة: يمكنك النقر على أي من الأوامر الجاهزة بالأسفل لتجربة التنفيذ الفوري بنقرة واحدة.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-amber-500 hover:text-amber-800 text-xs font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              )}

              {/* بطاقة آخر أمر تم تنفيذه بنجاح */}
              {lastCommand && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-xs font-black text-slate-900">
                          تم فهم وتنفيذ الأمر الصوتي:
                        </span>
                        <span className="text-xs text-slate-500 mr-1.5 font-medium">
                          «{lastCommand.rawTranscript}»
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {lastCommand.intent === 'ADD_TO_CART'
                        ? 'إضافة للسلة'
                        : lastCommand.intent === 'SEARCH'
                        ? 'بحث ومقارنة'
                        : lastCommand.intent === 'NAVIGATE'
                        ? 'تنقل ذكي'
                        : 'إجراء عام'}
                    </span>
                  </div>

                  {/* السلعة المرتبطة بالأمر إن وجدت */}
                  {lastCommand.matchedProduct && (
                    <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{lastCommand.matchedProduct.imageUrl}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {lastCommand.matchedProduct.nameAr}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            الكمية: <strong className="text-slate-800 font-mono">{lastCommand.quantity}</strong>{' '}
                            {lastCommand.cheapestStore && (
                              <span>
                                • أرخص متجر: <strong className="text-emerald-700">{lastCommand.cheapestStore.name}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {lastCommand.cheapestPrice && (
                        <div className="text-left font-mono font-black text-emerald-700 text-sm">
                          {(lastCommand.cheapestPrice * (lastCommand.quantity || 1)).toFixed(2)}{' '}
                          <span className="text-xs font-sans">ر.س</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* نص التأكيد الصوتي المقروء */}
                  <div className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{lastCommand.spokenResponseText}</span>
                    </div>

                    {lastCommand.intent === 'ADD_TO_CART' && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateTab('cart');
                          onClose();
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] flex items-center gap-1 underline cursor-pointer"
                      >
                        <span>عرض السلة</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* عينات أوامر صوتية سريعة بنقرة واحدة */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>جرّب بالنقر المباشر (أوامر سريعة):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">انقر لتنفيذ المحاكاة فوراً</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_VOICE_COMMANDS.slice(0, 4).map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => simulateVoiceCommand(sample.command)}
                      className="text-right p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition-all flex items-center justify-between gap-2 touch-manipulation cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{sample.icon}</span>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-amber-950 truncate">
                          «{sample.title}»
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600 shrink-0">
                        {sample.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cheat-sheet' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-1">💡 كيف يفهم حكيم صوتك باللهجة السعودية؟</p>
                <p>
                  يستخدم محرك حكيم الذكاء اللغوي لتحليل نيتك (إضافة للسلة، استعلام عن أرخص متجر، كميات متعددة كـ «حبتين»، أو تفريغ السلة). انقر على أي عبارة بالأسفل لتجربتها مباشرة!
                </p>
              </div>

              <div className="space-y-2">
                {SAMPLE_VOICE_COMMANDS.map((cmd, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      simulateVoiceCommand(cmd.command);
                      setActiveTab('listen');
                    }}
                    className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cmd.icon}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-950">
                          « {cmd.command} »
                        </div>
                        <div className="text-[11px] text-slate-400">
                          الإجراء: {cmd.badge}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-amber-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-800 text-xs font-bold transition-colors"
                    >
                      تجربة الآن
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>دليل الأوامر الصوتية في حكيم AI</span>
                </h4>

                <div className="space-y-2.5">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-bold mb-1">🛒 1. أوامر الإضافة للسلة:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>«أضف حليب المراعي للسلة»</li>
                      <li>«أضف أرز الشعلان حبتين» (يدعم الكميات تلقائياً)</li>
                      <li>«حط دجاج التنمية في السلة»</li>
                      <li>«اشتري زيت عافية»</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-bold mb-1">🔍 2. أوامر الاستعلام ومقارنة الأسعار:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>«وين أرخص زيت عافية؟»</li>
                      <li>«كم سعر طبق بيض الوطنية؟»</li>
                      <li>«ابحث عن مسحوق غسيل أريال»</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <strong className="block text-slate-900 font-bold mb-1">🧭 3. أوامر التنقل الذكي:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>«افتح السلة» أو «عرض السلة»</li>
                      <li>«افتح الخريطة» (لعرض فروع بنده والعثيم والدانوب)</li>
                      <li>«الكوبونات» (لعرض أكواد الخصم النشطة)</li>
                      <li>«تفريغ السلة» أو «امسح السلة»</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ذيل النافذة */}
        <div className="bg-slate-50 p-3.5 sm:p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>مدعوم بـ W3C Web Speech API و Synthesis باللغة العربية</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isListening ? (
              <button
                type="button"
                onClick={stopListening}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>إيقاف الاستماع</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startListening}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span>بدء الاستماع من جديد</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              تم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
