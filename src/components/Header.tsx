import React, { useState } from 'react';
import type { GameMode, UserStats } from '../types';
import { sound } from '../audio/soundEffects';
import {
  BookOpen,
  Dumbbell,
  Award,
  Zap,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  stats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  stats,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playClack(true, 1.2);
    }
  };

  const navItems = [
    {
      id: 'academy' as GameMode,
      label: 'Academy',
      icon: BookOpen,
      desc: 'Lessons & Wari-zan',
    },
    {
      id: 'practice' as GameMode,
      label: 'Practice Gym',
      icon: Dumbbell,
      desc: 'Infinite Drills',
    },
    {
      id: 'exam' as GameMode,
      label: 'Kyu / Dan Exams',
      icon: Award,
      desc: 'Japanese Certification',
    },
    {
      id: 'anzan' as GameMode,
      label: 'Flash Anzan',
      icon: Zap,
      desc: 'Mental Soroban',
    },
    {
      id: 'sandbox' as GameMode,
      label: 'Sandbox',
      icon: Compass,
      desc: 'Free Exploration',
    },
  ];

  return (
    <header className="w-full bg-stone-950/80 border-b border-stone-800/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-orange-600/30 border border-orange-400/30">
            <span className="text-white text-lg font-black font-serif">算</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-stone-100 uppercase">
                Soroban Zen
              </h1>
              <span className="text-xs text-orange-400/80 font-mono">日本珠算道場</span>
            </div>
            <p className="text-[11px] text-stone-400 tracking-wide">
              Official Japanese Abacus & Anzan Certification
            </p>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <nav className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-stone-900/90 border border-stone-800 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectMode(item.id);
                  sound.playClack(false, 1.1);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Stats & Audio Toggle */}
        <div className="flex items-center gap-3">
          {/* Kyu / Dan Rank Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-stone-200">{stats.rank}</span>
            <span className="text-stone-500">•</span>
            <span className="font-mono text-orange-400 font-semibold">{stats.xp} XP</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Tactile Clacks'}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-orange-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
