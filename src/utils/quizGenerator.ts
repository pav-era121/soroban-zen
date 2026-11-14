import type { ExamKyuLevel, ExamQuestion, QuizSubject } from '../types';

export interface KyuLevelConfig {
  id: ExamKyuLevel;
  name: string;
  japanese: string;
  description: string;
  passPercentage: number;
  timeLimitSec: number;
  questionCount: number;
  unlockedByDefault?: boolean;
}

export const KYU_CONFIGS: KyuLevelConfig[] = [
  {
    id: '10th_kyu',
    name: '10th Kyu (十級)',
    japanese: '入門初段 (Beginner)',
    description: '1-digit numbers, direct addition & subtraction, 3 numbers per problem.',
    passPercentage: 70,
    timeLimitSec: 180,
    questionCount: 5,
    unlockedByDefault: true,
  },
  {
    id: '9th_kyu',
    name: '9th Kyu (九級)',
    japanese: '五の補数 (Friends of 5)',
    description: '1-digit numbers with 5-complements and simple carries, 4 numbers.',
    passPercentage: 70,
    timeLimitSec: 180,
    questionCount: 5,
    unlockedByDefault: true,
  },
  {
    id: '8th_kyu',
    name: '8th Kyu (八級)',
    japanese: '十の補数 (Friends of 10)',
    description: '1 to 2-digit numbers with carries and borrows, 4 numbers.',
    passPercentage: 70,
    timeLimitSec: 180,
    questionCount: 5,
    unlockedByDefault: true,
  },
  {
    id: '7th_kyu',
    name: '7th Kyu (七級)',
    japanese: '見取算 & 乗算初歩',
    description: '2-digit Addition/Subtraction + Basic Multiplication (2 × 1 digit).',
    passPercentage: 75,
    timeLimitSec: 240,
    questionCount: 6,
  },
  {
    id: '6th_kyu',
    name: '6th Kyu (六級)',
    japanese: '除算入門 (Intro Division)',
    description: 'Multi-digit Mitori-zan + Multiplication (2×1, 3×1) + Division (3 ÷ 1 digit).',
    passPercentage: 75,
    timeLimitSec: 240,
    questionCount: 6,
  },
  {
    id: '5th_kyu',
    name: '5th Kyu (五級)',
    japanese: '珠算中級 (Intermediate)',
    description: '3-digit Mitori-zan + Multiplication (2 × 2) + Division (3 ÷ 1, 4 ÷ 1).',
    passPercentage: 75,
    timeLimitSec: 300,
    questionCount: 6,
  },
  {
    id: '4th_kyu',
    name: '4th Kyu (四級)',
    japanese: '二桁除算 (2-Digit Divisor)',
    description: '3-digit Mitori-zan + Multiplication (3 × 2) + Division (4 ÷ 2 digits).',
    passPercentage: 80,
    timeLimitSec: 300,
    questionCount: 6,
  },
  {
    id: '3rd_kyu',
    name: '3rd Kyu (三級)',
    japanese: '日本珠算連盟公認 (Official Gate)',
    description: 'Official Japanese Shuzan standard: 4-digit addition, 3×2 mult, 4÷2 div.',
    passPercentage: 80,
    timeLimitSec: 360,
    questionCount: 8,
  },
  {
    id: '2nd_kyu',
    name: '2nd Kyu (二級)',
    japanese: '上級珠算 (Advanced)',
    description: '4-5 digit Mitori-zan, 3×3 multiplication, 5÷2 division.',
    passPercentage: 80,
    timeLimitSec: 360,
    questionCount: 8,
  },
  {
    id: '1st_kyu',
    name: '1st Kyu (一級)',
    japanese: '最高級 (Senior Master)',
    description: '5-digit Mitori-zan, 4×3 multiplication, 5÷3 division.',
    passPercentage: 85,
    timeLimitSec: 420,
    questionCount: 10,
  },
  {
    id: 'dan_master',
    name: 'Dan Grade (段位 - HARDEST MODE)',
    japanese: '名人段位 (Competition Grandmaster)',
    description: 'True Japanese Championship grade: 5-6 digit marathons, high-speed multiplication & division!',
    passPercentage: 85,
    timeLimitSec: 480,
    questionCount: 10,
  },
];

let questionCounter = 0;

// Generate a random Mitori-zan (Columnar Addition & Subtraction)
export function generateMitorizan(kyu: ExamKyuLevel): ExamQuestion {
  questionCounter++;
  const id = `q-mitori-${questionCounter}-${Date.now()}`;
  let count = 3;
  let minNum = 1;
  let maxNum = 9;

  switch (kyu) {
    case '10th_kyu':
      count = 3;
      minNum = 1;
      maxNum = 4;
      break;
    case '9th_kyu':
      count = 4;
      minNum = 1;
      maxNum = 9;
      break;
    case '8th_kyu':
      count = 4;
      minNum = 5;
      maxNum = 25;
      break;
    case '7th_kyu':
      count = 5;
      minNum = 10;
      maxNum = 60;
      break;
    case '6th_kyu':
      count = 5;
      minNum = 20;
      maxNum = 99;
      break;
    case '5th_kyu':
      count = 5;
      minNum = 50;
      maxNum = 350;
      break;
    case '4th_kyu':
      count = 6;
      minNum = 100;
      maxNum = 999;
      break;
    case '3rd_kyu':
      count = 6;
      minNum = 500;
      maxNum = 2500;
      break;
    case '2nd_kyu':
      count = 7;
      minNum = 1000;
      maxNum = 9999;
      break;
    case '1st_kyu':
      count = 8;
      minNum = 5000;
      maxNum = 45000;
      break;
    case 'dan_master':
      count = 10;
      minNum = 10000;
      maxNum = 99999;
      break;
  }

  const numbers: number[] = [];
  let running = 0;

  for (let i = 0; i < count; i++) {
    let n = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    // Allow subtraction if running total is large enough
    if (i > 0 && running > n * 1.5 && Math.random() > 0.6) {
      n = -n;
    }
    running += n;
    numbers.push(n);
  }

  const problemText = numbers.map((n, idx) => (idx === 0 ? `${n}` : n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`)).join(' ');

  return {
    id,
    subject: 'mitorizan',
    subjectName: '見取算 (Addition / Subtraction)',
    problemText,
    numbers,
    expectedResult: running,
    hint: 'Add or subtract numbers sequentially from top to bottom on the Soroban.',
  };
}

// Generate a random Kake-zan (Multiplication)
export function generateKakezan(kyu: ExamKyuLevel): ExamQuestion {
  questionCounter++;
  const id = `q-kake-${questionCounter}-${Date.now()}`;
  let n1 = 6;
  let n2 = 7;

  switch (kyu) {
    case '10th_kyu':
    case '9th_kyu':
    case '8th_kyu':
    case '7th_kyu':
      // 2-digit × 1-digit (e.g. 14 × 3, 23 × 4)
      n1 = Math.floor(Math.random() * 40) + 12;
      n2 = Math.floor(Math.random() * 6) + 2;
      break;
    case '6th_kyu':
      // 3-digit × 1-digit (e.g. 142 × 4)
      n1 = Math.floor(Math.random() * 200) + 100;
      n2 = Math.floor(Math.random() * 7) + 2;
      break;
    case '5th_kyu':
      // 2-digit × 2-digit (e.g. 34 × 26)
      n1 = Math.floor(Math.random() * 70) + 15;
      n2 = Math.floor(Math.random() * 40) + 12;
      break;
    case '4th_kyu':
      // 3-digit × 2-digit (e.g. 248 × 35)
      n1 = Math.floor(Math.random() * 300) + 120;
      n2 = Math.floor(Math.random() * 60) + 15;
      break;
    case '3rd_kyu':
      // 3-digit × 2-digit larger (e.g. 684 × 47)
      n1 = Math.floor(Math.random() * 500) + 200;
      n2 = Math.floor(Math.random() * 75) + 20;
      break;
    case '2nd_kyu':
      // 3-digit × 3-digit (e.g. 352 × 184)
      n1 = Math.floor(Math.random() * 600) + 200;
      n2 = Math.floor(Math.random() * 400) + 120;
      break;
    case '1st_kyu':
      // 4-digit × 3-digit
      n1 = Math.floor(Math.random() * 3000) + 1200;
      n2 = Math.floor(Math.random() * 400) + 150;
      break;
    case 'dan_master':
      // 4-digit × 4-digit (Dan Championship level!)
      n1 = Math.floor(Math.random() * 5000) + 2000;
      n2 = Math.floor(Math.random() * 5000) + 1500;
      break;
  }

  const expected = n1 * n2;

  return {
    id,
    subject: 'kakezan',
    subjectName: '乗算 (Multiplication)',
    num1: n1,
    operation: '×',
    num2: n2,
    problemText: `${n1} × ${n2}`,
    expectedResult: expected,
    hint: `Multiply left-to-right on the Soroban rods: multiply digits and accumulate partial products.`,
  };
}

// Generate a random Wari-zan (Division)
export function generateWarizan(kyu: ExamKyuLevel): ExamQuestion {
  questionCounter++;
  const id = `q-wari-${questionCounter}-${Date.now()}`;
  let divisor = 3;
  let quotient = 21;

  switch (kyu) {
    case '10th_kyu':
    case '9th_kyu':
    case '8th_kyu':
    case '7th_kyu':
    case '6th_kyu':
      // 2 or 3-digit ÷ 1-digit (e.g. 84 ÷ 4, 96 ÷ 3, 156 ÷ 6)
      divisor = Math.floor(Math.random() * 7) + 2; // 2 to 8
      quotient = Math.floor(Math.random() * 40) + 12; // 12 to 51
      break;
    case '5th_kyu':
      // 3 or 4-digit ÷ 1-digit (e.g. 488 ÷ 4, 1,425 ÷ 5)
      divisor = Math.floor(Math.random() * 7) + 3;
      quotient = Math.floor(Math.random() * 180) + 40;
      break;
    case '4th_kyu':
      // 3 or 4-digit ÷ 2-digit (e.g. 468 ÷ 12, 875 ÷ 25)
      divisor = Math.floor(Math.random() * 30) + 12; // 12 to 41
      quotient = Math.floor(Math.random() * 40) + 12;
      break;
    case '3rd_kyu':
      // 4-digit ÷ 2-digit (e.g. 1,404 ÷ 27, 2,835 ÷ 35)
      divisor = Math.floor(Math.random() * 50) + 15;
      quotient = Math.floor(Math.random() * 80) + 20;
      break;
    case '2nd_kyu':
      // 5-digit ÷ 2-digit (e.g. 12,480 ÷ 32)
      divisor = Math.floor(Math.random() * 60) + 20;
      quotient = Math.floor(Math.random() * 300) + 80;
      break;
    case '1st_kyu':
      // 5-digit ÷ 3-digit (e.g. 45,924 ÷ 156)
      divisor = Math.floor(Math.random() * 300) + 120;
      quotient = Math.floor(Math.random() * 200) + 50;
      break;
    case 'dan_master':
      // 6-digit ÷ 3-digit (Grandmaster Championship level!)
      divisor = Math.floor(Math.random() * 600) + 200;
      quotient = Math.floor(Math.random() * 600) + 150;
      break;
  }

  const dividend = divisor * quotient;

  return {
    id,
    subject: 'warizan',
    subjectName: '除算 (Division)',
    num1: dividend,
    operation: '÷',
    num2: divisor,
    problemText: `${dividend} ÷ ${divisor}`,
    expectedResult: quotient,
    hint: `Wari-zan rule: Estimate trial quotient, subtract (${divisor} × quotient) from the left dividend rods.`,
  };
}

// Generate a full official Japanese Kyu Examination set
export function generateExamSet(kyu: ExamKyuLevel, subjectFilter: QuizSubject = 'comprehensive'): ExamQuestion[] {
  const config = KYU_CONFIGS.find((c) => c.id === kyu) || KYU_CONFIGS[0];
  const questions: ExamQuestion[] = [];
  const count = config.questionCount;

  for (let i = 0; i < count; i++) {
    if (subjectFilter === 'mitorizan') {
      questions.push(generateMitorizan(kyu));
    } else if (subjectFilter === 'kakezan') {
      questions.push(generateKakezan(kyu));
    } else if (subjectFilter === 'warizan') {
      questions.push(generateWarizan(kyu));
    } else {
      // Comprehensive: mix based on Kyu level
      if (kyu === '10th_kyu' || kyu === '9th_kyu' || kyu === '8th_kyu') {
        // Beginners focus on Mitori-zan and early multiplication
        if (i % 3 === 2) {
          questions.push(generateKakezan(kyu));
        } else {
          questions.push(generateMitorizan(kyu));
        }
      } else {
        // Balanced Japanese test: Mitori-zan, Kake-zan, and Wari-zan!
        const r = i % 3;
        if (r === 0) questions.push(generateMitorizan(kyu));
        else if (r === 1) questions.push(generateKakezan(kyu));
        else questions.push(generateWarizan(kyu));
      }
    }
  }

  return questions;
}
