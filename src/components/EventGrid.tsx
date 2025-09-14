import React from 'react';
import type { Event } from '../types';
import type { Language } from '../types';
import { EventCard } from './EventCard';

interface EventGridProps {
  events: Event[];
  lang: Language;
  onSelectEvent: (event: Event) => void;
  bookmarkedEventIds: Set<string>;
  onToggleBookmark: (eventId: string) => void;
  viewType: 'all' | 'bookmarks' | 'my-events';
}

export const EventGrid: React.FC<EventGridProps> = ({ events, lang, onSelectEvent, bookmarkedEventIds, onToggleBookmark, viewType }) => {
  const t = {
    upcoming: { en: 'Upcoming Events', ar: 'الفعاليات القادمة' , ku: 'ڕووداوە چاوەڕوانکراوەکان' },
    myBookmarks: { en: 'My Bookmarks', ar: 'إشاراتي المرجعية', ku: 'نیشانکراوەکانم' },
    myEvents: { en: 'My Events', ar: 'فعالياتي', ku: 'ڕووداوەکانم' },
    noEvents: { en: 'No events match your criteria.', ar: 'لا توجد فعاليات تطابق بحثك.' , ku: 'هیچ ڕووداوێک لەگەڵ پێوەرەکانی تۆ ناگونجێت.'},
    noBookmarks: { en: 'You have no bookmarked events.', ar: 'ليس لديك أي فعاليات محفوظة.', ku: 'هیچ ڕووداوێکی نیشانکراوت نییە.'},
    noMyEvents: { en: "You haven't created any events yet.", ar: 'لم تقم بإنشاء أي فعاليات بعد.', ku: 'تۆ هێشتا هیچ ڕووداوێکت دروست نەکردووە.' }
  };

  const getTitle = () => {
    switch (viewType) {
      case 'bookmarks': return t.myBookmarks[lang];
      case 'my-events': return t.myEvents[lang];
      default: return t.upcoming[lang];
    }
  };

  const getEmptyMessage = () => {
    switch (viewType) {
      case 'bookmarks': return t.noBookmarks[lang];
      case 'my-events': return t.noMyEvents[lang];
      default: return t.noEvents[lang];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-100 mb-6">{getTitle()}</h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              lang={lang} 
              onSelect={onSelectEvent}
              isBookmarked={bookmarkedEventIds.has(event.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-500">{getEmptyMessage()}</p>
        </div>
      )}
    </div>
  );
};
