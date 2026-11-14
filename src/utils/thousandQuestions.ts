export interface BankQuestion {
  id: number; // 1 to 1000
  stage: number; // 1 to 7
  stageName: string;
  stageJapanese: string;
  category: 'mitorizan' | 'kakezan' | 'warizan';
  problemText: string;
  numbers?: number[];
  num1?: number;
  operation?: '+' | '-' | '×' | '÷';
  num2?: number;
  expectedResult: number;
  hint: string;
}

// Pseudo-random deterministic generator using linear congruential generator (LCG)
// Ensures question #X is always identical across every device and reload!
function lcg(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateQuestionById(id: number): BankQuestion {
  const rng = lcg(id * 997 + 104729);

  // STAGE 1: Q1 - Q150: Mitori-zan Basics & Direct Subtraction
  if (id <= 150) {
    const rowCount = 3 + (id % 2);
    const numbers: number[] = [];
    let running = Math.floor(rng() * 4) + 2;
    numbers.push(running);

    for (let r = 1; r < rowCount; r++) {
      let n = Math.floor(rng() * 3) + 1;
      if (running > n && rng() > 0.5) {
        n = -n;
      }
      running += n;
      numbers.push(n);
    }

    const text = numbers.map((n, i) => (i === 0 ? `${n}` : n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`)).join(' ');
    return {
      id,
      stage: 1,
      stageName: 'Mitori-zan Fundamentals (Direct Moves)',
      stageJapanese: '第1部: 見取算の基本 (直接加減算)',
      category: 'mitorizan',
      problemText: text,
      numbers,
      expectedResult: running,
      hint: 'Direct earth and heaven bead moves: Thumb pushes earth beads UP, index/middle finger pulls them DOWN.',
    };
  }

  // STAGE 2: Q151 - Q300: Friends of 5 Mastery (+/- 1, 2, 3, 4)
  if (id <= 300) {
    const pairs = [
      { n1: 4, n2: 1, text: '4 + 1', res: 5, h: '+1 = +5 - 4 (Drop 5 down, push 4 earth beads down)' },
      { n1: 3, n2: 3, text: '3 + 3', res: 6, h: '+3 = +5 - 2 (Drop 5 down, push 2 earth beads down)' },
      { n1: 2, n2: 4, text: '2 + 4', res: 6, h: '+4 = +5 - 1 (Drop 5 down, push 1 earth bead down)' },
      { n1: 5, n2: -1, text: '5 - 1', res: 4, h: '-1 = -5 + 4 (Push 5 up, push 4 earth beads up)' },
      { n1: 5, n2: -2, text: '5 - 2', res: 3, h: '-2 = -5 + 3 (Push 5 up, push 3 earth beads up)' },
      { n1: 6, n2: -3, text: '6 - 3', res: 3, h: '-3 = -5 + 2 (Push 5 up, push 2 earth beads up)' },
      { n1: 7, n2: -4, text: '7 - 4', res: 3, h: '-4 = -5 + 1 (Push 5 up, push 1 earth bead up)' },
      { n1: 8, n2: -4, text: '8 - 4', res: 4, h: '-4 = -5 + 1' },
      { n1: 4, n2: 2, text: '4 + 2', res: 6, h: '+2 = +5 - 3' },
      { n1: 3, n2: 4, text: '3 + 4', res: 7, h: '+4 = +5 - 1' },
    ];
    const pick = pairs[id % pairs.length];
    const extra = Math.floor(rng() * 15) * 10;
    const finalN1 = pick.n1 + extra;
    const finalRes = pick.res + extra;
    const finalProblem = `${finalN1} ${pick.n2 > 0 ? `+ ${pick.n2}` : `- ${Math.abs(pick.n2)}`}`;

    return {
      id,
      stage: 2,
      stageName: 'Friends of 5 Mastery (五の補数特訓)',
      stageJapanese: '第2部: 五の補数加減算',
      category: 'mitorizan',
      problemText: finalProblem,
      expectedResult: finalRes,
      hint: pick.h,
    };
  }

  // STAGE 3: Q301 - Q450: Friends of 10 Carries & Borrows
  if (id <= 450) {
    const pairs = [
      { n1: 9, n2: 3, text: '9 + 3', res: 12, h: '+3 = +10 - 7' },
      { n1: 8, n2: 7, text: '8 + 7', res: 15, h: '+7 = +10 - 3' },
      { n1: 7, n2: 8, text: '7 + 8', res: 15, h: '+8 = +10 - 2' },
      { n1: 6, n2: 9, text: '6 + 9', res: 15, h: '+9 = +10 - 1' },
      { n1: 13, n2: -8, text: '13 - 8', res: 5, h: '-8 = -10 + 2' },
      { n1: 15, n2: -7, text: '15 - 7', res: 8, h: '-7 = -10 + 3' },
      { n1: 12, n2: -9, text: '12 - 9', res: 3, h: '-9 = -10 + 1' },
      { n1: 14, n2: -6, text: '14 - 6', res: 8, h: '-6 = -10 + 4' },
      { n1: 11, n2: -7, text: '11 - 7', res: 4, h: '-7 = -10 + 3' },
      { n1: 16, n2: -9, text: '16 - 9', res: 7, h: '-9 = -10 + 1' },
    ];
    const pick = pairs[id % pairs.length];
    const tens = Math.floor(rng() * 20) * 10;
    const finalN1 = pick.n1 + tens;
    const finalRes = pick.res + tens;
    const finalProblem = `${finalN1} ${pick.n2 > 0 ? `+ ${pick.n2}` : `- ${Math.abs(pick.n2)}`}`;

    return {
      id,
      stage: 3,
      stageName: 'Friends of 10 Carries & Borrows (十の補数)',
      stageJapanese: '第3部: 十の補数 (繰り上がり・繰り下がり)',
      category: 'mitorizan',
      problemText: finalProblem,
      expectedResult: finalRes,
      hint: pick.h,
    };
  }

  // STAGE 4: Q451 - Q600: Mixed Combinations (破五加減算)
  if (id <= 600) {
    const mixedPatterns = [
      { n1: 13, n2: -6, res: 7, h: '-6 = -10 + 5 - 1 (Borrow 10 on left rod, drop 5, push 1 earth bead down)' },
      { n1: 14, n2: -7, res: 7, h: '-7 = -10 + 5 - 2 (Borrow 10 on left rod, drop 5, push 2 earth beads down)' },
      { n1: 14, n2: -8, res: 6, h: '-8 = -10 + 5 - 3 (Borrow 10 on left rod, drop 5, push 3 earth beads down)' },
      { n1: 13, n2: -7, res: 6, h: '-7 = -10 + 5 - 2' },
      { n1: 12, n2: -7, res: 5, h: '-7 = -10 + 5 - 2' },
      { n1: 13, n2: -8, res: 5, h: '-8 = -10 + 5 - 3' },
      { n1: 6, n2: 7, res: 13, h: '+7 = +10 - 5 + 2 (Add 10 on left rod, push 5 up, push 2 earth beads up)' },
      { n1: 7, n2: 6, res: 13, h: '+6 = +10 - 5 + 1' },
      { n1: 8, n2: 6, res: 14, h: '+6 = +10 - 5 + 1' },
    ];
    const pick = mixedPatterns[id % mixedPatterns.length];
    const base = Math.floor(rng() * 30) * 10;
    const finalN1 = pick.n1 + base;
    const finalRes = pick.res + base;
    const finalProblem = `${finalN1} ${pick.n2 > 0 ? `+ ${pick.n2}` : `- ${Math.abs(pick.n2)}`}`;

    return {
      id,
      stage: 4,
      stageName: 'Mixed Combinations Subtraction (破五加減算)',
      stageJapanese: '第4部: 破五加減算 (混合公式の極意)',
      category: 'mitorizan',
      problemText: finalProblem,
      expectedResult: finalRes,
      hint: pick.h,
    };
  }

  // STAGE 5: Q601 - Q750: Kake-zan Multiplication Progression
  if (id <= 750) {
    let n1: number;
    let n2: number;
    if (id <= 660) {
      // 2-digit × 1-digit
      n1 = Math.floor(rng() * 40) + 12;
      n2 = Math.floor(rng() * 6) + 3;
    } else if (id <= 710) {
      // 3-digit × 1-digit
      n1 = Math.floor(rng() * 200) + 110;
      n2 = Math.floor(rng() * 7) + 2;
    } else {
      // 2-digit × 2-digit
      n1 = Math.floor(rng() * 40) + 15;
      n2 = Math.floor(rng() * 30) + 12;
    }

    const expected = n1 * n2;
    return {
      id,
      stage: 5,
      stageName: 'Kake-zan Multiplication (乗算特訓)',
      stageJapanese: '第5部: 乗算特訓 (掛け算)',
      category: 'kakezan',
      num1: n1,
      operation: '×',
      num2: n2,
      problemText: `${n1} × ${n2}`,
      expectedResult: expected,
      hint: `Kake-zan rule: Multiply left-to-right and accumulate partial products on the rods.`,
    };
  }

  // STAGE 6: Q751 - Q900: Wari-zan Division Progression
  if (id <= 900) {
    let divisor: number;
    let quotient: number;
    if (id <= 800) {
      // 2 or 3-digit ÷ 1-digit
      divisor = Math.floor(rng() * 6) + 3;
      quotient = Math.floor(rng() * 35) + 12;
    } else if (id <= 850) {
      // 3-digit ÷ 1-digit larger
      divisor = Math.floor(rng() * 6) + 4;
      quotient = Math.floor(rng() * 120) + 30;
    } else {
      // 3 or 4-digit ÷ 2-digit
      divisor = Math.floor(rng() * 25) + 12;
      quotient = Math.floor(rng() * 30) + 12;
    }

    const dividend = divisor * quotient;
    return {
      id,
      stage: 6,
      stageName: 'Wari-zan Division Mastery (除算特訓)',
      stageJapanese: '第6部: 除算特訓 (割り算)',
      category: 'warizan',
      num1: dividend,
      operation: '÷',
      num2: divisor,
      problemText: `${dividend} ÷ ${divisor}`,
      expectedResult: quotient,
      hint: `Wari-zan rule: Estimate trial quotient, subtract (${divisor} × quotient) from left dividend rods.`,
    };
  }

  // STAGE 7: Q901 - Q1000: Grandmaster Championship Challenges (段位総合特訓)
  const isMult = id % 3 === 0;
  const isDiv = id % 3 === 1;

  if (isMult) {
    const n1 = Math.floor(rng() * 400) + 150;
    const n2 = Math.floor(rng() * 60) + 20;
    return {
      id,
      stage: 7,
      stageName: 'Grandmaster Marathon (段位総合特訓)',
      stageJapanese: '第7部: 名人総合特訓 (最難関)',
      category: 'kakezan',
      num1: n1,
      operation: '×',
      num2: n2,
      problemText: `${n1} × ${n2}`,
      expectedResult: n1 * n2,
      hint: 'Championship 3-digit × 2-digit multiplication.',
    };
  }

  if (isDiv) {
    const divisor = Math.floor(rng() * 45) + 15;
    const quotient = Math.floor(rng() * 80) + 25;
    const dividend = divisor * quotient;
    return {
      id,
      stage: 7,
      stageName: 'Grandmaster Marathon (段位総合特訓)',
      stageJapanese: '第7部: 名人総合特訓 (最難関)',
      category: 'warizan',
      num1: dividend,
      operation: '÷',
      num2: divisor,
      problemText: `${dividend} ÷ ${divisor}`,
      expectedResult: quotient,
      hint: 'Championship 4-digit ÷ 2-digit division.',
    };
  }

  // Mitori-zan 5-row multi-digit marathon
  const rowCount = 5;
  const numbers: number[] = [];
  let running = Math.floor(rng() * 300) + 200;
  numbers.push(running);

  for (let r = 1; r < rowCount; r++) {
    let n = Math.floor(rng() * 200) + 50;
    if (running > n * 1.5 && rng() > 0.5) {
      n = -n;
    }
    running += n;
    numbers.push(n);
  }

  const text = numbers.map((n, i) => (i === 0 ? `${n}` : n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`)).join(' ');
  return {
    id,
    stage: 7,
    stageName: 'Grandmaster Marathon (段位総合特訓)',
    stageJapanese: '第7部: 名人総合特訓 (最難関)',
    category: 'mitorizan',
    problemText: text,
    numbers,
    expectedResult: running,
    hint: 'Multi-digit columnar addition and subtraction marathon.',
  };
}
