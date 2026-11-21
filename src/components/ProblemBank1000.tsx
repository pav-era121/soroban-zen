import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import type { ColorGroupingMode, AbacusState } from '../types';
import {
  generateQuestionById,
  STAGES_INFO,
  TOTAL_CORE_QUESTIONS,
  MAX_QUESTION_ID,
} from '../utils/thousandQuestions';
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
  Flame,
  Grid,
  X,
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
  const [rodCount, setRodCount] = useState<number>(13);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [mapStageTab, setMapStageTab] = useState<number>(1);
  const [mapSearch, setMapSearch] = useState<string>('');

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

  const currentQ = useMemo(() => generateQuestionById(currentId), [currentId]);
  const isSolved = solvedIds.includes(currentId);
  const currentAbacusValue = abacusToNumber(abacusState);
  const isKishin = currentId > TOTAL_CORE_QUESTIONS;

  // Auto-adapt rod count for huge Kishin numbers if needed
  useEffect(() => {
    if (isKishin && rodCount < 17 && currentQ.expectedResult > 99999999) {
      setRodCount(17);
    }
  }, [isKishin, currentQ.expectedResult, rodCount]);

  // Reset state when question changes
  useEffect(() => {
    setFeedback('idle');
    setShowHint(false);
    setAbacusState(createEmptyAbacus(rodCount));
  }, [currentId, rodCount]);

  const handleVerify = () => {
    if (currentAbacusValue === currentQ.expectedResult) {
      setFeedback('correct');
      sound.playSuccessChime();

      if (!solvedIds.includes(currentId)) {
        const updated = [...solvedIds, currentId];
        setSolvedIds(updated);
        onProblemSolved(isKishin ? 50 : 20);
      }

      try {
        confetti({
          particleCount: isKishin ? 90 : 50,
          spread: isKishin ? 90 : 70,
          origin: { y: 0.6 },
          colors: isKishin
            ? ['#ef4444', '#dc2626', '#b91c1c', '#f59e42', '#ffd700']
            : ['#e05638', '#d97736', '#f3a152', '#34d399'],
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
    if (!isNaN(val) && val >= 1 && val <= MAX_QUESTION_ID) {
      setCurrentId(val);
      setJumpInput('');
    }
  };

  const handleNextUnsolved = () => {
    // Look ahead from currentId
    for (let i = currentId + 1; i <= MAX_QUESTION_ID; i++) {
      if (!solvedIds.includes(i)) {
        setCurrentId(i);
        return;
      }
    }
    // Wrap around from 1
    for (let i = 1; i < currentId; i++) {
      if (!solvedIds.includes(i)) {
        setCurrentId(i);
        return;
      }
    }
  };

  const coreSolvedCount = useMemo(
    () => solvedIds.filter((id) => id <= TOTAL_CORE_QUESTIONS).length,
    [solvedIds]
  );
  const kishinSolvedCount = useMemo(
    () => solvedIds.filter((id) => id > TOTAL_CORE_QUESTIONS).length,
    [solvedIds]
  );

  // Switch rod count
  const handleRodCountChange = (newCount: number) => {
    setRodCount(newCount);
    setAbacusState(createEmptyAbacus(newCount));
  };

  // Stage list for filtering
  const stageFilterOptions = [
    { id: 0, label: 'All Questions (#1–1100)' },
    ...STAGES_INFO.map((s) => ({
      id: s.id,
      label: s.isKishin ? `🔥 ${s.name} (#${s.range[0]}–${s.range[1]})` : `${s.name} (#${s.range[0]}–${s.range[1]})`,
      startId: s.range[0],
    })),
  ];

  // Stage selected in the map modal
  const activeMapStage = STAGES_INFO.find((s) => s.id === mapStageTab) || STAGES_INFO[0];
  const stageQuestionsList = useMemo(() => {
    const list: number[] = [];
    for (let i = activeMapStage.range[0]; i <= activeMapStage.range[1]; i++) {
      if (!mapSearch || i.toString().includes(mapSearch)) {
        list.push(i);
      }
    }
    return list;
  }, [activeMapStage, mapSearch]);

  return (
    <div
      className={`w-full mx-auto flex flex-col gap-6 ${
        landscapeMode ? 'max-w-6xl' : 'max-w-4xl'
      }`}
    >
      {/* 1,000 + Kishin Question Bank Header & Progress Bar */}
      <div
        className={`border p-5 rounded-3xl flex flex-col gap-4 shadow-2xl transition-colors duration-300 ${
          isKishin
            ? 'bg-gradient-to-br from-[#1c0f0d] via-stone-900 to-[#2b0c08] border-red-800/60 shadow-red-950/40'
            : 'bg-stone-900/90 border-stone-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white font-serif font-black text-xl border transition-all ${
                isKishin
                  ? 'bg-gradient-to-br from-red-600 to-rose-900 border-red-500 shadow-red-600/50 animate-pulse'
                  : 'bg-gradient-to-br from-amber-600 to-orange-700 border-orange-500/30 shadow-orange-600/30'
              }`}
            >
              {isKishin ? '鬼' : '千'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-100 uppercase tracking-wide flex items-center gap-2">
                  <span>{isKishin ? 'Kishin Demonic Trial' : '1,000 Shuzan Problem Bank'}</span>
                  {isKishin && (
                    <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-900/80 border border-red-500 text-red-200">
                      <Flame className="w-3 h-3 text-red-400" /> Devil Level
                    </span>
                  )}
                </h2>
                <span className="text-xs font-mono text-orange-400">
                  {isKishin ? '鬼神の試練' : '千問特訓'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {isKishin
                  ? 'Extreme Grandmaster realm: Multi-million calculations, 8-row columns, and multi-digit division.'
                  : 'Comprehensive numbered progressive curriculum: 1,000 core problems + 100 鬼神 Kishin challenges.'}
              </p>
            </div>
          </div>

          {/* Quick Actions: Question Map & Jump */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMapStageTab(currentQ.stage);
                setShowMapModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors shadow-sm"
              title="Open Question Map (問題一覧)"
            >
              <Grid className="w-3.5 h-3.5 text-orange-400" />
              <span>Question Map</span>
            </button>

            <form onSubmit={handleJump} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={MAX_QUESTION_ID}
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  placeholder={`#1–${MAX_QUESTION_ID}`}
                  className="w-32 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 outline-none focus:border-orange-500"
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
        </div>

        {/* Progress Bars (Core 1,000 + Kishin 100) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-stone-800">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-4">
              <span className="text-stone-400">
                Core Solved:{' '}
                <strong className="text-orange-400 font-mono text-sm">
                  {coreSolvedCount}
                </strong>{' '}
                / 1,000
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-red-400 font-medium flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500" />
                鬼神 Kishin Solved:{' '}
                <strong className="text-red-300 font-mono text-sm">
                  {kishinSolvedCount}
                </strong>{' '}
                / 100
              </span>
            </div>
            <span className="font-mono text-stone-300 font-bold">
              Total Progress: {(((coreSolvedCount + kishinSolvedCount) / MAX_QUESTION_ID) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800 flex">
            {/* Core Progress */}
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(coreSolvedCount / MAX_QUESTION_ID) * 100}%` }}
            />
            {/* Kishin Progress */}
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
              style={{ width: `${(kishinSolvedCount / MAX_QUESTION_ID) * 100}%` }}
            />
          </div>
        </div>

        {/* Stage Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
          <span className="text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
            Stage:
          </span>
          {stageFilterOptions.map((st) => {
            const isSelected = stageFilter === st.id;
            const isKishinChip = st.id === 8;
            return (
              <button
                key={st.id}
                onClick={() => {
                  setStageFilter(st.id);
                  if (st.id > 0 && 'startId' in st && typeof st.startId === 'number') {
                    setCurrentId(st.startId);
                  }
                }}
                className={`px-2.5 py-1 rounded-xl border transition-all text-[11px] font-medium flex items-center gap-1 ${
                  isSelected
                    ? isKishinChip
                      ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white border-red-500 font-black shadow-lg shadow-red-700/40'
                      : 'bg-orange-600 text-white border-orange-500 font-bold shadow-md shadow-orange-600/30'
                    : isKishinChip
                    ? 'bg-red-950/40 text-red-300 border-red-800/40 hover:bg-red-900/40 hover:text-red-200'
                    : 'bg-stone-800/60 text-stone-400 border-stone-700/50 hover:text-stone-200'
                }`}
              >
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kishin Entrance Banner if in Stage 8 */}
      {isKishin && (
        <div className="bg-gradient-to-r from-red-950/80 via-stone-950 to-red-950/80 border-2 border-red-600/60 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 font-black text-2xl shrink-0">
              🔥
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-red-400 flex items-center gap-1.5">
                <span>The Oni Realm</span>
                <span className="text-stone-500">•</span>
                <span>鬼神の領域</span>
              </div>
              <h3 className="text-lg font-black text-stone-100 mt-0.5">
                Kishin Demonic Trial (Devil Level)
              </h3>
              <p className="text-xs text-stone-300">
                You are facing extreme championship problems. Use all your Anzan discipline and switch to 17 rods if needed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRodCountChange(17)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                rodCount === 17
                  ? 'bg-red-600 text-white border-red-400'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
              }`}
            >
              Set 17 Rods (Max Width)
            </button>
          </div>
        </div>
      )}

      {/* Question Card & Landscape Mode Controls */}
      <div
        className={`border rounded-3xl p-6 sm:p-8 text-center shadow-xl flex flex-col items-center gap-4 relative transition-colors ${
          isKishin
            ? 'bg-stone-900/95 border-red-900/60 shadow-red-950/30'
            : 'bg-stone-900/90 border-stone-800'
        }`}
      >
        {/* Top Badges & Control Toggles */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${
                isKishin
                  ? 'bg-red-950 text-red-300 border-red-700/60 font-black'
                  : 'text-orange-400 bg-orange-950/60 border-orange-800/40'
              }`}
            >
              Problem #{currentId} of {MAX_QUESTION_ID}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {currentQ.stageJapanese}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Rod count selector */}
            <div className="flex items-center bg-stone-950 rounded-xl p-0.5 border border-stone-800 text-xs">
              <button
                onClick={() => handleRodCountChange(13)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  rodCount === 13 ? 'bg-orange-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                13 Rods
              </button>
              <button
                onClick={() => handleRodCountChange(17)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  rodCount === 17 ? 'bg-orange-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                17 Rods
              </button>
            </div>

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
              👍 Guide: {showFingerGuide ? 'ON' : 'OFF'}
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
              {landscapeMode ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span>{landscapeMode ? 'Standard' : 'Desk View'}</span>
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* THE MATH PROBLEM RENDERER (BULLETPROOF FOR EVERY QUESTION)      */}
        {/* ================================================================ */}
        {currentQ.numbers && currentQ.numbers.length > 2 ? (
          /* Multi-Row Columnar Format for 3+ Rows (Stage 1, Stage 7 Mitori-zan, Stage 8 Kishin) */
          <div
            className={`flex flex-col items-end gap-1 font-mono font-black text-2xl sm:text-4xl text-stone-100 tracking-wider px-8 py-5 rounded-2xl border my-2 transition-all ${
              isKishin
                ? 'bg-stone-950/90 border-red-900/60 shadow-lg shadow-red-950/30'
                : 'bg-stone-950/80 border-stone-800'
            }`}
          >
            {currentQ.numbers.map((n, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between w-full min-w-[180px] sm:min-w-[220px] text-right"
              >
                <span className="text-orange-500 text-xl sm:text-2xl mr-3 font-normal">
                  {idx > 0 && n < 0 ? '-' : idx > 0 ? '+' : ''}
                </span>
                <span>{formatWithCommas(Math.abs(n))}</span>
              </div>
            ))}
            <div className="w-full border-t-2 border-stone-700 my-1"></div>
            <div className={`${isKishin ? 'text-red-400' : 'text-orange-400'} text-2xl`}>?</div>
          </div>
        ) : (
          /* Horizontal Equation Format (Stages 2, 3, 4, 5, 6, 7 Mult/Div, Kishin Mult/Div) */
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-3xl sm:text-5xl font-black font-mono text-stone-100 tracking-wider my-4 flex-wrap">
            <span>
              {formatWithCommas(
                currentQ.num1 ??
                  (currentQ.numbers && currentQ.numbers.length > 0 ? currentQ.numbers[0] : 0)
              )}
            </span>
            <span className={isKishin ? 'text-red-500' : 'text-orange-500'}>
              {currentQ.operation ??
                (currentQ.numbers && currentQ.numbers.length > 1 && currentQ.numbers[1] < 0
                  ? '-'
                  : '+')}
            </span>
            <span>
              {formatWithCommas(
                currentQ.num2 ??
                  (currentQ.numbers && currentQ.numbers.length > 1
                    ? Math.abs(currentQ.numbers[1])
                    : 0)
              )}
            </span>
            <span className="text-stone-600">=</span>
            <span className={isKishin ? 'text-red-400 font-extrabold' : 'text-orange-400'}>?</span>
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
            <div className="bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs px-4 py-2.5 rounded-xl max-w-lg leading-relaxed animate-fadeIn">
              {currentQ.hint}
            </div>
          )}
        </div>
      </div>

      {/* The Interactive Soroban with Slide/Flick gestures and Landscape Mode */}
      <div
        className={`border rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center transition-colors ${
          isKishin
            ? 'bg-stone-900/70 border-red-900/40 shadow-red-950/30'
            : 'bg-stone-900/60 border-stone-800'
        }`}
      >
        {/* Value readout & feedback status */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="text-xs text-stone-400 font-medium">
            Your Abacus ({rodCount} Rods):{' '}
            <span className="text-stone-100 font-mono font-bold text-lg">
              {formatWithCommas(currentAbacusValue)}
            </span>
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
          showQuickClearButton={true}
          onQuickClear={() => {
            setAbacusState(createEmptyAbacus(rodCount));
            sound.playResetSweep();
          }}
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
              onClick={() => setCurrentId((prev) => Math.min(MAX_QUESTION_ID, prev + 1))}
              disabled={currentId >= MAX_QUESTION_ID}
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
                setAbacusState(createEmptyAbacus(rodCount));
                sound.playResetSweep();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Beads
            </button>

            {feedback === 'correct' ? (
              <button
                onClick={() => setCurrentId((prev) => Math.min(MAX_QUESTION_ID, prev + 1))}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all"
              >
                Next Problem (#{currentId + 1}) →
              </button>
            ) : (
              <button
                onClick={handleVerify}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all transform hover:scale-[1.02] ${
                  isKishin
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/40'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/30'
                }`}
              >
                {isKishin ? 'Verify Kishin Answer' : 'Verify Answer'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* QUESTION MAP MODAL (問題一覧 - FULL ACCESS TO ALL 1,100 QUESTIONS)   */}
      {/* =================================================================== */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col gap-5 max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-lg">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-100 flex items-center gap-2">
                    <span>Question Map (問題一覧)</span>
                    <span className="text-xs font-mono text-orange-400 bg-orange-950/60 border border-orange-800/40 px-2 py-0.5 rounded-full">
                      All 1,100 Questions Verified
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Tap any question number to jump directly to it.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMapModal(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Selector Tabs in Modal */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-stone-800/60">
              {STAGES_INFO.map((st) => {
                const isSelected = mapStageTab === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setMapStageTab(st.id);
                      setMapSearch('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? st.isKishin
                          ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white border-red-500 shadow-md shadow-red-700/40'
                          : 'bg-orange-600 text-white border-orange-400 shadow-md shadow-orange-600/30'
                        : st.isKishin
                        ? 'bg-red-950/40 text-red-300 border-red-800/50 hover:bg-red-900/40'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <span>{st.name.split(':')[0]}</span>
                    <span className="opacity-75 font-mono text-[10px] ml-1">
                      (#{st.range[0]}–{st.range[1]})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stage Details & Search Box */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
              <div>
                <div className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <span>{activeMapStage.japanese}</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-orange-400 font-mono">
                    {activeMapStage.range[1] - activeMapStage.range[0] + 1} Problems
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {activeMapStage.description}
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by #..."
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  className="w-32 bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-xs font-mono text-stone-200 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Question Chips Grid (Scrollable) */}
            <div className="overflow-y-auto max-h-72 p-2 grid grid-cols-5 sm:grid-cols-10 gap-2">
              {stageQuestionsList.map((qid) => {
                const solved = solvedIds.includes(qid);
                const isCurrent = qid === currentId;
                const isDevil = qid > TOTAL_CORE_QUESTIONS;

                return (
                  <button
                    key={qid}
                    onClick={() => {
                      setCurrentId(qid);
                      setShowMapModal(false);
                      sound.playClack(false, 1.1);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all text-center flex flex-col items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-orange-400 bg-orange-600 text-white border-orange-300 shadow-md'
                        : solved
                        ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                        : isDevil
                        ? 'bg-red-950/50 border-red-800/40 text-red-300 hover:bg-red-900/50 hover:text-white'
                        : 'bg-stone-950 border-stone-800/80 text-stone-400 hover:border-stone-700 hover:text-stone-200 hover:bg-stone-800/60'
                    }`}
                  >
                    <span>#{qid}</span>
                    <span className="text-[9px]">
                      {solved ? '✓' : isDevil ? '🔥' : '•'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs text-stone-400 border-t border-stone-800 pt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Solved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Current
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-700"></span> Unsolved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> 鬼神 Kishin
                </span>
              </div>

              <div className="font-mono text-stone-300">
                Total Solved: {solvedIds.length} / {MAX_QUESTION_ID}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
