import React from 'react';
import type { Event } from '../types';
import type { Language } from '../types';
import { BookmarkIcon } from './icons';
import { LazyImage } from './LazyImage';

interface EventCardProps {
  event: Event;
  lang: Language;
  onSelect: (event: Event) => void;
  isBookmarked: boolean;
  onToggleBookmark: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, lang, onSelect, isBookmarked, onToggleBookmark }) => {
  return (
    <div 
      className="relative bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer group border border-gray-700 hover:border-teal-500/50"
      onClick={() => onSelect(event)}
    >
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(event.id);
        }}
        className="absolute top-3 right-3 z-10 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 hover:text-teal-300 transition-all duration-200"
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <BookmarkIcon className="w-5 h-5" isFilled={isBookmarked} />
      </button>
      <div className="h-48 w-full overflow-hidden">
        <LazyImage className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" src={event.imageUrl} alt={event.title[lang] || event.title.en} />
      </div>
      <div className="p-4">
        <h4 className="text-lg font-bold text-gray-100 truncate">{event.title[lang]}</h4>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(event.date).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'ku' ? 'ku-IQ' : 'ar-IQ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-sm text-gray-500 mt-1 truncate">{event.venue}</p>
        <div className="flex items-center mt-3">
          <span className="text-xs font-semibold text-teal-300 bg-teal-900/50 rounded-full px-2 py-0.5">
            {event.organizerName}
          </span>
        </div>
      </div>
    </div>
  );
};
