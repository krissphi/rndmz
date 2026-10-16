import React from 'react';
import { Play, RotateCcw, Loader2 } from 'lucide-react';
import { Item, RandomizerState } from '../types';
import { AVAILABLE_FONTS } from '../constants/presets';
import { useTranslation } from '../i18n/LanguageContext';

interface ShuffleCardProps {
  currentItem: Item | null;
  state: RandomizerState;
  onStartShuffle: () => void;
  onReset: () => void;
  containerBgColor: string;
  containerTextColor: string;
  fontFamily: string;
  randomizeFontOnShuffle: boolean;
  stepIndex: number;
  eligibleCount: number;
  totalCategoryCount: number;
  allowRepeatWinners: boolean;
}

export const ShuffleCard: React.FC<ShuffleCardProps> = ({
  currentItem,
  state,
  onStartShuffle,
  onReset,
  containerBgColor,
  containerTextColor,
  fontFamily,
  randomizeFontOnShuffle,
  stepIndex,
  eligibleCount,
  totalCategoryCount,
  allowRepeatWinners,
}) => {
  const { t } = useTranslation();
  const isShuffling = state === 'shuffling';
  const isRevealed = state === 'revealed';
  const isExhausted = !allowRepeatWinners && eligibleCount === 0 && totalCategoryCount > 0;

  // Render text with word-by-word randomized fonts during shuffle if enabled
  const renderItemText = () => {
    if (!currentItem) {
      return (
        <span style={{ fontFamily }} className="text-slate-400 dark:text-slate-500 font-normal">
          {totalCategoryCount === 0 ? t('noItemsInCategory') : t('pressShuffleToStart')}
        </span>
      );
    }

    // Dynamic word-by-word font randomizer during shuffle
    if (isShuffling && randomizeFontOnShuffle) {
      const words = currentItem.text.split(' ');
      return (
        <span className="inline-flex flex-wrap justify-center items-center text-center gap-x-2.5 gap-y-1 mx-auto">
          {words.map((word, wIdx) => {
            const fontIdx = (stepIndex * 3 + wIdx * 2) % AVAILABLE_FONTS.length;
            const font = AVAILABLE_FONTS[fontIdx].fontFamily;
            return (
              <span
                key={`${wIdx}-${stepIndex}`}
                style={{ fontFamily: font }}
                className="transition-transform duration-75 inline-block text-center"
              >
                {word}
              </span>
            );
          })}
        </span>
      );
    }

    // Standard selected font
    return <span style={{ fontFamily }} className="text-center">{currentItem.text}</span>;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Main Customizable Container Card with 100% Centered Text */}
      <div
        className={`w-full rounded-3xl border transition-all duration-300 text-center flex items-center justify-center shadow-sm relative overflow-hidden focus:outline-none min-h-[220px] sm:min-h-[280px] p-8 sm:p-14 ${
          isRevealed
            ? 'border-indigo-400 dark:border-indigo-500 ring-4 ring-indigo-500/20 shadow-xl'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
        style={{
          backgroundColor: containerBgColor,
          color: containerTextColor,
        }}
        role="region"
        aria-label="Shuffle Display"
      >
        {/* Candidate Item Display - Perfectly Centered */}
        <div
          className="w-full flex items-center justify-center text-center px-2 my-auto"
          aria-live="assertive"
          aria-atomic="true"
        >
          <h2
            className={`font-black tracking-tight transition-transform duration-100 break-words max-w-full leading-tight select-none text-center mx-auto text-2xl sm:text-4xl md:text-5xl ${
              isRevealed ? 'scale-105' : 'scale-100'
            }`}
          >
            {renderItemText()}
          </h2>
        </div>

        {/* Category Label at bottom of card */}
        {currentItem?.category && (
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <span
              className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border border-current/20 opacity-75 tracking-wide uppercase backdrop-blur-xs"
            >
              {currentItem.category}
            </span>
          </div>
        )}
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center justify-center space-x-3 mt-6">
        <button
          onClick={onStartShuffle}
          disabled={isShuffling || isExhausted || eligibleCount === 0}
          className="flex items-center space-x-2.5 rounded-full font-bold bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white shadow-lg shadow-slate-900/10 dark:shadow-indigo-900/30 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/20 dark:focus:ring-indigo-500/30 focus:ring-offset-2 px-9 sm:px-11 py-3.5 sm:py-4 text-base sm:text-lg"
          aria-label={isRevealed ? t('shuffleAgain') : t('shuffle')}
        >
          {isShuffling ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('shuffling')}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>{isRevealed ? t('shuffleAgain') : t('shuffle')}</span>
            </>
          )}
        </button>

        {(isRevealed || isShuffling) && (
          <button
            onClick={onReset}
            disabled={isShuffling}
            title={t('resetTooltip')}
            className="flex items-center space-x-1.5 px-4 py-3.5 rounded-full font-medium text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700 shadow-xs transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
            aria-label={t('reset')}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('reset')}</span>
          </button>
        )}
      </div>

      {/* Keyboard Shortcut Hint */}
      <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 select-none text-center">
        {t('tipShortcut', {
          space: 'Space',
          enter: 'Enter',
        })}
      </p>
    </div>
  );
};
