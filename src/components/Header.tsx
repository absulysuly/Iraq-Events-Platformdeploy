import React from 'react';
import type { Language, User, AuthMode } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { LogoIcon } from './icons/LogoIcon';

interface HeaderProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  onOpenCreateModal: () => void;
  onOpenAIAssistant: () => void;
  currentUser: User | null;
  onAuthClick: (mode: AuthMode) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLangChange, onOpenCreateModal, onOpenAIAssistant, currentUser, onAuthClick, onLogout }) => {
  const t = {
    login: { en: 'Login', ar: 'تسجيل الدخول', ku: 'چوونەژوورەوە' },
    createEvent: { en: 'Create Event', ar: 'إنشاء فعالية', ku: 'ڕووداو دروستبکە' },
    createWithAI: { en: 'Create with AI', ar: 'إنشاء بالذكاء الاصطناعي', ku: 'دروستکردن بە زیرەکی دەستکرد' },
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-700/50 py-3">
      <div className="container mx-auto px-4">
        {/* Top Row: Logo and Auth */}
        <div className="flex justify-between items-center">
          {/* Left Slot: App Name/Logo */}
          <div className="flex items-center gap-3">
            <LogoIcon className="h-10 w-10 text-teal-400" />
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
              {lang === 'en' ? 'Eventara' : (lang === 'ku' ? 'ئیڤێنتارا' : 'إيفينتارا')}
            </h1>
          </div>

          {/* Right Slot: Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {currentUser ? (
              <>
                <UserMenu user={currentUser} onLogout={onLogout} />
                <button 
                  onClick={onOpenAIAssistant}
                  className="hidden lg:flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 rounded-full px-4 py-2 hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✨ {t.createWithAI[lang]}
                </button>
                <button 
                  onClick={onOpenCreateModal}
                  className="text-sm font-semibold text-white bg-teal-500 rounded-full px-4 py-2 hover:bg-teal-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t.createEvent[lang]}
                </button>
              </>
            ) : (
              <button onClick={() => onAuthClick('login')} className="text-sm font-semibold text-gray-900 bg-teal-500 border border-teal-500 rounded-full px-6 py-2 hover:bg-teal-600 transition-colors">
                  {t.login[lang]}
                </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Language Switcher */}
        <div className="flex justify-center mt-3">
            <LanguageSwitcher currentLang={lang} onLangChange={onLangChange} />
        </div>
      </div>
    </header>
  );
};
