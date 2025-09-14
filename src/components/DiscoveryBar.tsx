import React from 'react';
import type { City, Category, Language } from '../types';
import { LazyImage } from './LazyImage';

interface DiscoveryBarProps {
  cities: City[];
  categories: Category[];
  onFilterChange: (type: 'city' | 'category', id: string) => void;
  activeFilters: { city: string | null; category: string | null };
  lang: Language;
}

const CityButton: React.FC<{ city: City; onClick: () => void; isActive: boolean; lang: Language; }> = ({ city, onClick, isActive, lang }) => (
    <button
        onClick={onClick}
        className={`relative flex-shrink-0 w-32 h-20 m-2 rounded-lg overflow-hidden border-2 transition-all duration-300 group ${isActive ? 'border-teal-400 shadow-lg shadow-teal-500/30' : 'border-gray-600 hover:border-teal-500'}`}
    >
        <LazyImage src={city.image} alt={city.name[lang] || city.name.en} className={`w-full h-full object-cover transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors"></div>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold text-white whitespace-nowrap">{city.name[lang]}</span>
    </button>
);

const CategoryButton: React.FC<{ category: Category; onClick: () => void; isActive: boolean; lang: Language; }> = ({ category, onClick, isActive, lang }) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center flex-shrink-0 w-24 m-2 group"
        >
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-2 overflow-hidden ${isActive ? 'border-teal-400 shadow-lg shadow-teal-500/30' : 'bg-gray-700 border-gray-600 group-hover:border-teal-500'}`}>
                 <LazyImage src={category.image} alt={category.name[lang] || category.name.en} className={`w-full h-full object-cover transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            </div>
            <span className="mt-2 text-xs text-center text-gray-300 group-hover:text-teal-400 transition-colors h-8">{category.name[lang]}</span>
        </button>
    );
};


export const DiscoveryBar: React.FC<DiscoveryBarProps> = ({ cities, categories, onFilterChange, activeFilters, lang }) => {
  const t = {
    cities: { en: 'Explore Cities', ar: 'استكشف المدن', ku: 'شارەکان بگەڕێ' },
    categories: { en: 'Find by Category', ar: 'البحث حسب الفئة', ku: 'بەپێی پۆلێن بدۆزەرەوە' },
  };

  return (
    <div className="py-4 bg-gray-900/50">
      {/* Cities Section */}
      <section className="mb-4">
        <h3 className="font-bold text-lg text-gray-300 px-4 mb-1">{t.cities[lang]}</h3>
        <div className="scroller-container">
          <div className="scroller" style={{ animationDirection: lang === 'ar' || lang === 'ku' ? 'reverse' : 'normal' }}>
            {[...cities, ...cities].map((city, index) => (
              <CityButton
                key={`${city.id}-${index}`}
                city={city}
                onClick={() => onFilterChange('city', city.id)}
                isActive={activeFilters.city === city.id}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <h3 className="font-bold text-lg text-gray-300 px-4 mb-1">{t.categories[lang]}</h3>
        <div className="scroller-container">
          <div className="scroller" style={{ animationName: 'scroll-reverse', animationDirection: lang === 'ar' || lang === 'ku' ? 'reverse' : 'normal' }}>
            {[...categories, ...categories].map((cat, index) => (
              <CategoryButton
                key={`${cat.id}-${index}`}
                category={cat}
                onClick={() => onFilterChange('category', cat.id === 'all' ? '' : cat.id)}
                isActive={activeFilters.category === cat.id || (cat.id === 'all' && !activeFilters.category)}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </section>
       <style>{`
          .scroller-container {
            overflow: hidden;
            -webkit-mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
            mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
          }
          .scroller {
            display: flex;
            width: max-content;
            animation: scroll 60s linear infinite;
          }
          .scroller:hover {
            animation-play-state: paused;
          }
          .scroller-container:dir(rtl) .scroller {
            animation-direction: reverse;
          }
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
      `}</style>
    </div>
  );
};
