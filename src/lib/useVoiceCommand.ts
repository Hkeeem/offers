import { useState, useEffect, useRef, useCallback } from 'react';
import { Product, Store } from '../types.ts';
import {
  isWebSpeechSupported,
  createSpeechRecognitionInstance,
  parseVoiceCommand,
  speakVoiceFeedback,
  playVoiceBeep,
  ISpeechRecognition,
  ParsedVoiceCommand,
} from './voiceCommandEngine.ts';

export interface UseVoiceCommandOptions {
  products: Product[];
  stores: Store[];
  onAddToCart?: (productId: string, quantity?: number) => void;
  onSearch?: (query: string) => void;
  onNavigateTab?: (tab: any) => void;
  onClearCart?: () => void;
  enableAudioFeedbackDefault?: boolean;
}

export function useVoiceCommand({
  products,
  stores,
  onAddToCart,
  onSearch,
  onNavigateTab,
  onClearCart,
  enableAudioFeedbackDefault = true,
}: UseVoiceCommandOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<ParsedVoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(enableAudioFeedbackDefault);
  const [isSupported] = useState<boolean>(() => isWebSpeechSupported());

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const executeTimeoutRef = useRef<any>(null);

  // تنفيذ الأمر الصوتي المعالج
  const executeParsedCommand = useCallback(
    (command: ParsedVoiceCommand, shouldSpeak: boolean = true) => {
      setLastCommand(command);

      // تشغيل نغمة النجاح
      playVoiceBeep('success');

      // تشغيل الرد الصوتي إذا كانت الخاصية مفعلة
      if (shouldSpeak && speechSynthesisEnabled && command.spokenResponseText) {
        speakVoiceFeedback(command.spokenResponseText);
      }

      // توجيه الأوامر التنفيذية بناءً على النية المكتشفة
      switch (command.intent) {
        case 'ADD_TO_CART':
          if (command.matchedProduct && onAddToCart) {
            onAddToCart(command.matchedProduct.id, command.quantity || 1);
          }
          break;

        case 'SEARCH':
          if (onSearch && command.searchQuery) {
            onSearch(command.searchQuery);
          } else if (onNavigateTab) {
            onNavigateTab('matrix');
          }
          break;

        case 'NAVIGATE':
          if (onNavigateTab && command.targetTab) {
            onNavigateTab(command.targetTab);
          }
          break;

        case 'CLEAR_CART':
          if (onClearCart) {
            onClearCart();
          }
          break;

        default:
          if (command.searchQuery && onSearch) {
            onSearch(command.searchQuery);
          }
          break;
      }
    },
    [onAddToCart, onSearch, onNavigateTab, onClearCart, speechSynthesisEnabled]
  );

  // إيقاف الاستماع
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  // بدء الاستماع بالأمر الصوتي
  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    if (!isSupported) {
      setError('متصفحك لا يدعم Web Speech API للتعرف الصوتي مباشرة. يمكنك استخدام الأوامر السريعة التجريبية أدناه.');
      return;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = createSpeechRecognitionInstance();
      }

      const rec = recognitionRef.current;
      if (!rec) {
        setError('تعذر تهيئة محرك التعرف الصوتي.');
        return;
      }

      rec.onstart = () => {
        setIsListening(true);
        playVoiceBeep('start');
      };

      rec.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (currentFinal) {
          const finalTrimmed = currentFinal.trim();
          setTranscript(finalTrimmed);
          setInterimTranscript('');

          // تحليل وتنفيذ الأمر فور اكتمال الجملة
          const parsed = parseVoiceCommand(finalTrimmed, products, stores);
          executeParsedCommand(parsed);
          stopListening();
        }
      };

      rec.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        playVoiceBeep('error');

        if (event.error === 'not-allowed') {
          setError('تم حظر إذن الميكروفون. يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح.');
        } else if (event.error === 'no-speech') {
          setError('لم يتم سماع أي صوت، يرجى المحاولة مرة أخرى والتحدث بوضوح.');
        } else if (event.error === 'network') {
          setError('حدث خطأ في الاتصال بخدمة التعرف على الكلام.');
        } else {
          setError(`خطأ أثناء الاستماع (${event.error}).`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (err: any) {
      setIsListening(false);
      console.warn('Error starting speech recognition:', err);
      setError('تعذر تشغيل الميكروفون حالياً. يمكنك تجربة الأوامر الصوتية النموذجية أدناه.');
    }
  }, [isSupported, products, stores, executeParsedCommand, stopListening]);

  // تشغيل أمر تجريبي محاكى (للاختبار السريع أو عند عدم توفر ميكروفون)
  const simulateVoiceCommand = useCallback(
    (spokenText: string) => {
      setError(null);
      setTranscript(spokenText);
      setInterimTranscript('');
      setIsListening(false);

      const parsed = parseVoiceCommand(spokenText, products, stores);
      executeParsedCommand(parsed, speechSynthesisEnabled);
    },
    [products, stores, executeParsedCommand, speechSynthesisEnabled]
  );

  // تنظيف الموارد عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (executeTimeoutRef.current) {
        clearTimeout(executeTimeoutRef.current);
      }
    };
  }, []);

  return {
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
    clearError: () => setError(null),
    clearLastCommand: () => setLastCommand(null),
  };
}
