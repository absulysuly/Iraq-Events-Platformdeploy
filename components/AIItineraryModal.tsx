import React, { useState, useEffect } from 'react';
import type { Event, Language, AIItineraryResponse } from '../types';
import { generateItineraryFromPrompt } from '../services/geminiService';
import { MagicWandIcon } from './icons';
import { LazyImage } from './LazyImage';

interface AIItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  lang: Language;
  onSelectEvent: (event: Event) => void;
}

const examplePrompts = {
    en: [
        "A weekend getaway in Erbil for a couple",
        "A family-friendly day in Baghdad with kids",
        "Three days of art and culture in Sulaymaniyah",
        "Tech events for a student this month"
    ],
    ar: [
        "عطلة نهاية أسبوع في أربيل لزوجين",
        "يوم عائلي في بغداد مع الأطفال",
        "ثلاثة أيام من الفن والثقافة في السليمانية",
        "فعاليات تقنية لطالب هذا الشهر"
    ],
    ku: [
        "گەشتێکی کۆتایی هەفتە لە هەولێر بۆ دوو کەس",
        "ڕۆژێکی خێزانی لە بەغدا لەگەڵ منداڵان",
        "سێ ڕۆژ لە هونەر و کەلتور لە سلێمانی",
        "چالاکی تەکنەلۆجی بۆ قوتابیەک ئەم مانگە"
    ]
}

export const AIItineraryModal: React.FC<AIItineraryModalProps> = ({ isOpen, onClose, events, lang, onSelectEvent }) => {
  const [prompt, setPrompt] = useState('');
  const [itinerary, setItinerary] = useState<AIItineraryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Intentionally not resetting state on close so user can view the last itinerary
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please describe the plan you want.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setItinerary(null);
    try {
      const result = await generateItineraryFromPrompt(prompt, events, lang);
      setItinerary(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setPrompt('');
    setItinerary(null);
    setError(null);
    setIsLoading(false);
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  }

  if (!isOpen) return null;

  const t = {
    title: { en: 'AI Itinerary Planner', ar: 'مخطط الرحلات بالذكاء الاصطناعي', ku: 'پلاندانەری گەشتی زیرەک' },
    description: { en: 'Describe your ideal trip, and our AI will craft a personalized itinerary for you.', ar: 'صف رحلتك المثالية، وسيقوم الذكاء الاصطناعي لدينا بإنشاء خطة مخصصة لك.', ku: 'گەشتە نموونەییەکەت باس بکە، و زیرەکی دەستکردی ئێمە پلانێکی تایبەتت بۆ دادەڕێژێت.'},
    placeholder: { en: 'e.g., "A relaxing 2-day trip to Duhok focused on food"', ar: 'مثال: "رحلة استرخاء لمدة يومين في دهوك تركز على الطعام"', ku: 'نموونە: "گەشتێکی ئارامبەخش بۆ ماوەی دوو ڕۆژ لە دهۆک بە تەرکیز لەسەر خواردن"' },
    generate: { en: 'Generate Plan', ar: 'إنشاء الخطة', ku: 'دروستکردنی پلان' },
    generating: { en: 'Generating...', ar: 'جاري الإنشاء...', ku: 'لەسەر دروستکردنە...' },
    startOver: { en: 'Start Over', ar: 'البدء من جديد', ku: 'دەستپێکردنەوە' },
    close: { en: 'Close', ar: 'إغلاق', ku: 'داخستن' },
    aiWorking: { en: "AI is crafting your personal itinerary...", ar: "الذكاء الاصطناعي يقوم بإعداد خطة رحلتك الشخصية...", ku: "زیرەکی دەستکرد خەریکی داڕشتنی پلانی گەشتی تایبەتی تۆیە..." },
    event: { en: 'Event', ar: 'فعالية', ku: 'ڕووداو'},
    viewEvent: { en: 'View Event', ar: 'عرض الفعالية', ku: 'بینینی ڕووداو'},
  }

  const ItineraryEventCard: React.FC<{ eventId: string }> = ({ eventId }) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    return (
        <div className="mt-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600 flex items-center gap-4">
            <LazyImage src={event.imageUrl} alt={event.title[lang]} className="w-20 h-14 rounded-md flex-shrink-0" />
            <div className="flex-grow">
                <p className="font-semibold text-teal-300">{t.event[lang]}</p>
                <h5 className="font-bold text-gray-100">{event.title[lang]}</h5>
                <p className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString(lang, { month: 'short', day: 'numeric'})}</p>
            </div>
            <button 
                onClick={() => onSelectEvent(event)} 
                className="px-3 py-1 text-xs font-semibold bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex-shrink-0"
            >
                {t.viewEvent[lang]}
            </button>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="ai-itinerary-title">
      <div className="bg-gray-800 text-gray-200 rounded-lg shadow-xl w-full max-w-2xl p-6 my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 id="ai-itinerary-title" className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <MagicWandIcon className="w-6 h-6 text-indigo-400" />
            {t.title[lang]}
          </h2>
          <button onClick={handleClose} disabled={isLoading} className="text-gray-500 hover:text-gray-300 disabled:opacity-50 text-2xl leading-none">&times;</button>
        </div>
        
        {!itinerary && !isLoading && (
          <>
            <p className="text-gray-400 mb-4">{t.description[lang]}</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-600"
              placeholder={t.placeholder[lang]}
            />
            <div className='text-xs text-gray-500 mt-2 mb-4'>
                Try: {examplePrompts[lang].map((p, i) => (
                    <button key={i} onClick={() => setPrompt(p)} className="underline hover:text-gray-300 ltr:mr-2 rtl:ml-2">"{p}"</button>
                ))}
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </>
        )}
        
        {isLoading && (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                <p className="mt-4 text-gray-400">{t.aiWorking[lang]}</p>
            </div>
        )}

        {itinerary && (
            <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                <h3 className="text-xl font-bold text-indigo-300">{itinerary.itineraryTitle[lang]}</h3>
                {itinerary.plan.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="font-semibold text-gray-400 text-sm">{item.day}</p>
                        <h4 className="font-bold text-lg text-gray-100 mt-1">{item.title}</h4>
                        <p className="text-gray-300 mt-1">{item.description}</p>
                        {item.eventId && <ItineraryEventCard eventId={item.eventId} />}
                    </div>
                ))}
            </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} disabled={isLoading} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 disabled:opacity-50">
            {t.close[lang]}
          </button>
          
          {itinerary ? (
              <button onClick={handleStartOver} disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {t.startOver[lang]}
              </button>
          ) : (
            <button onClick={handleGenerate} disabled={isLoading || !prompt}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center w-40">
              {isLoading ? t.generating[lang] : t.generate[lang]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
