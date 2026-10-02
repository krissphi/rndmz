import React from 'react';
import { Volume2, VolumeX, Dices, Sparkles } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  confettiEnabled: boolean;
  onToggleConfetti: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  confettiEnabled,
  onToggleConfetti,
}) => {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
          <Dices className="w-4 h-4" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">
            rndmz
          </span>
          <span className="text-xs text-slate-500 font-medium">
            shuffle randomizer
          </span>
        </div>
      </div>

      {/* Right controls: Confetti & Sound toggles only */}
      <div className="flex items-center space-x-2">
        {/* Toggle Confetti Celebration */}
        <button
          onClick={onToggleConfetti}
          title={confettiEnabled ? 'Disable celebration confetti' : 'Enable celebration confetti'}
          className={`p-2 rounded-full border shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
            confettiEnabled
              ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
              : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
          }`}
          aria-label={confettiEnabled ? 'Disable Confetti' : 'Enable Confetti'}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Toggle Sound */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 opacity-50" />
          )}
        </button>
      </div>
    </header>
  );
};
