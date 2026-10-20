import React from 'react';
import { Dices, Moon, Sun, Settings, Clock, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export type SidebarTab = 'items' | 'logs' | 'settings' | null;

interface HeaderProps {
  activeSidebarTab: SidebarTab;
  onSelectSidebarTab: (tab: 'items' | 'logs' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSidebarTab,
  onSelectSidebarTab,
}) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0 flex items-center justify-between transition-colors z-30">
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

      {/* Right controls strictly in order: dark/light mode, logs, settings, items */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* 1. Toggle Dark / Light Theme */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
          aria-label={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* 2. Logs Sidebar Trigger */}
        <button
          type="button"
          onClick={() => onSelectSidebarTab('logs')}
          title="Draw History Logs"
          className={`h-9 px-3 rounded-xl border transition-all active:scale-95 flex items-center space-x-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 ${
            activeSidebarTab === 'logs'
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs hover:bg-indigo-700'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs'
          }`}
          aria-label="Draw History Logs"
        >
          <Clock className={`w-3.5 h-3.5 ${activeSidebarTab === 'logs' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
          <span>Logs</span>
        </button>

        {/* 3. Settings Sidebar Trigger */}
        <button
          type="button"
          onClick={() => onSelectSidebarTab('settings')}
          title={t('settings')}
          className={`h-9 px-3 rounded-xl border transition-all active:scale-95 flex items-center space-x-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 ${
            activeSidebarTab === 'settings'
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs hover:bg-indigo-700'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs'
          }`}
          aria-label={t('settings')}
        >
          <Settings className={`w-3.5 h-3.5 ${activeSidebarTab === 'settings' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
          <span>Settings</span>
        </button>

        {/* 4. Items Sidebar Trigger */}
        <button
          type="button"
          onClick={() => onSelectSidebarTab('items')}
          title={activeSidebarTab === 'items' ? 'Close items sidebar' : 'Open items sidebar'}
          className={`h-9 px-3 rounded-xl border transition-all active:scale-95 flex items-center space-x-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 ${
            activeSidebarTab === 'items'
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs hover:bg-indigo-700'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs'
          }`}
          aria-label={activeSidebarTab === 'items' ? 'Close items sidebar' : 'Open items sidebar'}
        >
          {activeSidebarTab === 'items' ? (
            <PanelRightClose className="w-4 h-4 text-white" />
          ) : (
            <PanelRightOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          )}
          <span>Items</span>
        </button>
      </div>
    </header>
  );
};
