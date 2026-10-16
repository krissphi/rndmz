import React from 'react';
import { Dices, Moon, Sun, Languages, Settings, Clock } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  drawLogsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenHistory,
  drawLogsCount,
}) => {
  const { t, language, toggleLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-5 flex items-center justify-between transition-colors">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-slate-900/10 transition-colors">
          <Dices className="w-5 h-5" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
            {t('appName')}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden xs:inline">
            {t('appTagline')}
          </span>
        </div>
      </div>

      {/* Right controls: History, Language, Theme, and Settings */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Draw History Modal Trigger */}
        <button
          onClick={onOpenHistory}
          title={t('history')}
          className="relative h-9 px-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition active:scale-95 flex items-center space-x-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
          aria-label={t('history')}
        >
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">{t('history')}</span>
          {drawLogsCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold font-mono text-[10px]">
              {drawLogsCount}
            </span>
          )}
        </button>

        {/* Toggle Language (EN / ID) */}
        <button
          onClick={toggleLanguage}
          title={t('toggleLanguage')}
          className="h-9 px-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition active:scale-95 flex items-center space-x-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
          aria-label={t('toggleLanguage')}
        >
          <Languages className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="uppercase tracking-wider">{language}</span>
        </button>

        {/* Toggle Dark / Light Theme */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 shadow-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
          aria-label={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Settings Drawer / Modal Trigger */}
        <button
          onClick={onOpenSettings}
          title={t('settings')}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
          aria-label={t('settings')}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
