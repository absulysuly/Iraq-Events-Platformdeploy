import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Event, Language } from '../types';
import { BookmarkIcon } from './icons';
import { LazyImage } from './LazyImage';

interface FeaturedCarouselProps {
  events: Event[];
  lang: Language;
  onSelectEvent: (event: Event) => void;
  bookmarkedEventIds: Set<string>;
  onToggleBookmark: (eventId: string) => void;
}

const SWIPE_THRESHOLD = 50;

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ events, lang, onSelectEvent, bookmarkedEventIds, onToggleBookmark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const t = {
    viewEvent: { en: 'View Event', ar: 'عرض الفعالية', ku: 'بینینی ڕووداو' }
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
    }, 5000);
  }, [events.length]);

  useEffect(() => {
    if (!isDragging) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isDragging, startTimer]);


  if (!events || events.length === 0) {
    return null;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsDragging(true);
    setTouchStartX(e.targetTouches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.targetTouches[0].clientX;
    setDragOffset(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (dragOffset < -SWIPE_THRESHOLD) { // Swiped left
      setCurrentIndex(prev => (prev === events.length - 1 ? prev : prev + 1));
    } else if (dragOffset > SWIPE_THRESHOLD) { // Swiped right
      setCurrentIndex(prev => (prev === 0 ? prev : prev - 1));
    }
    
    setDragOffset(0);
    // Timer will be restarted by useEffect
  };
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className="relative w-full h-[75vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex h-full"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 500ms ease-in-out',
          width: `${events.length * 100}%`
        }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            className="relative w-full h-full flex-shrink-0"
          >
            <LazyImage src={event.imageUrl} alt={event.title[lang]} className="w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end items-start p-8 md:p-12">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 shadow-xl">{event.title[lang]}</h2>
              <p className="text-lg text-gray-300 mb-6 shadow-lg max-w-2xl">{new Date(event.date).toLocaleDateString(lang === 'ku' ? 'ku-IQ' : lang === 'ar' ? 'ar-IQ' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {event.venue}</p>
              <div className="flex items-center gap-4">
                <button onClick={() => onSelectEvent(event)} className="px-6 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors shadow-lg">
                  {t.viewEvent[lang]}
                </button>
                <button 
                    onClick={() => onToggleBookmark(event.id)}
                    className="p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 hover:text-teal-300 transition-all duration-200"
                    aria-label={bookmarkedEventIds.has(event.id) ? "Remove bookmark" : "Add bookmark"}
                >
                    <BookmarkIcon className="w-6 h-6" isFilled={bookmarkedEventIds.has(event.id)} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

       <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-teal-400' : 'bg-gray-400/50 hover:bg-gray-400'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
