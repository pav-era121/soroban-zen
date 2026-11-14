import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ColorGroupingMode, AbacusState } from '../types';
import { generateQuestionById } from '../utils/thousandQuestions';
import { Soroban } from './Soroban';
import {
  createEmptyAbacus,
  abacusToNumber,
  formatWithCommas,
} from '../utils/sorobanUtils';
import { sound } from '../audio/soundEffects';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Search,
} from 'lucide-react';

const SOLVED_STORAGE_KEY = 'soroban_1k_solved_ids';

interface ProblemBank1000Props {
  colorGrouping: ColorGroupingMode;
  onProblemSolved: (points: number) => void;
}

export const ProblemBank1000: React.FC<ProblemBank1000Props> = ({
  colorGrouping,
  onProblemSolved,
}) => {
  const [currentId, setCurrentId] = useState<number>(1);
  const [jumpInput, setJumpInput] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<number>(0); // 0 = all
  const [landscapeMode, setLandscapeMode] = useState<boolean>(false);
  const [showFingerGuide, setShowFingerGuide] = useState<boolean>(true);

  const [solvedIds, setSolvedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(SOLVED_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [abacusState, setAbacusState] = useState<AbacusState>(() => createEmptyAbacus(13));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Save solved IDs
  useEffect(() => {
    try {
      localStorage.setItem(SOLVED_STORAGE_KEY, JSON.stringify(solvedIds));
    } catch {
      // ignore
    }
  }, [solvedIds]);

  const currentQ = generateQuestionById(currentId);
  const isSolved = solvedIds.includes(currentId);
  const currentAbacusValue = abacusToNumber(abacusState);

  // Reset state when question changes
  useEffect(() => {
    setFeedback('idle');
    setShowHint(false);
    setAbacusState(createEmptyAbacus(13));
  }, [currentId]);

  const handleVerify = () => {
    if (currentAbacusValue === currentQ.expectedResult) {
      setFeedback('correct');
      sound.playSuccessChime();

      if (!solvedIds.includes(currentId)) {
        const updated = [...solvedIds, currentId];
        setSolvedIds(updated);
        onProblemSolved(20);
      }

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e05638', '#d97736', '#f3a152', '#34d399'],
        });
      } catch {
        // ignore
      }
    } else {
      setFeedback('incorrect');
      sound.playClack(true, 0.6);
    }
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(jumpInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 1000) {
      setCurrentId(val);
      setJumpInput('');
    }
  };

  const handleNextUnsolved = () => {
    for (let i = currentId + 1; i <= 1000; i++) {
      if (!solvedIds.includes(i)) {
        setCurrentId(i);
        return;
      }
    }
    // wrap around
    for (let i = 1; i < currentId; i++) {
      if (!solvedIds.includes(i)) {
        setCurrentId(i);
        return;
      }
    }
  };

  const stages = [
    { id: 0, label: 'All 1,000 Questions' },
    { id: 1, label: 'Stage 1: Direct Moves (#1–150)' },
    { id: 2, label: 'Stage 2: Friends of 5 (#151–300)' },
    { id: 3, label: 'Stage 3: Friends of 10 (#301–450)' },
    { id: 4, label: 'Stage 4: Mixed Combinations (#451–600)' },
    { id: 5, label: 'Stage 5: Multiplication (#601–750)' },
    { id: 6, label: 'Stage 6: Division Wari-zan (#751–900)' },
    { id: 7, label: 'Stage 7: Grandmaster (#901–1000)' },
  ];

  return (
    <div className={`w-full mx-auto flex flex-col gap-6 ${landscapeMode ? 'max-w-6xl' : 'max-w-4xl'}`}>
      {/* 1,000 Question Bank Header & Progress Bar */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-600/30 border border-orange-500/30 text-white font-serif font-black text-xl">
              千
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-100 uppercase tracking-wide">
                  1,000 Shuzan Problem Bank
                </h2>
                <span className="text-xs text-orange-400 font-mono">千問特訓</span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Structured progressive training bank: 1,000 numbered problems across all 7 stages.
              </p>
            </div>
          </div>

          {/* Quick Jump Input */}
          <form onSubmit={handleJump} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder="Jump #1–1000"
                className="w-36 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 outline-none focus:border-orange-500"
              />
              <Search className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200"
            >
              Go
            </button>
          </form>
        </div>

        {/* 1,000 Progress Bar */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400">
              Completed:{' '}
              <strong className="text-orange-400 font-mono text-sm">{solvedIds.length}</strong> / 1,000 Problems
            </span>
            <span className="font-mono text-stone-300 font-bold">
              {((solvedIds.length / 1000) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(solvedIds.length / 1000) * 100}%` }}
            />
          </div>
        </div>

        {/* Stage Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="text-stone-500 font-semibold uppercase tracking-wider text-[10px]">Filter:</span>
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStageFilter(st.id);
                if (st.id > 0) {
                  // Jump to start of stage
                  const startIds = [1, 1, 151, 301, 451, 601, 751, 901];
                  setCurrentId(startIds[st.id]);
                }
              }}
              className={`px-2.5 py-1 rounded-lg border transition-all text-[11px] ${
                stageFilter === st.id
                  ? 'bg-orange-600 text-white border-orange-500 font-bold'
                  : 'bg-stone-800/60 text-stone-400 border-stone-700/50 hover:text-stone-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card & Landscape Mode Controls */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl flex flex-col items-center gap-4 relative">
        {/* Landscape Mode & Finger Guide Toggles */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-orange-400 bg-orange-950/60 border border-orange-800/40 px-3 py-1 rounded-full">
              Problem #{currentId} of 1,000
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {currentQ.stageJapanese}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Finger technique guide toggle */}
            <button
              onClick={() => setShowFingerGuide(!showFingerGuide)}
              title="Show Thumb & Middle finger hints"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showFingerGuide
                  ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
            >
              👍 Finger Guide: {showFingerGuide ? 'ON' : 'OFF'}
            </button>

            {/* Landscape Desk Mode Toggle */}
            <button
              onClick={() => setLandscapeMode(!landscapeMode)}
              title="Toggle Wide Landscape Soroban Desk View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                landscapeMode
                  ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
              }`}
            >
              {landscapeMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{landscapeMode ? 'Standard Width' : 'Landscape Desk View'}</span>
            </button>
          </div>
        </div>

        {/* The Math Problem */}
        {currentQ.category === 'mitorizan' && currentQ.numbers ? (
          <div className="flex flex-col items-end gap-1 font-mono font-black text-3xl sm:text-4xl text-stone-100 tracking-wider bg-stone-950/80 px-8 py-4 rounded-2xl border border-stone-800 my-2">
            {currentQ.numbers.map((n, idx) => (
              <div key={idx} className="flex items-center justify-between w-full min-w-[140px] text-right">
                <span className="text-orange-500 text-2xl mr-3 font-normal">
                  {idx > 0 && n < 0 ? '-' : idx > 0 ? '+' : ''}
                </span>
                <span>{formatWithCommas(Math.abs(n))}</span>
              </div>
            ))}
            <div className="w-full border-t-2 border-stone-700 my-1"></div>
            <div className="text-orange-400 text-2xl">?</div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 text-4xl sm:text-5xl font-black font-mono text-stone-100 tracking-wider my-3">
            <span>{formatWithCommas(currentQ.num1 ?? 0)}</span>
            <span className="text-orange-500">{currentQ.operation}</span>
            <span>{formatWithCommas(currentQ.num2 ?? 0)}</span>
            <span className="text-stone-600">=</span>
            <span className="text-orange-400">?</span>
          </div>
        )}

        {/* Hint toggle */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHint ? 'Hide Strategy Hint' : 'Show Technique Hint'}
          </button>
          {showHint && (
            <div className="bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs px-4 py-2 rounded-xl max-w-lg leading-relaxed animate-fadeIn">
              {currentQ.hint}
            </div>
          )}
        </div>
      </div>

      {/* The Interactive Soroban with Slide/Flick gestures and Landscape Mode */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
        {/* Value readout */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="text-xs text-stone-400 font-medium">
            Your Abacus: <span className="text-stone-100 font-mono font-bold text-lg">{formatWithCommas(currentAbacusValue)}</span>
          </div>

          {feedback === 'correct' && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-xl">
              <CheckCircle2 className="w-4 h-4" /> Correct! Problem #{currentId} Solved
            </div>
          )}

          {feedback === 'incorrect' && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-rose-400 bg-rose-950/60 border border-rose-800/50 px-3 py-1 rounded-xl">
              <AlertCircle className="w-4 h-4" /> Not quite right (check hint or re-slide)
            </div>
          )}

          {isSolved && feedback !== 'correct' && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" /> Previously Solved
            </div>
          )}
        </div>

        <Soroban
          state={abacusState}
          onChange={setAbacusState}
          colorGrouping={colorGrouping}
          landscapeMode={landscapeMode}
          showFingerGuide={showFingerGuide}
          showPlaceLabels={true}
          showRodValues={true}
        />

        {/* Navigation & Action Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-6 px-2">
          {/* Previous / Next Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentId((prev) => Math.max(1, prev - 1))}
              disabled={currentId <= 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <button
              onClick={() => setCurrentId((prev) => Math.min(1000, prev + 1))}
              disabled={currentId >= 1000}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextUnsolved}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Next Unsolved
            </button>
          </div>

          {/* Clear & Verify */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAbacusState(createEmptyAbacus(13));
                sound.playResetSweep();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Beads
            </button>

            {feedback === 'correct' ? (
              <button
                onClick={() => setCurrentId((prev) => Math.min(1000, prev + 1))}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all"
              >
                Next Problem (#{currentId + 1}) →
              </button>
            ) : (
              <button
                onClick={handleVerify}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/30 transition-all transform hover:scale-[1.02]"
              >
                Verify Answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
