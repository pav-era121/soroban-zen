export type RodValue = {
  upper: boolean; // true if upper bead (5) is pushed down against the beam
  lower: number;  // 0 to 4 (number of lower beads pushed up against the beam)
};

export type AbacusState = RodValue[];

export type ColorGroupingMode = 'alternating3' | 'uniform' | 'highlightActive';

export type GameMode = 'academy' | 'practice' | 'exam' | 'anzan' | 'sandbox';

export type LessonCategory = 
  | 'basics'
  | 'direct'
  | 'friends_of_5'
  | 'friends_of_10'
  | 'mixed_subtraction'
  | 'multiplication'
  | 'division_basics'
  | 'division_advanced';

export interface LessonStep {
  id: string;
  title: string;
  instruction: string;
  explanation: string;
  targetNumber: number;
  initialNumber?: number;
  highlightRodIndex?: number;
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  category: LessonCategory;
  level: string; // e.g. "10th Kyu", "9th Kyu", ... "1st Dan"
  japaneseTitle?: string;
  description: string;
  steps: LessonStep[];
}

export type ExamKyuLevel = 
  | '10th_kyu'
  | '9th_kyu'
  | '8th_kyu'
  | '7th_kyu'
  | '6th_kyu'
  | '5th_kyu'
  | '4th_kyu'
  | '3rd_kyu'
  | '2nd_kyu'
  | '1st_kyu'
  | 'dan_master';

export type QuizSubject = 'mitorizan' | 'kakezan' | 'warizan' | 'comprehensive';

export interface ExamQuestion {
  id: string;
  subject: QuizSubject;
  subjectName: string; // "見取算 (Addition/Subtraction)", "乗算 (Multiplication)", "除算 (Division)"
  problemText: string;
  numbers?: number[]; // for column addition/subtraction
  num1?: number;
  operation?: string;
  num2?: number;
  expectedResult: number;
  hint?: string;
}

export interface ExamResult {
  kyuLevel: ExamKyuLevel;
  levelName: string;
  passed: boolean;
  score: number;
  totalQuestions: number;
  timeSpentSec: number;
  timestamp: string;
}

export interface UserStats {
  rank: string; // "10th Kyu", ... "1st Dan"
  xp: number;
  problemsSolved: number;
  streakDays: number;
  lessonsCompleted: string[];
  passedExams: ExamKyuLevel[];
}
