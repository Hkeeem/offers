import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types.ts';
import { Sparkles, Send, Bot, User, RefreshCw, ThumbsUp } from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: `مرحباً بك! أنا **مستشار التوفير الذكي (Smart Deal AI)** المدعوم بنماذج Google Gemini.
أنا هنا لمساعدتك في استراتيجيات خفض فاتورة مقاضيك الشهرية، متابعة عروض البروشورات الأسبوعية في بنده والعثيم والدانوب، واختيار أفضل بدائل السلع بأعلى جودة وأوفر سعر في المملكة. 🇸🇦

كيف أستطيع مساعدتك اليوم؟`,
      timestamp: 'الآن',
      suggestions: [
        'ما هي مواعيد تجدد العروض الأسبوعية في بنده والعثيم؟',
        'كيف أوزع مقاضي الشهر بين السوبرماركت وأمازون؟',
        'ما هي أفضل المنتجات البديلة لحليب وزيوت الطبخ المرتفعة؟',
        'كيف أستفيد من حد الشحن المجاني في تطبيقات التوصيل؟',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map(m => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply || 'تمت معالجة استفسارك بنجاح.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || [],
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'أعتذر، حدث تأخير في الاتصال. يمكنك إعادة المحاولة أو الاستفادة من مصفوفة الأسعار ورادار الكوبونات بالأعلى.',
        timestamp: 'الآن',
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4" id="ai-assistant-container">
      {/* بطاقة الرأس الإرشادية */}
      <div className="bg-gradient-to-l from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">مستشار التوفير الذكي (Gemini Shopping Agent)</h3>
            <p className="text-xs text-slate-300">
              استشارات فورية لتحليل عروض السوبرماركت السعودية، المقارنة الذكية، وبدائل السلع
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex bg-emerald-900/80 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-700/50">
          متصل بخادم Gemini 3
        </span>
      </div>

      {/* صندوق المحادثة الرئيسي */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-[540px] flex flex-col overflow-hidden">
        {/* شريط الرسائل */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-2 max-w-[82%] ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tl-none font-medium'
                      : 'bg-slate-100 text-slate-900 rounded-tr-none whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                {/* اقتراحات المتابعة السريعة */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[11px] bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 block px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl rounded-tr-none text-xs text-slate-600 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>جاري تحليل الأسعار والعروض في السوق السعودي...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* إدخال الرسالة */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-chat-input"
              type="text"
              placeholder="اكتب استفسارك عن الأسعار، العروض، أو بدائل المنتجات في السعودية..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-500"
            />
            <button
              id="ai-chat-send-btn"
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>إرسال</span>
              <Send className="w-3.5 h-3.5 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
