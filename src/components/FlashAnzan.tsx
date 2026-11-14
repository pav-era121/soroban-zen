import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { ColorGroupingMode, AbacusState } from '../types';
import { Soroban } from './Soroban';
import {
  createEmptyAbacus,
  abacusToNumber,
} from '../utils/sorobanUtils';
import { sound } from '../audio/soundEffects';
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FlashAnzanProps {
  colorGrouping: ColorGroupingMode;
  onSuccess: (xp: number) => void;
}

type AnzanStage = 'ready' | 'flashing' | 'input' | 'result';

export const FlashAnzan: React.FC<FlashAnzanProps> = ({
  colorGrouping,
  onSuccess,
}) => {
  const [stage, setStage] = useState<AnzanStage>('ready');
  const [speedMs, setSpeedMs] = useState(1200); // interval per number
  const [numberCount, setNumberCount] = useState(4); // how many numbers to flash
  const [digits, setDigits] = useState<1 | 2>(1); // 1-digit or 2-digit numbers
  const [useGhostAbacus, setUseGhostAbacus] = useState(true);

  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [userAnswer, setUserAnswer] = useState('');
  const [abacusState, setAbacusState] = useState<AbacusState>(() => createEmptyAbacus(9));
  const [useAbacusInput, setUseAbacusInput] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate sequence of valid Soroban numbers (keeping running total >= 0)
  const generateSequence = () => {
    const list: number[] = [];
    let runningTotal = 0;

    for (let i = 0; i < numberCount; i++) {
      let num: number;
      if (digits === 1) {
        // 1-digit: 1 to 9, or negative if runningTotal allows
        const canSubtract = runningTotal >= 4 && Math.random() > 0.6;
        if (canSubtract) {
          num = -Math.floor(Math.random() * Math.min(runningTotal, 4) + 1);
        } else {
          num = Math.floor(Math.random() * 8) + 1;
        }
      } else {
        // 2-digit: 10 to 45
        const canSubtract = runningTotal >= 25 && Math.random() > 0.6;
        if (canSubtract) {
          num = -Math.floor(Math.random() * 20 + 5);
        } else {
          num = Math.floor(Math.random() * 30 + 10);
        }
      }
      runningTotal += num;
      list.push(num);
    }
    return list;
  };

  const startFlash = () => {
    const list = generateSequence();
    setSequence(list);
    setStage('flashing');
    setCurrentIndex(0);
    setUserAnswer('');
    setAbacusState(createEmptyAbacus(9));

    sound.playClack(false, 1.2);

    let idx = 0;
    timerRef.current = setInterval(() => {
      idx++;
      if (idx < list.length) {
        setCurrentIndex(idx);
        sound.playClack(false, 1.1 + Math.random() * 0.2);
      } else {
        // Finished flashing, move to input
        if (timerRef.current) clearInterval(timerRef.current);
        setStage('input');
        setCurrentIndex(-1);
      }
    }, speedMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const totalSum = sequence.reduce((acc, curr) => acc + curr, 0);

  const handleCheckAnswer = () => {
    const finalAnswer = useAbacusInput
      ? abacusToNumber(abacusState)
      : parseInt(userAnswer, 10);

    setStage('result');
    if (finalAnswer === totalSum) {
      sound.playSuccessChime();
      onSuccess(50);
      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e05638', '#d97736', '#f59e42', '#34d399'],
        });
      } catch {
        // ignore
      }
    } else {
      sound.playClack(true, 0.6);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Info */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-orange-600/20 text-orange-500 border border-orange-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-stone-100">Flash Anzan (暗算)</h2>
          </div>
          <p className="text-xs text-stone-400 mt-1 max-w-lg">
            Mental Soroban training: Numbers flash rapidly. Train yourself to visualize the beads moving inside your mind!
          </p>
        </div>

        {/* Ghost Abacus Toggle */}
        <button
          onClick={() => setUseGhostAbacus(!useGhostAbacus)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            useGhostAbacus
              ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
              : 'bg-stone-800 border-stone-700 text-stone-400'
          }`}
        >
          {useGhostAbacus ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {useGhostAbacus ? 'Ghost Abacus Guide: ON' : 'Blind Anzan (No Visuals)'}
        </button>
      </div>

      {/* Controls & Configuration */}
      {stage === 'ready' && (
        <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Speed selection */}
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                Flash Speed
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ms: 1500, label: 'Gentle (1.5s)' },
                  { ms: 1000, label: 'Brisk (1.0s)' },
                  { ms: 600, label: 'Fast (0.6s)' },
                ].map((s) => (
                  <button
                    key={s.ms}
                    onClick={() => setSpeedMs(s.ms)}
                    className={`px-2 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      speedMs === s.ms
                        ? 'bg-orange-600 text-white border-orange-500 font-bold'
                        : 'bg-stone-800/60 text-stone-300 border-stone-700/50 hover:bg-stone-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Numbers count */}
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                Number of Flashes
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 7].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setNumberCount(cnt)}
                    className={`px-2 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      numberCount === cnt
                        ? 'bg-orange-600 text-white border-orange-500 font-bold'
                        : 'bg-stone-800/60 text-stone-300 border-stone-700/50 hover:bg-stone-800'
                    }`}
                  >
                    {cnt} Numbers
                  </button>
                ))}
              </div>
            </div>

            {/* Digits */}
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                Digit Complexity
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDigits(1)}
                  className={`px-2 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    digits === 1
                      ? 'bg-orange-600 text-white border-orange-500 font-bold'
                      : 'bg-stone-800/60 text-stone-300 border-stone-700/50 hover:bg-stone-800'
                  }`}
                >
                  1-Digit (1-9)
                </button>
                <button
                  onClick={() => setDigits(2)}
                  className={`px-2 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    digits === 2
                      ? 'bg-orange-600 text-white border-orange-500 font-bold'
                      : 'bg-stone-800/60 text-stone-300 border-stone-700/50 hover:bg-stone-800'
                  }`}
                >
                  2-Digits (10-45)
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={startFlash}
              className="flex items-center gap-3 px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 transition-all transform hover:scale-[1.03]"
            >
              <Play className="w-5 h-5 fill-white" /> Start Flash Anzan Session
            </button>
          </div>
        </div>
      )}

      {/* FLASH SCREEN (During active flashing) */}
      {stage === 'flashing' && (
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[280px]">
          <div className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
            Flash {currentIndex + 1} of {sequence.length}
          </div>
          <div className="text-7xl sm:text-8xl font-black font-mono text-orange-400 tracking-wider animate-scaleIn">
            {sequence[currentIndex] > 0
              ? `+${sequence[currentIndex]}`
              : sequence[currentIndex]}
          </div>
        </div>
      )}

      {/* INPUT STAGE */}
      {stage === 'input' && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl flex flex-col items-center gap-5">
          <div className="text-sm uppercase tracking-wider font-semibold text-stone-400">
            What was the final total?
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseAbacusInput(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                !useAbacusInput
                  ? 'bg-orange-600 text-white border-orange-500'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
            >
              Type Number
            </button>
            <button
              onClick={() => setUseAbacusInput(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                useAbacusInput
                  ? 'bg-orange-600 text-white border-orange-500'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
            >
              Set on Virtual Abacus
            </button>
          </div>

          {!useAbacusInput ? (
            <div className="flex items-center gap-3">
              <input
                type="number"
                autoFocus
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userAnswer) handleCheckAnswer();
                }}
                placeholder="Enter Sum"
                className="w-44 text-3xl font-mono font-bold text-center bg-stone-950 border border-stone-700 rounded-2xl py-3 text-stone-100 outline-none focus:border-orange-500"
              />
              <button
                onClick={handleCheckAnswer}
                disabled={!userAnswer}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-40 transition-all"
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              <button
                onClick={handleCheckAnswer}
                className="px-8 py-3 rounded-2xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all"
              >
                Submit Abacus Answer ({abacusToNumber(abacusState)})
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESULT STAGE */}
      {stage === 'result' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl flex flex-col items-center gap-4">
          {((useAbacusInput ? abacusToNumber(abacusState) : parseInt(userAnswer, 10)) === totalSum) ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-1">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400">Brilliant Mental Focus!</h3>
              <p className="text-xs text-stone-300">You accurately computed the stream in your mind. +50 XP</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-1">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-rose-400">Close Effort!</h3>
              <p className="text-xs text-stone-300">
                Correct total was <span className="font-mono font-bold text-stone-100 text-sm">{totalSum}</span>
              </p>
            </div>
          )}

          {/* Sequence review */}
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 w-full max-w-lg mt-2">
            <div className="text-xs text-stone-400 uppercase tracking-wider mb-2 font-semibold">
              Flash Sequence Breakdown
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-mono font-bold">
              {sequence.map((n, i) => (
                <span key={i} className="px-2 py-1 bg-stone-900 rounded-lg text-stone-200 border border-stone-800">
                  {n > 0 ? `+${n}` : n}
                </span>
              ))}
              <span className="text-stone-500">=</span>
              <span className="text-orange-400 text-base">{totalSum}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => setStage('ready')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Configure / Replay
            </button>
            <button
              onClick={startFlash}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-600/30 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Try Another Sequence
            </button>
          </div>
        </div>
      )}

      {/* GHOST ABACUS DISPLAY (When enabled or when in abacus input mode) */}
      {(useGhostAbacus || useAbacusInput) && (
        <div className="bg-stone-900/40 border border-stone-800/60 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col items-center">
          <div className="text-xs text-stone-500 uppercase tracking-wider mb-3 font-semibold">
            {useGhostAbacus && !useAbacusInput ? 'Ghost Visualization Aid' : 'Set Your Answer'}
          </div>
          <Soroban
            state={abacusState}
            onChange={setAbacusState}
            colorGrouping={colorGrouping}
            ghostMode={useGhostAbacus && !useAbacusInput}
            readOnly={!useAbacusInput}
            showPlaceLabels={true}
            showRodValues={useAbacusInput}
          />
        </div>
      )}
    </div>
  );
};
