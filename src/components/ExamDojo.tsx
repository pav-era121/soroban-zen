import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type {
  ColorGroupingMode,
  ExamKyuLevel,
  ExamQuestion,
  QuizSubject,
  AbacusState,
  ExamRecords,
  KyuExamRecord,
} from '../types';
import { KYU_CONFIGS, generateExamSet } from '../utils/quizGenerator';
import { Soroban } from './Soroban';
import {
  createEmptyAbacus,
  abacusToNumber,
  formatWithCommas,
} from '../utils/sorobanUtils';
import { sound } from '../audio/soundEffects';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

const EXAM_RECORDS_KEY = 'soroban_kyu_exam_records_v3';

// Default seeded completion records for 10th Kyu through 7th Kyu as requested
const DEFAULT_RECORDS: ExamRecords = {
  '10th_kyu': { bestScorePct: 100, lastScorePct: 100, correctCount: 5, totalCount: 5, passed: true, attempts: 1 },
  '9th_kyu': { bestScorePct: 100, lastScorePct: 100, correctCount: 5, totalCount: 5, passed: true, attempts: 1 },
  '8th_kyu': { bestScorePct: 90, lastScorePct: 90, correctCount: 4, totalCount: 5, passed: true, attempts: 1 },
  '7th_kyu': { bestScorePct: 85, lastScorePct: 85, correctCount: 5, totalCount: 6, passed: true, attempts: 1 },
};

interface ExamDojoProps {
  colorGrouping: ColorGroupingMode;
  passedExams: ExamKyuLevel[];
  onPassExam: (kyu: ExamKyuLevel, points: number) => void;
}

type ExamState = 'select' | 'in_progress' | 'completed';

export const ExamDojo: React.FC<ExamDojoProps> = ({
  colorGrouping,
  passedExams,
  onPassExam,
}) => {
  const [selectedKyu, setSelectedKyu] = useState<ExamKyuLevel>('10th_kyu');
  const [selectedSubject, setSelectedSubject] = useState<QuizSubject>('comprehensive');
  const [examState, setExamState] = useState<ExamState>('select');

  // Exam Score Records per Kyu level
  const [examRecords, setExamRecords] = useState<ExamRecords>(() => {
    try {
      const saved = localStorage.getItem(EXAM_RECORDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_RECORDS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(EXAM_RECORDS_KEY, JSON.stringify(examRecords));
    } catch {
      // ignore
    }
  }, [examRecords]);

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [abacusState, setAbacusState] = useState<AbacusState>(() => createEmptyAbacus(13));
  const [useVirtualAbacus, setUseVirtualAbacus] = useState(true);

  const [timeLeftSec, setTimeLeftSec] = useState(180);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeKyuConfig = KYU_CONFIGS.find((c) => c.id === selectedKyu) || KYU_CONFIGS[0];
  const activeRecord = examRecords[selectedKyu];

  // Start exam
  const startExam = () => {
    const examQuestions = generateExamSet(selectedKyu, selectedSubject);
    setQuestions(examQuestions);
    setCurrentQIndex(0);
    setUserAnswers([]);
    setCurrentInput('');
    setAbacusState(createEmptyAbacus(13));
    setTimeLeftSec(activeKyuConfig.timeLimitSec);
    setExamState('in_progress');
    sound.playResetSweep();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamState('completed');
  };

  // Submit current answer and move to next question
  const handleSubmitAnswer = () => {
    const answer = useVirtualAbacus
      ? abacusToNumber(abacusState)
      : parseInt(currentInput.replace(/,/g, ''), 10);

    const updated = [...userAnswers, isNaN(answer) ? 0 : answer];
    setUserAnswers(updated);
    setCurrentInput('');
    setAbacusState(createEmptyAbacus(13));
    sound.playClack(false, 1.1);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Completed all questions!
      if (timerRef.current) clearInterval(timerRef.current);
      setExamState('completed');

      // Calculate score
      let correct = 0;
      for (let i = 0; i < questions.length; i++) {
        if (updated[i] === questions[i].expectedResult) {
          correct++;
        }
      }
      const scorePct = Math.round((correct / questions.length) * 100);
      const isPass = scorePct >= activeKyuConfig.passPercentage;

      // Update record for this Kyu
      const prevRec = examRecords[selectedKyu];
      const newRecord: KyuExamRecord = {
        bestScorePct: Math.max(scorePct, prevRec?.bestScorePct ?? 0),
        lastScorePct: scorePct,
        correctCount: Math.max(correct, prevRec?.correctCount ?? 0),
        totalCount: questions.length,
        passed: isPass || Boolean(prevRec?.passed),
        attempts: (prevRec?.attempts ?? 0) + 1,
        lastDate: new Date().toLocaleDateString(),
      };

      setExamRecords((prev) => ({
        ...prev,
        [selectedKyu]: newRecord,
      }));

      if (isPass) {
        sound.playSuccessChime();
        onPassExam(selectedKyu, 150);
        try {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#e05638', '#d97736', '#f59e42', '#34d399', '#ffffff'],
          });
        } catch {
          // ignore
        }
      } else {
        sound.playClack(true, 0.7);
      }
    }
  };

  // Calculations for final report
  let correctCount = 0;
  if (examState === 'completed') {
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === questions[i].expectedResult) {
        correctCount++;
      }
    }
  }
  const scorePct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const isPassed = scorePct >= activeKyuConfig.passPercentage;

  const currentQ = questions[currentQIndex];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Dojo Header */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-500/30 text-white font-serif font-black text-xl">
            検
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-100 uppercase tracking-wide">
                Japanese Shuzan Examination Room
              </h2>
              <span className="text-xs text-orange-400 font-mono">珠算検定試験</span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Official Japanese certification standards from 10th Kyu (十級) to Dan Grandmaster (段位).
            </p>
          </div>
        </div>

        {examState === 'in_progress' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-950/70 border border-orange-700/50 text-orange-300 font-mono font-bold text-base shadow-sm">
            <Clock className="w-4 h-4 animate-spin text-orange-400" />
            <span>
              {Math.floor(timeLeftSec / 60)}:
              {(timeLeftSec % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* --- STAGE 1: LEVEL & SUBJECT SELECTION --- */}
      {examState === 'select' && (
        <div className="flex flex-col gap-6">
          {/* Subject Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-stone-900/60 p-2 rounded-2xl border border-stone-800">
            {[
              { id: 'comprehensive', label: '総合試験 (Comprehensive Exam: All Sections)' },
              { id: 'mitorizan', label: '見取算 (Addition & Subtraction)' },
              { id: 'kakezan', label: '乗算 (Multiplication)' },
              { id: 'warizan', label: '除算 (Division - Wari-zan)' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id as QuizSubject)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSubject === sub.id
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-stone-800/60 text-stone-300 hover:bg-stone-800'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Kyu Levels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {KYU_CONFIGS.map((kyu) => {
              const isSelected = selectedKyu === kyu.id;
              const rec = examRecords[kyu.id];
              const hasPassed = rec?.passed || passedExams.includes(kyu.id);
              const isDan = kyu.id === 'dan_master';

              return (
                <div
                  key={kyu.id}
                  onClick={() => setSelectedKyu(kyu.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? isDan
                        ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-950/40'
                        : 'bg-orange-950/40 border-orange-500 shadow-xl shadow-orange-950/30'
                      : 'bg-stone-900/70 border-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  <div>
                    {/* Card Header with Visible Status & Score */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-black uppercase tracking-wider ${isDan ? 'text-red-400' : 'text-orange-400'}`}>
                        {kyu.name}
                      </span>
                      {hasPassed ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-full shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Passed • {rec?.bestScorePct ?? 100}%</span>
                        </span>
                      ) : rec ? (
                        <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-700/50 px-2 py-0.5 rounded-full">
                          Last: {rec.lastScorePct}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-medium px-1.5 py-0.5">
                          Target: {kyu.passPercentage}%
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-stone-100 flex items-center gap-1">
                      {kyu.japanese}
                    </div>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                      {kyu.description}
                    </p>
                  </div>

                  {/* Card Footer with Score & Practice Cue */}
                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>{kyu.questionCount} Questions</span>
                    {hasPassed ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        Best: <strong className="text-emerald-300">{rec?.bestScorePct ?? 100}%</strong>
                        <span className="text-stone-500 text-[10px]">(Practice ↺)</span>
                      </span>
                    ) : rec ? (
                      <span className="text-amber-400 font-semibold">
                        Best: {rec.bestScorePct}%
                      </span>
                    ) : (
                      <span className="text-stone-300 font-bold">{kyu.passPercentage}% to Pass</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Launch / Retake Exam Banner */}
          <div className="bg-stone-900/90 border border-stone-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">Selected Certification</span>
                {activeRecord?.passed && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Certified ✓ Best Score: {activeRecord.bestScorePct}%
                  </span>
                )}
              </div>
              <div className="text-xl font-black text-stone-100">
                {activeKyuConfig.name} - {activeKyuConfig.japanese}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                {activeRecord?.passed ? (
                  <span>
                    You already passed this tier with a score of <strong className="text-emerald-400">{activeRecord.bestScorePct}%</strong>. Practice again anytime to refine your speed and precision!
                  </span>
                ) : (
                  <span>
                    Passing requirement: {activeKyuConfig.passPercentage}% accuracy within {activeKyuConfig.timeLimitSec / 60} minutes.
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={startExam}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-base font-bold text-white shadow-xl transition-all transform hover:scale-[1.03] ${
                activeRecord?.passed
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-600/30'
              }`}
            >
              {activeRecord?.passed ? (
                <>
                  <RotateCcw className="w-5 h-5 text-white" /> Practice Again (Retake Exam)
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" /> Begin Official Exam
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- STAGE 2: IN-PROGRESS EXAM --- */}
      {examState === 'in_progress' && currentQ && (
        <div className="flex flex-col gap-6">
          {/* Question Tracker & Category */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-orange-400 bg-orange-950/60 border border-orange-800/40 px-2.5 py-1 rounded-full">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-stone-300">
                {currentQ.subjectName}
              </span>
            </div>

            {/* Input mode toggle */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setUseVirtualAbacus(true)}
                className={`px-3 py-1 rounded-lg border ${
                  useVirtualAbacus
                    ? 'bg-orange-600 text-white border-orange-500 font-bold'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                Virtual Soroban
              </button>
              <button
                onClick={() => setUseVirtualAbacus(false)}
                className={`px-3 py-1 rounded-lg border ${
                  !useVirtualAbacus
                    ? 'bg-orange-600 text-white border-orange-500 font-bold'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                Keypad Input
              </button>
            </div>
          </div>

          {/* Question Presentation Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl flex flex-col items-center">
            {/* If Mitori-zan: traditional vertical columnar problem format */}
            {currentQ.subject === 'mitorizan' && currentQ.numbers ? (
              <div className="flex flex-col items-end gap-1 font-mono font-black text-3xl sm:text-4xl text-stone-100 tracking-wider bg-stone-950/80 px-8 py-5 rounded-2xl border border-stone-800">
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
              <div className="flex items-center justify-center gap-4 text-4xl sm:text-5xl font-black font-mono text-stone-100 tracking-wider my-2">
                <span>{formatWithCommas(currentQ.num1 ?? 0)}</span>
                <span className="text-orange-500">{currentQ.operation}</span>
                <span>{formatWithCommas(currentQ.num2 ?? 0)}</span>
                <span className="text-stone-600">=</span>
                <span className="text-orange-400">?</span>
              </div>
            )}
          </div>

          {/* Interactive Soroban Board or Keypad Input */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            {useVirtualAbacus ? (
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 px-2">
                  <div className="text-xs text-stone-400 font-semibold">
                    Current Bead Value:{' '}
                    <span className="text-stone-100 font-mono font-bold text-lg">
                      {formatWithCommas(abacusToNumber(abacusState))}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAbacusState(createEmptyAbacus(13));
                      sound.playResetSweep();
                    }}
                    className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear Board
                  </button>
                </div>

                <Soroban
                  state={abacusState}
                  onChange={setAbacusState}
                  colorGrouping={colorGrouping}
                  showPlaceLabels={true}
                  showRodValues={true}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                  Enter your calculation:
                </div>
                <input
                  type="number"
                  autoFocus
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitAnswer();
                  }}
                  placeholder="0"
                  className="w-56 text-3xl font-mono font-bold text-center bg-stone-950 border border-stone-700 rounded-2xl py-3 text-stone-100 outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* Submit Action */}
            <div className="w-full flex items-center justify-between mt-6 px-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to exit the exam?')) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setExamState('select');
                  }
                }}
                className="text-xs text-stone-500 hover:text-stone-400 underline"
              >
                Quit Exam
              </button>

              <button
                onClick={handleSubmitAnswer}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 transition-all transform hover:scale-[1.02]"
              >
                {currentQIndex < questions.length - 1 ? (
                  <>
                    Next Problem <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Finish & Grade Exam <FileCheck2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STAGE 3: EXAM RESULTS & CERTIFICATE --- */}
      {examState === 'completed' && (
        <div className="flex flex-col items-center gap-6">
          <div className="bg-stone-900/95 border border-stone-800 rounded-3xl p-6 sm:p-8 w-full shadow-2xl flex flex-col items-center text-center">
            {isPassed ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 mb-1 shadow-lg shadow-emerald-900/30">
                  <Award className="w-9 h-9" />
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
                  EXAMINATION PASSED • 合格
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-100">
                  Congratulations! You certified {activeKyuConfig.name}
                </h3>
                <p className="text-xs text-stone-300 max-w-md">
                  You satisfied the official passing criterion of {activeKyuConfig.passPercentage}% with an impressive score of {scorePct}%.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 mb-1">
                  <XCircle className="w-9 h-9" />
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-950/60 border border-rose-800/40 px-3 py-1 rounded-full">
                  NOT YET PASSED • 不合格
                </div>
                <h3 className="text-2xl font-bold text-stone-100">
                  Score: {scorePct}% (Passing: {activeKyuConfig.passPercentage}%)
                </h3>
                <p className="text-xs text-stone-400 max-w-md">
                  Keep refining your technique in the Academy and Practice Gym. True Shuzan mastery comes through focused repetition!
                </p>
              </div>
            )}

            {/* TRADITIONAL JAPANESE CERTIFICATE CARD (If Passed) */}
            {isPassed && (
              <div className="w-full max-w-lg mt-6 bg-[#fdfbf7] text-[#2c221e] border-4 border-[#3a2e2b] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden font-serif">
                <div className="absolute top-2 left-2 text-stone-400 text-xs">❖</div>
                <div className="absolute top-2 right-2 text-stone-400 text-xs">❖</div>
                <div className="absolute bottom-2 left-2 text-stone-400 text-xs">❖</div>
                <div className="absolute bottom-2 right-2 text-stone-400 text-xs">❖</div>

                <div className="text-center mb-4">
                  <div className="text-xs tracking-widest text-[#8a5d3b] uppercase font-sans font-bold">
                    Official Shuzan Certificate of Competency
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black tracking-widest mt-1 text-[#1a1412]">
                    珠算能力検定 合格証書
                  </h4>
                </div>

                <div className="my-4 text-center text-sm leading-relaxed text-[#3d322d]">
                  This certifies that the candidate has successfully demonstrated high precision and speed in Japanese abacus calculation, passing all official criteria for:
                </div>

                <div className="my-4 py-2 border-y-2 border-[#8a5d3b]/40 text-center">
                  <div className="text-xl sm:text-2xl font-black text-[#8a2411]">
                    {activeKyuConfig.name} ({activeKyuConfig.japanese})
                  </div>
                  <div className="text-xs font-sans text-stone-600 mt-1">
                    Score: {correctCount} / {questions.length} ({scorePct}%)
                  </div>
                </div>

                {/* Red Hanko / Japanese Seal */}
                <div className="flex items-center justify-between mt-6 text-xs text-stone-600 font-sans">
                  <div>
                    <div>Date: {new Date().toLocaleDateString()}</div>
                    <div>Zen Soroban Dojo</div>
                  </div>

                  <div className="w-14 h-14 border-2 border-red-700 text-red-700 flex flex-col items-center justify-center font-serif text-[10px] font-black rounded-sm transform rotate-[-3deg] shadow-sm">
                    <span>珠算</span>
                    <span>認定</span>
                  </div>
                </div>
              </div>
            )}

            {/* Questions Review Breakdown */}
            <div className="w-full mt-6 bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-left">
              <div className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-3">
                Question by Question Review
              </div>
              <div className="space-y-2">
                {questions.map((q, idx) => {
                  const isCorrect = userAnswers[idx] === q.expectedResult;
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="font-mono text-stone-300">
                          Q{idx + 1}: {q.problemText}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                          You: {formatWithCommas(userAnswers[idx] ?? 0)}
                        </span>
                        {!isCorrect && (
                          <span className="text-stone-400">
                            (Ans: {formatWithCommas(q.expectedResult)})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setExamState('select')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Back to Examination Room
              </button>

              <button
                onClick={startExam}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-600/30 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Practice Again / Retake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
