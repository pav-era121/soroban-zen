import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { AbacusState, ColorGroupingMode } from '../types';
import { LESSONS } from '../data/lessons';
import { Soroban } from './Soroban';
import {
  abacusToNumber,
  createEmptyAbacus,
  numberToAbacus,
  formatWithCommas,
} from '../utils/sorobanUtils';
import { sound } from '../audio/soundEffects';
import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface AcademyLessonProps {
  colorGrouping: ColorGroupingMode;
  onLessonComplete: (lessonId: string) => void;
  completedLessons: string[];
}

export const AcademyLesson: React.FC<AcademyLessonProps> = ({
  colorGrouping,
  onLessonComplete,
  completedLessons,
}) => {
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [abacusState, setAbacusState] = useState<AbacusState>(() => createEmptyAbacus(9));
  const [isStepSuccess, setIsStepSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentLesson = LESSONS[selectedLessonIndex];
  const currentStep = currentLesson.steps[currentStepIndex];
  const currentTotal = abacusToNumber(abacusState);

  // Initialize abacus state when step changes
  useEffect(() => {
    setIsStepSuccess(false);
    setShowHint(false);
    const initialNum = currentStep.initialNumber ?? 0;
    setAbacusState(numberToAbacus(initialNum, 9));
  }, [selectedLessonIndex, currentStepIndex]);

  // Check if current abacus matches target
  useEffect(() => {
    if (currentTotal === currentStep.targetNumber && !isStepSuccess) {
      setIsStepSuccess(true);
      sound.playSuccessChime();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#e05638', '#d97736', '#f3a152', '#ffffff'],
        });
      } catch {
        // ignore
      }
    }
  }, [currentTotal, currentStep.targetNumber, isStepSuccess]);

  const handleNextStep = () => {
    if (currentStepIndex < currentLesson.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Completed full lesson!
      onLessonComplete(currentLesson.id);
      sound.playSuccessChime();
      if (selectedLessonIndex < LESSONS.length - 1) {
        setSelectedLessonIndex((prev) => prev + 1);
        setCurrentStepIndex(0);
      }
    }
  };

  const handleResetStep = () => {
    const initialNum = currentStep.initialNumber ?? 0;
    setAbacusState(numberToAbacus(initialNum, 9));
    setIsStepSuccess(false);
    sound.playResetSweep();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Lesson Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-500 border border-orange-500/30 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-orange-400 bg-orange-950/60 border border-orange-800/40 px-2 py-0.5 rounded-full">
                {currentLesson.level}
              </span>
              <h2 className="text-lg font-bold text-stone-100">{currentLesson.title}</h2>
            </div>
            <p className="text-xs text-stone-400">{currentLesson.subtitle}</p>
          </div>
        </div>

        {/* Lesson Selector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLessonIndex}
            onChange={(e) => {
              setSelectedLessonIndex(Number(e.target.value));
              setCurrentStepIndex(0);
            }}
            className="bg-stone-800 text-stone-200 text-sm border border-stone-700 rounded-xl px-3 py-2 outline-none focus:border-orange-500 cursor-pointer"
          >
            {LESSONS.map((l, idx) => (
              <option key={l.id} value={idx}>
                {completedLessons.includes(l.id) ? '✓ ' : ''}
                {l.level} - {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step Instruction Card */}
      <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
        {/* Step Progress Pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {currentLesson.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-8 bg-orange-500'
                    : idx < currentStepIndex
                    ? 'w-3 bg-stone-600'
                    : 'w-3 bg-stone-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-stone-400">
            Step {currentStepIndex + 1} of {currentLesson.steps.length}
          </span>
        </div>

        {/* Task Title & Instruction */}
        <div className="mt-1">
          <h3 className="text-base font-semibold text-stone-100 flex items-center gap-2">
            <span>{currentStep.title}</span>
            {isStepSuccess && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved!
              </span>
            )}
          </h3>
          <p className="text-stone-300 text-sm mt-1 leading-relaxed">
            {currentStep.instruction}
          </p>
        </div>

        {/* Soroban Insight / Formula */}
        <div className="bg-stone-950/60 border border-stone-800/60 rounded-xl p-3 text-xs text-stone-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{currentStep.explanation}</p>
        </div>

        {/* Hint toggle */}
        {currentStep.hint && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {showHint ? 'Hide Hint' : 'Need a Hint?'}
            </button>
            {showHint && (
              <span className="text-xs text-amber-200/90 italic animate-fadeIn">
                Hint: {currentStep.hint}
              </span>
            )}
          </div>
        )}
      </div>

      {/* THE INTERACTIVE SOROBAN */}
      <div className="relative bg-gradient-to-b from-stone-900/60 to-stone-950/80 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
        {/* Target vs Current Tracker */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Current:</span>
            <span className="text-2xl font-bold font-mono text-stone-100">
              {formatWithCommas(currentTotal)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Goal:</span>
            <span
              className={`text-2xl font-bold font-mono px-3 py-0.5 rounded-xl border transition-all ${
                isStepSuccess
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-stone-800/60 border-stone-700/60 text-orange-400'
              }`}
            >
              {formatWithCommas(currentStep.targetNumber)}
            </span>
          </div>
        </div>

        <Soroban
          state={abacusState}
          onChange={setAbacusState}
          colorGrouping={colorGrouping}
          showPlaceLabels={true}
          showRodValues={true}
        />

        {/* Action Controls */}
        <div className="w-full flex items-center justify-between mt-6 px-2">
          <button
            onClick={handleResetStep}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset Step
          </button>

          {isStepSuccess ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/30 transition-all transform hover:scale-[1.02]"
            >
              {currentStepIndex < currentLesson.steps.length - 1 ? (
                <>
                  Next Step <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" /> Complete Lesson!
                </>
              )}
            </button>
          ) : (
            <div className="text-xs text-stone-500 italic">
              Move beads to reach the goal of {currentStep.targetNumber}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
