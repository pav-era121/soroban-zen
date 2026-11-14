import { useState, useEffect } from 'react';
import type { GameMode, ColorGroupingMode, UserStats, ExamKyuLevel } from './types';
import { Header } from './components/Header';
import { AcademyLesson } from './components/AcademyLesson';
import { PracticeGym } from './components/PracticeGym';
import { ExamDojo } from './components/ExamDojo';
import { FlashAnzan } from './components/FlashAnzan';
import { ZenSandbox } from './components/ZenSandbox';
import {
  X,
  Sparkles,
  BookMarked,
} from 'lucide-react';

const STORAGE_KEY = 'soroban_zen_stats_v2';

// Calculate Kyu/Dan ranking based on total XP and passed exams
function calculateRank(xp: number, passedExams: ExamKyuLevel[]): string {
  if (passedExams.includes('dan_master')) return '1st Dan (Master)';
  if (passedExams.includes('1st_kyu')) return '1st Kyu';
  if (passedExams.includes('2nd_kyu')) return '2nd Kyu';
  if (passedExams.includes('3rd_kyu')) return '3rd Kyu';
  if (passedExams.includes('4th_kyu')) return '4th Kyu';
  if (passedExams.includes('5th_kyu')) return '5th Kyu';
  if (passedExams.includes('6th_kyu')) return '6th Kyu';
  if (passedExams.includes('7th_kyu')) return '7th Kyu';
  if (passedExams.includes('8th_kyu')) return '8th Kyu';
  if (passedExams.includes('9th_kyu')) return '9th Kyu';

  // Fallback to XP calculation if no exams passed yet
  if (xp >= 1500) return '1st Dan (Master)';
  if (xp >= 1000) return '1st Kyu';
  if (xp >= 750) return '2nd Kyu';
  if (xp >= 550) return '3rd Kyu';
  if (xp >= 400) return '4th Kyu';
  if (xp >= 280) return '5th Kyu';
  if (xp >= 180) return '6th Kyu';
  if (xp >= 100) return '7th Kyu';
  if (xp >= 50) return '8th Kyu';
  if (xp >= 20) return '9th Kyu';
  return '10th Kyu';
}

export function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('academy');
  const [colorGrouping, setColorGrouping] = useState<ColorGroupingMode>('alternating3');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      rank: '10th Kyu',
      xp: 0,
      problemsSolved: 0,
      streakDays: 1,
      lessonsCompleted: [],
      passedExams: [],
    };
  });

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  const addXp = (amount: number) => {
    setStats((prev) => {
      const newXp = prev.xp + amount;
      const newRank = calculateRank(newXp, prev.passedExams);
      return {
        ...prev,
        xp: newXp,
        rank: newRank,
        problemsSolved: prev.problemsSolved + 1,
      };
    });
  };

  const handleLessonComplete = (lessonId: string) => {
    setStats((prev) => {
      if (prev.lessonsCompleted.includes(lessonId)) return prev;
      const updatedLessons = [...prev.lessonsCompleted, lessonId];
      const newXp = prev.xp + 100;
      const newRank = calculateRank(newXp, prev.passedExams);
      return {
        ...prev,
        xp: newXp,
        rank: newRank,
        lessonsCompleted: updatedLessons,
      };
    });
  };

  const handlePassExam = (kyu: ExamKyuLevel, points: number) => {
    setStats((prev) => {
      const updatedExams = prev.passedExams.includes(kyu)
        ? prev.passedExams
        : [...prev.passedExams, kyu];
      const newXp = prev.xp + points;
      const newRank = calculateRank(newXp, updatedExams);
      return {
        ...prev,
        xp: newXp,
        rank: newRank,
        passedExams: updatedExams,
        problemsSolved: prev.problemsSolved + 5,
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#161413] text-stone-200 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col">
        {currentMode === 'academy' && (
          <AcademyLesson
            colorGrouping={colorGrouping}
            onLessonComplete={handleLessonComplete}
            completedLessons={stats.lessonsCompleted}
          />
        )}

        {currentMode === 'practice' && (
          <PracticeGym
            colorGrouping={colorGrouping}
            onProblemSolved={addXp}
          />
        )}

        {currentMode === 'exam' && (
          <ExamDojo
            colorGrouping={colorGrouping}
            passedExams={stats.passedExams}
            onPassExam={handlePassExam}
          />
        )}

        {currentMode === 'anzan' && (
          <FlashAnzan
            colorGrouping={colorGrouping}
            onSuccess={addXp}
          />
        )}

        {currentMode === 'sandbox' && (
          <ZenSandbox
            colorGrouping={colorGrouping}
            setColorGrouping={setColorGrouping}
          />
        )}
      </main>

      {/* Floating Formula & Rules Cheat Sheet Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setShowFormulaModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-orange-400 hover:text-orange-300 shadow-xl backdrop-blur-md transition-all transform hover:scale-105"
        >
          <BookMarked className="w-4 h-4" />
          <span className="text-xs font-bold">Soroban Formulas</span>
        </button>
      </div>

      {/* Formula Cheat Sheet Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFormulaModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-xl bg-stone-800/60 hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-100">
                  Japanese Shuzan Formulas & Operations
                </h3>
                <p className="text-xs text-stone-400">
                  Reference rules for Addition, Subtraction, Multiplication & Division (Wari-zan).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-4">
              {/* Friends of 5 */}
              <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4">
                <h4 className="font-bold text-orange-400 uppercase tracking-wider mb-2">
                  Friends of 5 (五の補数)
                </h4>
                <div className="space-y-1.5 text-stone-300 font-mono">
                  <div>+1 = +5 - 4</div>
                  <div>+2 = +5 - 3</div>
                  <div>+3 = +5 - 2</div>
                  <div>+4 = +5 - 1</div>
                  <div className="pt-2 border-t border-stone-800 text-amber-300 font-semibold">
                    Subtraction:
                  </div>
                  <div>-1 = -5 + 4</div>
                  <div>-2 = -5 + 3</div>
                  <div>-3 = -5 + 2</div>
                  <div>-4 = -5 + 1</div>
                </div>
              </div>

              {/* Friends of 10 */}
              <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Friends of 10 (十の補数)
                </h4>
                <div className="space-y-1.5 text-stone-300 font-mono">
                  <div>+9 = +10 - 1</div>
                  <div>+8 = +10 - 2</div>
                  <div>+7 = +10 - 3</div>
                  <div>+6 = +10 - 4</div>
                  <div className="pt-2 border-t border-stone-800 text-rose-300 font-semibold">
                    Subtraction:
                  </div>
                  <div>-9 = -10 + 1</div>
                  <div>-8 = -10 + 2</div>
                  <div>-7 = -10 + 3</div>
                  <div>-6 = -10 + 4</div>
                </div>
              </div>

              {/* Mixed Subtraction */}
              <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4">
                <h4 className="font-bold text-rose-400 uppercase tracking-wider mb-2">
                  Mixed Subtraction (破五減算)
                </h4>
                <div className="space-y-1.5 text-stone-300 font-mono">
                  <div>-6 = -10 + 5 - 1</div>
                  <div>-7 = -10 + 5 - 2</div>
                  <div>-8 = -10 + 5 - 3</div>
                  <div>-9 = -10 + 5 - 4</div>
                </div>
              </div>

              {/* Division (Wari-zan) */}
              <div className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4">
                <h4 className="font-bold text-purple-400 uppercase tracking-wider mb-2">
                  Division (除算 Wari-zan)
                </h4>
                <div className="space-y-1.5 text-stone-300 text-[11px] leading-relaxed">
                  <div>1. Look at leftmost digits of dividend.</div>
                  <div>2. Estimate trial quotient digit.</div>
                  <div>3. Multiply (divisor × quotient) and subtract directly from the dividend beads.</div>
                  <div>4. Repeat left-to-right until zero remainder!</div>
                </div>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zen Footer */}
      <footer className="w-full border-t border-stone-800/60 py-4 px-4 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>日本珠算連盟基準準拠 • Zen Soroban Academy</span>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Rods: 1:4 Standard (Modern Soroban)</span>
            <span>•</span>
            <span>3-Rod Place Value Coloring: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
