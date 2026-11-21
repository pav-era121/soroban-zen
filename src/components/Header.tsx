import React, { useState, useEffect } from 'react';
import type { GameMode, UserStats } from '../types';
import { sound } from '../audio/soundEffects';
import {
  GraduationCap,
  Dumbbell,
  Layers,
  Award,
  Zap,
  Compass,
  Volume2,
  VolumeX,
  Download,
  X,
  Smartphone,
  Share,
} from 'lucide-react';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  stats: UserStats;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  stats,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => {
        setInstallPrompt(null);
      });
    } else {
      setShowInstallModal(true);
    }
  };

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playClack(true, 1.2);
    }
  };

  const navItems = [
    {
      id: 'curriculum' as GameMode,
      label: 'Curriculum',
      icon: GraduationCap,
      desc: 'Chapters & Practice',
    },
    {
      id: 'bank1k' as GameMode,
      label: '1,000+ Bank',
      icon: Layers,
      desc: '1,000 + 鬼神 Devil Level',
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
    <>
      <header className="w-full bg-stone-950/80 border-b border-stone-800/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Authentic Japanese App Logo & Brand */}
          <div className="flex items-center gap-3">
            <img
              src="./icon-192.png"
              alt="Soroban Zen Logo"
              className="w-11 h-11 rounded-2xl shadow-lg shadow-orange-950/60 border border-orange-500/30 object-cover transform hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-stone-100 uppercase">
                  Soroban Zen
                </h1>
                <span className="text-xs text-orange-400 font-mono">そろばん</span>
              </div>
              <p className="text-[11px] text-stone-400 tracking-wide">
                Japanese Abacus & Anzan Mind Gym
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

          {/* User Stats, Install App Button & Audio Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Install / Download App Button */}
            <button
              onClick={handleInstallClick}
              title="Download & Install Japanese App on Phone/Desktop"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/60 hover:bg-orange-900/70 border border-orange-700/60 text-orange-300 hover:text-white text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span>Install App</span>
            </button>

            {/* Kyu / Dan Rank Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
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

      {/* PWA / App Install Modal (Instructions for iOS/Android/Desktop) */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center flex flex-col items-center gap-4">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-xl bg-stone-800/60 hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Icon Preview */}
            <img
              src="./icon-512.png"
              alt="Soroban Zen Icon"
              className="w-20 h-20 rounded-2xl shadow-2xl shadow-orange-950/80 border-2 border-orange-500/50 object-cover mt-2"
            />

            <div>
              <h3 className="text-xl font-black text-stone-100">
                Install Soroban Zen (そろばん)
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Install as a standalone application on your home screen with the official Japanese icon.
              </p>
            </div>

            {/* Platform Instructions */}
            <div className="w-full space-y-2.5 text-left text-xs mt-1">
              {/* Android */}
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-200 block mb-0.5">Android (Chrome / Samsung):</strong>
                  <span className="text-stone-300 leading-relaxed block">
                    Tap the <strong>"Install App"</strong> button in the header, or open Chrome's menu (<strong>⋮</strong>) and tap <strong className="text-orange-400">"Install app"</strong>.
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-1 italic">
                    ⚠️ Select <strong>"Install app"</strong> (NOT "Add to Home screen / Add shortcut") so Android generates a true standalone WebAPK with <strong>NO Chrome badge</strong>!
                  </span>
                </div>
              </div>

              {/* iPhone / iPad */}
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-start gap-3">
                <Share className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-200 block mb-0.5">iPhone & iPad (Safari):</strong>
                  <span className="text-stone-300 leading-relaxed block">
                    Tap the <strong>Share</strong> button (box with upward arrow) at the bottom of Safari, scroll down, and tap <strong>"Add to Home Screen"</strong>.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-colors shadow-lg shadow-orange-600/30"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
