import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ColorGroupingMode, AbacusState } from '../types';
import { SENSEI_CURRICULUM } from '../data/curriculum';
import { Soroban } from './Soroban';
import { AnatomyDiagram } from './AnatomyDiagram';
import {
  createEmptyAbacus,
  numberToAbacus,
  abacusToNumber,
  formatWithCommas,
} from '../utils/sorobanUtils';
import { sound } from '../audio/soundEffects';
import {
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Award,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';

const COMPLETED_CHAPTERS_KEY = 'soroban_sensei_mastered_chapters';

interface SenseiClassroomProps {
  colorGrouping: ColorGroupingMode;
  onChapterMastered: (chapterId: string, points: number) => void;
}

type ChapterTab = 'lecture' | 'guided' | 'checkpoint';

export const SenseiClassroom: React.FC<SenseiClassroomProps> = ({
  colorGrouping,
  onChapterMastered,
}) => {
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ChapterTab>('lecture');

  // Guided Exercises State
  const [guidedIdx, setGuidedIdx] = useState<number>(0);
  const [guidedSuccess, setGuidedSuccess] = useState<boolean>(false);

  // Checkpoint State
  const [checkpointIdx, setCheckpointIdx] = useState<number>(0);
  const [checkpointCorrect, setCheckpointCorrect] = useState<boolean>(false);
  const [checkpointAnswers, setCheckpointAnswers] = useState<boolean[]>([]);
  const [showCheckpointHint, setShowCheckpointHint] = useState<boolean>(false);

  // Abacus State
  const [abacusState, setAbacusState] = useState<AbacusState>(() => createEmptyAbacus(13));
  const [landscapeMode, setLandscapeMode] = useState<boolean>(false);
  const [showFingerGuide, setShowFingerGuide] = useState<boolean>(true);

  // Mastered Chapters (Persisted in localStorage)
  const [masteredChapters, setMasteredChapters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_CHAPTERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMPLETED_CHAPTERS_KEY, JSON.stringify(masteredChapters));
    } catch {
      // ignore
    }
  }, [masteredChapters]);

  const currentChapter = SENSEI_CURRICULUM[selectedChapterIdx];
  const currentGuided = currentChapter.guidedExercises[guidedIdx];
  const currentCheckpoint = currentChapter.checkpointQuestions[checkpointIdx];
  const isChapterMastered = masteredChapters.includes(currentChapter.id);

  // Initialize abacus state when switching chapters or tabs
  useEffect(() => {
    if (activeTab === 'guided' && currentGuided) {
      setAbacusState(numberToAbacus(currentGuided.initialValue, 13));
      setGuidedSuccess(false);
    } else if (activeTab === 'checkpoint' && currentCheckpoint) {
      setAbacusState(numberToAbacus(currentCheckpoint.initialValue, 13));
      setCheckpointCorrect(false);
      setShowCheckpointHint(false);
    } else {
      setAbacusState(createEmptyAbacus(13));
    }
  }, [selectedChapterIdx, activeTab, guidedIdx, checkpointIdx]);

  const currentAbacusValue = abacusToNumber(abacusState);

  // Check guided exercise target
  useEffect(() => {
    if (activeTab === 'guided' && currentGuided && currentAbacusValue === currentGuided.targetValue && !guidedSuccess) {
      setGuidedSuccess(true);
      sound.playSuccessChime();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#e05638', '#d97736', '#f3a152', '#34d399'],
        });
      } catch {
        // ignore
      }
    }
  }, [currentAbacusValue, activeTab, currentGuided, guidedSuccess]);

  // Handle checkpoint answer verification
  const handleVerifyCheckpoint = () => {
    if (currentAbacusValue === currentCheckpoint.expectedResult) {
      setCheckpointCorrect(true);
      sound.playSuccessChime();

      const newAnswers = [...checkpointAnswers];
      newAnswers[checkpointIdx] = true;
      setCheckpointAnswers(newAnswers);

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

      // If all checkpoints for this chapter completed
      if (checkpointIdx === currentChapter.checkpointQuestions.length - 1) {
        if (!masteredChapters.includes(currentChapter.id)) {
          const updated = [...masteredChapters, currentChapter.id];
          setMasteredChapters(updated);
          onChapterMastered(currentChapter.id, 100);
        }
      }
    } else {
      setCheckpointCorrect(false);
      sound.playClack(true, 0.6);
    }
  };

  const handleNextGuided = () => {
    if (guidedIdx < currentChapter.guidedExercises.length - 1) {
      setGuidedIdx((prev) => prev + 1);
      setGuidedSuccess(false);
    } else {
      // Completed all guided exercises, move to Checkpoint!
      setActiveTab('checkpoint');
      setCheckpointIdx(0);
      setCheckpointAnswers([]);
    }
  };

  const handleNextCheckpoint = () => {
    if (checkpointIdx < currentChapter.checkpointQuestions.length - 1) {
      setCheckpointIdx((prev) => prev + 1);
      setCheckpointCorrect(false);
      setShowCheckpointHint(false);
    }
  };

  return (
    <div className={`w-full mx-auto flex flex-col gap-6 ${landscapeMode ? 'max-w-6xl' : 'max-w-4xl'}`}>
      {/* Academy Classroom Header & Progress Tracker */}
      <div className="bg-stone-900/95 border border-stone-800 p-5 rounded-3xl flex flex-col gap-4 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-500/30 text-white font-serif font-black text-xl">
              教
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-100 uppercase tracking-wide">
                  Sensei's Soroban Academy
                </h2>
                <span className="text-xs text-orange-400 font-mono">日本珠算本科カリキュラム</span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Structured progressive curriculum: from absolute zero to Japanese mental math mastery.
              </p>
            </div>
          </div>

          {/* Chapter Mastery Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-950/60 border border-orange-800/40 text-orange-300 text-xs font-bold">
              <Award className="w-4 h-4 text-orange-400" />
              <span>{masteredChapters.length} of {SENSEI_CURRICULUM.length} Chapters Mastered</span>
            </div>
          </div>
        </div>

        {/* Chapter Carousel / Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-stone-800/80">
          {SENSEI_CURRICULUM.map((ch, idx) => {
            const isSelected = selectedChapterIdx === idx;
            const isDone = masteredChapters.includes(ch.id);

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChapterIdx(idx);
                  setActiveTab('lecture');
                  setGuidedIdx(0);
                  setCheckpointIdx(0);
                  setCheckpointAnswers([]);
                  sound.playClack(false, 1.1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-400 shadow-md shadow-orange-600/30'
                    : isDone
                    ? 'bg-stone-800/80 text-emerald-400 border-emerald-800/50 hover:bg-stone-800'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <span>Ch.{ch.number}: {ch.title.split(':')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter Overview & Sensei's Banner */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-orange-400 bg-orange-950/60 border border-orange-800/40 px-2.5 py-0.5 rounded-full">
                {currentChapter.levelBadge}
              </span>
              <span className="text-xs text-stone-500 font-mono">
                ~{currentChapter.estimatedTimeMin} mins
              </span>
              {isChapterMastered && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Mastered (済)
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-stone-100 mt-1">
              Chapter {currentChapter.number}: {currentChapter.title}
            </h3>
            <div className="text-xs text-stone-400 font-serif italic mt-0.5">
              {currentChapter.japaneseTitle} • {currentChapter.subtitle}
            </div>
          </div>

          {/* Three Chapter Stage Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-950 border border-stone-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('lecture')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'lecture'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" /> 1. Sensei's Lecture
            </button>

            <button
              onClick={() => setActiveTab('guided')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'guided'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> 2. Guided Practice
            </button>

            <button
              onClick={() => setActiveTab('checkpoint')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'checkpoint'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> 3. Chapter Checkpoint
            </button>
          </div>
        </div>

        {/* Sensei's Mnemonic Chant Box */}
        <div className="bg-stone-950/70 border border-amber-900/40 rounded-2xl p-4 text-xs text-amber-200/90 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-400 font-semibold block mb-0.5">Sensei's Japanese Rhythmic Mnemonic:</strong>
            {currentChapter.senseiChant}
          </div>
        </div>
      </div>

      {/* --- STAGE 1: SENSEI'S CLASSROOM LECTURE --- */}
      {activeTab === 'lecture' && (
        <div className="flex flex-col gap-6">
          {/* Chapter Overview Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-4">
            <h4 className="text-sm uppercase tracking-widest font-black text-orange-400">
              Chapter Overview & Philosophy
            </h4>
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">
              {currentChapter.overview}
            </p>
          </div>

          {/* Lecture Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentChapter.lectureSections.map((sec, i) => (
              <div
                key={i}
                className="bg-stone-900/70 border border-stone-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between gap-4"
              >
                <div>
                  <h5 className="text-base font-bold text-stone-100 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    {sec.title}
                  </h5>
                  <p className="text-stone-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>

                {/* Formula Highlight if present */}
                {sec.formulaHighlight && (
                  <div className="bg-stone-950 border border-orange-900/40 rounded-xl p-3 text-xs font-mono font-bold text-orange-400 text-center tracking-wide">
                    {sec.formulaHighlight}
                  </div>
                )}

                {/* Finger Rule if present */}
                {sec.fingerRule && (
                  <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-200/90 font-medium">
                    {sec.fingerRule}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Anatomy Diagram (specifically for Chapter 1: Anatomy & Discipline) */}
          {currentChapter.number === 1 && (
            <div className="mt-2">
              <AnatomyDiagram />
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setActiveTab('guided');
                setGuidedIdx(0);
                sound.playResetSweep();
              }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 transition-all transform hover:scale-[1.02]"
            >
              Start Guided Practice with Sensei <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- STAGE 2: GUIDED INTERACTIVE EXERCISES --- */}
      {activeTab === 'guided' && currentGuided && (
        <div className="flex flex-col gap-6">
          {/* Guided Step Instruction Box */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-orange-400 bg-orange-950/60 border border-orange-800/40 px-3 py-1 rounded-full">
                Guided Exercise {guidedIdx + 1} of {currentChapter.guidedExercises.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFingerGuide(!showFingerGuide)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                    showFingerGuide
                      ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  Finger Guide: {showFingerGuide ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setLandscapeMode(!landscapeMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                    landscapeMode
                      ? 'bg-orange-600 text-white border-orange-500'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  {landscapeMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{landscapeMode ? 'Standard' : 'Landscape'}</span>
                </button>
              </div>
            </div>

            <h4 className="text-lg font-bold text-stone-100 mt-1">
              {currentGuided.title}
            </h4>

            <p className="text-stone-300 text-sm leading-relaxed">
              {currentGuided.instruction}
            </p>

            {currentGuided.senseiAdvice && (
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 text-xs text-amber-300/90 flex items-start gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Sensei's Advice: {currentGuided.senseiAdvice}</span>
              </div>
            )}
          </div>

          {/* THE SOROBAN BOARD FOR GUIDED PRACTICE */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            {/* Value Tracker */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-wider text-stone-500 font-bold">Current:</span>
                <span className="text-2xl font-bold font-mono text-stone-100">
                  {formatWithCommas(currentAbacusValue)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-stone-500 font-bold">Target:</span>
                <span
                  className={`text-2xl font-bold font-mono px-3 py-0.5 rounded-xl border transition-all ${
                    guidedSuccess
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-stone-800/60 border-stone-700/60 text-orange-400'
                  }`}
                >
                  {formatWithCommas(currentGuided.targetValue)}
                </span>
              </div>
            </div>

            <Soroban
              state={abacusState}
              onChange={setAbacusState}
              colorGrouping={colorGrouping}
              landscapeMode={landscapeMode}
              showFingerGuide={showFingerGuide}
              showPlaceLabels={true}
              showRodValues={true}
              highlightRodIndex={currentGuided.highlightRod}
            />

            {/* Actions */}
            <div className="w-full flex items-center justify-between mt-6 px-2">
              <button
                onClick={() => {
                  setAbacusState(numberToAbacus(currentGuided.initialValue, 13));
                  setGuidedSuccess(false);
                  sound.playResetSweep();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset Exercise
              </button>

              {guidedSuccess ? (
                <button
                  onClick={handleNextGuided}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/30 transition-all transform hover:scale-[1.02]"
                >
                  {guidedIdx < currentChapter.guidedExercises.length - 1 ? (
                    <>
                      Next Exercise <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Proceed to Chapter Checkpoint <Award className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <div className="text-xs text-stone-500 italic">
                  Move beads to match the target of {currentGuided.targetValue}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- STAGE 3: CHAPTER CHECKPOINT (VERIFICATION) --- */}
      {activeTab === 'checkpoint' && currentCheckpoint && (
        <div className="flex flex-col gap-6">
          {/* Checkpoint Question Box */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-orange-400 bg-orange-950/60 border border-orange-800/40 px-3 py-1 rounded-full">
                Checkpoint {checkpointIdx + 1} of {currentChapter.checkpointQuestions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFingerGuide(!showFingerGuide)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                    showFingerGuide
                      ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  Finger Guide: {showFingerGuide ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setLandscapeMode(!landscapeMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                    landscapeMode
                      ? 'bg-orange-600 text-white border-orange-500'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  {landscapeMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{landscapeMode ? 'Standard' : 'Landscape'}</span>
                </button>
              </div>
            </div>

            <h4 className="text-xl sm:text-2xl font-bold text-stone-100 mt-2">
              {currentCheckpoint.questionText}
            </h4>

            <div className="text-4xl sm:text-5xl font-black font-mono text-orange-400 tracking-wider my-2">
              {currentCheckpoint.operationText}
            </div>

            {/* Hint toggle */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setShowCheckpointHint(!showCheckpointHint)}
                className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 font-medium transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showCheckpointHint ? 'Hide Sensei Hint' : 'Need a Sensei Hint?'}
              </button>
              {showCheckpointHint && (
                <div className="bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs px-4 py-2 rounded-xl max-w-lg leading-relaxed animate-fadeIn">
                  {currentCheckpoint.hint}
                </div>
              )}
            </div>
          </div>

          {/* THE SOROBAN BOARD FOR CHECKPOINT */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <div className="text-xs text-stone-400 font-semibold">
                Your Answer on Abacus:{' '}
                <span className="text-stone-100 font-mono font-bold text-lg">
                  {formatWithCommas(currentAbacusValue)}
                </span>
              </div>

              {checkpointCorrect && (
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" /> Correct Understanding!
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

            {/* Verification Button */}
            <div className="w-full flex items-center justify-between mt-6 px-2">
              <button
                onClick={() => {
                  setAbacusState(numberToAbacus(currentCheckpoint.initialValue, 13));
                  setCheckpointCorrect(false);
                  sound.playResetSweep();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>

              {checkpointCorrect ? (
                checkpointIdx < currentChapter.checkpointQuestions.length - 1 ? (
                  <button
                    onClick={handleNextCheckpoint}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    Next Checkpoint Problem →
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-400">
                      ✓ Chapter {currentChapter.number} Mastered!
                    </span>
                    {selectedChapterIdx < SENSEI_CURRICULUM.length - 1 && (
                      <button
                        onClick={() => {
                          setSelectedChapterIdx((prev) => prev + 1);
                          setActiveTab('lecture');
                          sound.playSuccessChime();
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 transition-all"
                      >
                        Advance to Chapter {selectedChapterIdx + 2} →
                      </button>
                    )}
                  </div>
                )
              ) : (
                <button
                  onClick={handleVerifyCheckpoint}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 transition-all transform hover:scale-[1.02]"
                >
                  Verify Understanding
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
