import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ColorGroupingMode, AbacusState } from '../types';
import { Soroban } from './Soroban';
import {
  abacusToNumber,
  createEmptyAbacus,
  formatWithCommas,
} from '../utils/sorobanUtils';
import { sound } from '../audio/soundEffects';
import {
  Minus,
  X as TimesIcon,
  Plus,
  Divide,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Flame,
} from 'lucide-react';

interface PracticeGymProps {
  colorGrouping: ColorGroupingMode;
  onProblemSolved: (points: number) => void;
}

type OperationType = '-' | '×' | '÷' | '+';
type SubtractionDifficulty = 'direct' | 'friends5' | 'friends10' | 'mixed';
type MultiplicationDifficulty = 'single' | 'twoByOne';
type DivisionDifficulty = 'singleDivisor' | 'twoDigitDivisor' | 'multiDigit';

export const PracticeGym: React.FC<PracticeGymProps> = ({
  colorGrouping,
  onProblemSolved,
}) => {
  const [operation, setOperation] = useState<OperationType>('-');
  const [subDiff, setSubDiff] = useState<SubtractionDifficulty>('mixed');
  const [multDiff, setMultDiff] = useState<MultiplicationDifficulty>('single');
  const [divDiff, setDivDiff] = useState<DivisionDifficulty>('singleDivisor');
  
  const [num1, setNum1] = useState(14);
  const [num2, setNum2] = useState(7);
  const [expected, setExpected] = useState(7);
  const [hintText, setHintText] = useState('');
  const [showHint, setShowHint] = useState(false);

  const [abacusState, setAbacusState] = useState<AbacusState>(() => createEmptyAbacus(13));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [streak, setStreak] = useState(0);

  // Generate a tailored problem based on selected category & difficulty
  const generateProblem = () => {
    setFeedback('idle');
    setShowHint(false);
    setAbacusState(createEmptyAbacus(13));

    if (operation === '-') {
      // SUBTRACTION (User's primary growth area)
      if (subDiff === 'direct') {
        const n2 = Math.floor(Math.random() * 4) + 1;
        const n1 = n2 + Math.floor(Math.random() * 4) + 1;
        setNum1(n1);
        setNum2(n2);
        setExpected(n1 - n2);
        setHintText(`Direct earth subtraction: Simply flick ${n2} lower beads DOWN away from the beam.`);
      } else if (subDiff === 'friends5') {
        const pairs = [
          { n1: 5, n2: 1, formula: '-1 = -5 + 4 (Upper bead UP, 4 lower beads UP)' },
          { n1: 5, n2: 2, formula: '-2 = -5 + 3 (Upper bead UP, 3 lower beads UP)' },
          { n1: 6, n2: 3, formula: '-3 = -5 + 2 (Upper bead UP, 2 lower beads UP)' },
          { n1: 7, n2: 4, formula: '-4 = -5 + 1 (Upper bead UP, 1 lower bead UP)' },
          { n1: 6, n2: 2, formula: '-2 = -5 + 3' },
          { n1: 5, n2: 4, formula: '-4 = -5 + 1' },
        ];
        const pick = pairs[Math.floor(Math.random() * pairs.length)];
        setNum1(pick.n1);
        setNum2(pick.n2);
        setExpected(pick.n1 - pick.n2);
        setHintText(`Friend of 5 rule: ${pick.formula}`);
      } else if (subDiff === 'friends10') {
        const pairs = [
          { n1: 10, n2: 9, formula: '-9 = -10 + 1 (Remove 1 on tens rod, add 1 on ones rod)' },
          { n1: 13, n2: 8, formula: '-8 = -10 + 2 (Remove 1 on tens rod, add 2 on ones rod)' },
          { n1: 11, n2: 7, formula: '-7 = -10 + 3 (Remove 1 on tens rod, add 3 on ones rod)' },
          { n1: 12, n2: 9, formula: '-9 = -10 + 1' },
          { n1: 15, n2: 7, formula: '-7 = -10 + 3' },
          { n1: 16, n2: 8, formula: '-8 = -10 + 2' },
        ];
        const pick = pairs[Math.floor(Math.random() * pairs.length)];
        setNum1(pick.n1);
        setNum2(pick.n2);
        setExpected(pick.n1 - pick.n2);
        setHintText(`Friend of 10 rule: ${pick.formula}`);
      } else {
        const pairs = [
          { n1: 13, n2: 6, formula: '-6 = -10 + 5 - 1 (Tens rod -1, Ones rod +5, Ones lower -1)' },
          { n1: 14, n2: 7, formula: '-7 = -10 + 5 - 2 (Tens rod -1, Ones rod +5, Ones lower -2)' },
          { n1: 14, n2: 8, formula: '-8 = -10 + 5 - 3 (Tens rod -1, Ones rod +5, Ones lower -3)' },
          { n1: 13, n2: 7, formula: '-7 = -10 + 5 - 2' },
          { n1: 12, n2: 7, formula: '-7 = -10 + 5 - 2' },
          { n1: 13, n2: 8, formula: '-8 = -10 + 5 - 3' },
        ];
        const pick = pairs[Math.floor(Math.random() * pairs.length)];
        setNum1(pick.n1);
        setNum2(pick.n2);
        setExpected(pick.n1 - pick.n2);
        setHintText(`Mixed Combination rule: ${pick.formula}`);
      }
    } else if (operation === '×') {
      // MULTIPLICATION
      if (multDiff === 'single') {
        const n1 = Math.floor(Math.random() * 6) + 3;
        const n2 = Math.floor(Math.random() * 7) + 2;
        setNum1(n1);
        setNum2(n2);
        const prod = n1 * n2;
        setExpected(prod);
        const tensDigit = Math.floor(prod / 10);
        const onesDigit = prod % 10;
        setHintText(`${n1} × ${n2} = ${prod}. Set ${tensDigit} on tens column and ${onesDigit} on ones column.`);
      } else {
        const n1 = [12, 14, 23, 24, 32, 15, 21][Math.floor(Math.random() * 7)];
        const n2 = Math.floor(Math.random() * 4) + 2;
        setNum1(n1);
        setNum2(n2);
        const prod = n1 * n2;
        setExpected(prod);
        const tensPart = Math.floor(n1 / 10) * n2 * 10;
        const onesPart = (n1 % 10) * n2;
        setHintText(`Step 1: (${Math.floor(n1 / 10) * 10} × ${n2} = ${tensPart}) on hundreds/tens rods. Step 2: add (${n1 % 10} × ${n2} = ${onesPart}) = Total ${prod}.`);
      }
    } else if (operation === '÷') {
      // DIVISION (Wari-zan)
      if (divDiff === 'singleDivisor') {
        const divisor = Math.floor(Math.random() * 6) + 3; // 3 to 8
        const quotient = Math.floor(Math.random() * 30) + 12; // 12 to 41
        const dividend = divisor * quotient;
        setNum1(dividend);
        setNum2(divisor);
        setExpected(quotient);
        setHintText(`Wari-zan: Start left-to-right. Estimate quotient, multiply by ${divisor}, and subtract from dividend beads.`);
      } else if (divDiff === 'twoDigitDivisor') {
        const divisor = Math.floor(Math.random() * 20) + 12; // 12 to 31
        const quotient = Math.floor(Math.random() * 25) + 12; // 12 to 36
        const dividend = divisor * quotient;
        setNum1(dividend);
        setNum2(divisor);
        setExpected(quotient);
        setHintText(`Two-digit divisor: Estimate first quotient digit, subtract (${divisor} × digit), then continue with remaining beads.`);
      } else {
        // Multi-digit division
        const divisor = Math.floor(Math.random() * 40) + 20;
        const quotient = Math.floor(Math.random() * 60) + 20;
        const dividend = divisor * quotient;
        setNum1(dividend);
        setNum2(divisor);
        setExpected(quotient);
        setHintText(`Advanced Wari-zan: Subtract products systematically from left to right.`);
      }
    } else {
      // ADDITION
      const n1 = Math.floor(Math.random() * 30) + 10;
      const n2 = Math.floor(Math.random() * 40) + 10;
      setNum1(n1);
      setNum2(n2);
      setExpected(n1 + n2);
      setHintText(`${n1} + ${n2} = ${n1 + n2}. Add left-to-right: add tens, then add ones.`);
    }
  };

  useEffect(() => {
    generateProblem();
  }, [operation, subDiff, multDiff, divDiff]);

  const currentAbacusValue = abacusToNumber(abacusState);

  const handleVerify = () => {
    if (currentAbacusValue === expected) {
      setFeedback('correct');
      setStreak((prev) => prev + 1);
      sound.playSuccessChime();
      onProblemSolved(25);
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

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Category & Operation Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 p-4 rounded-2xl shadow-xl">
        {/* Operation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOperation('-')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              operation === '-'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Minus className="w-4 h-4" /> Subtraction Mastery
          </button>

          <button
            onClick={() => setOperation('×')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              operation === '×'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <TimesIcon className="w-4 h-4" /> Multiplication Dojo
          </button>

          <button
            onClick={() => setOperation('÷')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              operation === '÷'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Divide className="w-4 h-4" /> Division (Wari-zan)
          </button>

          <button
            onClick={() => setOperation('+')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              operation === '+'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Plus className="w-4 h-4" /> Addition Drills
          </button>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-950/60 border border-orange-800/40 text-orange-400 font-bold text-sm">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span>{streak} Streak</span>
        </div>
      </div>

      {/* Sub-Difficulty Filters */}
      {operation === '-' && (
        <div className="flex flex-wrap items-center gap-2 px-2 text-xs">
          <span className="text-stone-400 font-semibold uppercase tracking-wider">Level:</span>
          {[
            { id: 'direct', label: '1. Direct Moves' },
            { id: 'friends5', label: '2. Friends of 5 (-1 to -4)' },
            { id: 'friends10', label: '3. Friends of 10 (Borrow 10)' },
            { id: 'mixed', label: '4. Mixed Subtraction (Mastery)' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setSubDiff(d.id as SubtractionDifficulty)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                subDiff === d.id
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                  : 'bg-stone-800/50 text-stone-400 border-stone-700/40 hover:text-stone-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {operation === '×' && (
        <div className="flex flex-wrap items-center gap-2 px-2 text-xs">
          <span className="text-stone-400 font-semibold uppercase tracking-wider">Level:</span>
          {[
            { id: 'single', label: 'Single Digits (e.g. 7 × 8)' },
            { id: 'twoByOne', label: 'Two Digits × One (e.g. 23 × 4)' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setMultDiff(d.id as MultiplicationDifficulty)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                multDiff === d.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-stone-800/50 text-stone-400 border-stone-700/40 hover:text-stone-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {operation === '÷' && (
        <div className="flex flex-wrap items-center gap-2 px-2 text-xs">
          <span className="text-stone-400 font-semibold uppercase tracking-wider">Division Level:</span>
          {[
            { id: 'singleDivisor', label: '1. Single-Digit Divisor (e.g. 84 ÷ 4)' },
            { id: 'twoDigitDivisor', label: '2. Two-Digit Divisor (e.g. 468 ÷ 12)' },
            { id: 'multiDigit', label: '3. Multi-Digit Wari-zan (e.g. 1,404 ÷ 27)' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDivDiff(d.id as DivisionDifficulty)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                divDiff === d.id
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                  : 'bg-stone-800/50 text-stone-400 border-stone-700/40 hover:text-stone-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* The Problem Presentation Card */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 text-center shadow-xl flex flex-col items-center gap-4">
        <div className="text-xs uppercase tracking-widest text-stone-400 font-bold">
          Solve on the Abacus
        </div>

        {/* Big Math Expression */}
        <div className="flex items-center justify-center gap-4 text-4xl sm:text-5xl font-extrabold text-stone-100 font-mono tracking-wider">
          <span>{formatWithCommas(num1)}</span>
          <span className="text-orange-500">{operation}</span>
          <span>{formatWithCommas(num2)}</span>
          <span className="text-stone-600">=</span>
          <span className="text-orange-400">?</span>
        </div>

        {/* Hint toggle */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHint ? 'Hide Strategy Hint' : 'Show Soroban Technique Hint'}
          </button>
          {showHint && (
            <div className="bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs px-4 py-2 rounded-xl max-w-lg leading-relaxed animate-fadeIn">
              {hintText}
            </div>
          )}
        </div>
      </div>

      {/* The Abacus Board */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
        {/* Value Readout */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="text-xs text-stone-400 font-medium">
            Your Abacus Answer: <span className="text-stone-100 font-mono font-bold text-lg">{formatWithCommas(currentAbacusValue)}</span>
          </div>

          {feedback === 'correct' && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-xl">
              <CheckCircle2 className="w-4 h-4" /> Correct! +25 XP
            </div>
          )}

          {feedback === 'incorrect' && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-rose-400 bg-rose-950/60 border border-rose-800/50 px-3 py-1 rounded-xl">
              <AlertCircle className="w-4 h-4" /> Try again (or check hint)
            </div>
          )}
        </div>

        <Soroban
          state={abacusState}
          onChange={setAbacusState}
          colorGrouping={colorGrouping}
          showPlaceLabels={true}
          showRodValues={true}
        />

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-between mt-6 px-2">
          <button
            onClick={() => {
              setAbacusState(createEmptyAbacus(13));
              sound.playResetSweep();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 transition-all"
          >
            Clear Board
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={generateProblem}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Skip / New
            </button>

            {feedback === 'correct' ? (
              <button
                onClick={generateProblem}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all"
              >
                Next Problem →
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
