import React, { useState } from 'react';
import type { ColorGroupingMode, AbacusState } from '../types';
import { Soroban } from './Soroban';
import {
  createEmptyAbacus,
  abacusToNumber,
  numberToAbacus,
  formatWithCommas,
} from '../utils/sorobanUtils';
import { sound } from '../audio/soundEffects';
import {
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ZenSandboxProps {
  colorGrouping: ColorGroupingMode;
  setColorGrouping: (mode: ColorGroupingMode) => void;
}

export const ZenSandbox: React.FC<ZenSandboxProps> = ({
  colorGrouping,
  setColorGrouping,
}) => {
  const [rodCount, setRodCount] = useState<number>(9);
  const [abacusState, setAbacusState] = useState<AbacusState>(() => createEmptyAbacus(9));
  const [customInput, setCustomInput] = useState('');
  const [showPlaceLabels, setShowPlaceLabels] = useState(true);
  const [showRodValues, setShowRodValues] = useState(true);

  // When rod count changes, resize abacus preserving value if possible
  const handleRodCountChange = (newCount: number) => {
    const currentVal = abacusToNumber(abacusState);
    setRodCount(newCount);
    setAbacusState(numberToAbacus(currentVal, newCount));
  };

  const handleClear = () => {
    setAbacusState(createEmptyAbacus(rodCount));
    sound.playResetSweep();
  };

  const handleSetCustomNumber = () => {
    const val = parseInt(customInput.replace(/,/g, ''), 10);
    if (!isNaN(val) && val >= 0) {
      setAbacusState(numberToAbacus(val, rodCount));
      sound.playResetSweep();
    }
  };

  const totalValue = abacusToNumber(abacusState);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Top Value Display & Controls */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-1">
            Current Soroban Value
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-stone-100 tracking-wider">
            {formatWithCommas(totalValue)}
          </div>
        </div>

        {/* Set to number quick input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSetCustomNumber();
            }}
            placeholder="Type any number..."
            className="w-36 sm:w-44 bg-stone-950 border border-stone-700/80 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 outline-none focus:border-orange-500"
          />
          <button
            onClick={handleSetCustomNumber}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          >
            Set Beads
          </button>
        </div>
      </div>

      {/* Visual Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs">
        {/* Color Grouping Switcher (addresses user's specific request!) */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-semibold uppercase tracking-wider">Bead Colors:</span>
          <button
            onClick={() => setColorGrouping('alternating3')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              colorGrouping === 'alternating3'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                : 'bg-stone-800/60 text-stone-400 border-stone-700/50 hover:text-stone-200'
            }`}
          >
            3-Column Groups (Thousands / Millions Aid)
          </button>
          <button
            onClick={() => setColorGrouping('uniform')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              colorGrouping === 'uniform'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                : 'bg-stone-800/60 text-stone-400 border-stone-700/50 hover:text-stone-200'
            }`}
          >
            Classic Uniform Terracotta (Anzan Pure)
          </button>
        </div>

        {/* Rod Count Selector */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-semibold uppercase tracking-wider">Rods:</span>
          {[7, 9, 13].map((cnt) => (
            <button
              key={cnt}
              onClick={() => handleRodCountChange(cnt)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                rodCount === cnt
                  ? 'bg-orange-600 text-white border-orange-500'
                  : 'bg-stone-800/60 text-stone-400 border-stone-700/50 hover:bg-stone-800'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>

      {/* THE INTERACTIVE SOROBAN */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
        <Soroban
          state={abacusState}
          onChange={setAbacusState}
          colorGrouping={colorGrouping}
          showPlaceLabels={showPlaceLabels}
          showRodValues={showRodValues}
        />

        {/* Bottom Actions */}
        <div className="w-full flex items-center justify-between mt-6 px-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800/70 hover:bg-stone-800 border border-stone-700/60 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear All Beads (Reset)
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPlaceLabels(!showPlaceLabels)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showPlaceLabels
                  ? 'bg-stone-800 text-stone-200 border-stone-600'
                  : 'text-stone-500 border-transparent hover:text-stone-300'
              }`}
            >
              Place Labels
            </button>

            <button
              onClick={() => setShowRodValues(!showRodValues)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showRodValues
                  ? 'bg-stone-800 text-stone-200 border-stone-600'
                  : 'text-stone-500 border-transparent hover:text-stone-300'
              }`}
            >
              Digit Values
            </button>
          </div>
        </div>
      </div>

      {/* Zen Tips */}
      <div className="bg-stone-950/60 border border-stone-800/60 rounded-2xl p-4 text-xs text-stone-400 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-stone-200 font-semibold">Traditional Soroban Finger Rules:</strong> Use your{' '}
          <span className="text-orange-400 font-medium">thumb</span> to push lower earth beads UP towards the beam. Use your{' '}
          <span className="text-orange-400 font-medium">index finger</span> to pull lower earth beads DOWN, and to move the upper heaven bead (5) in both directions.
        </div>
      </div>
    </div>
  );
};
