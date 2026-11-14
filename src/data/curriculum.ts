export interface LectureSection {
  title: string;
  content: string;
  formulaHighlight?: string;
  fingerRule?: string; // e.g., "Thumb pushes UP, Index/Middle pulls DOWN"
  beadVisualDescription?: string;
}

export interface GuidedExercise {
  id: string;
  title: string;
  instruction: string;
  explanation: string;
  initialValue: number;
  targetValue: number;
  highlightRod?: number;
  formula?: string;
  senseiAdvice?: string;
}

export interface CheckpointQuestion {
  id: string;
  questionText: string;
  initialValue: number;
  operationText: string;
  expectedResult: number;
  conceptTested: string;
  hint: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  japaneseTitle: string;
  subtitle: string;
  levelBadge: string; // e.g. "Level 1: Absolute Beginner", "Level 2: Elementary", etc.
  estimatedTimeMin: number;
  overview: string;
  senseiChant: string; // Traditional Japanese pedagogical chant or rhythmic mnemonic
  lectureSections: LectureSection[];
  guidedExercises: GuidedExercise[];
  checkpointQuestions: CheckpointQuestion[];
}

export const SENSEI_CURRICULUM: Chapter[] = [
  // =========================================================================
  // CHAPTER 1: THE ANATOMY & DISCIPLINE OF THE SOROBAN
  // =========================================================================
  {
    id: 'ch-1',
    number: 1,
    title: 'The Anatomy & Finger Discipline',
    japaneseTitle: '第一章: 珠算の構造と指使い',
    subtitle: 'From Absolute Zero to Reading the Board',
    levelBadge: 'Level 1: Absolute Beginner',
    estimatedTimeMin: 15,
    overview: `Welcome to the Japanese Soroban Dojo! Before moving a single bead, you must understand the tool just as a Japanese student does. 
The modern Japanese Soroban (standardized in the 1930s) uses a precise 1:4 bead ratio per column. 
Each column is divided by the horizontal "Reckoning Beam". 
Above the beam lies the "Heaven Bead" (worth 5). Below the beam lie four "Earth Beads" (each worth 1).
A bead only has value when it is moved towards the Reckoning Beam. When beads rest against the outer wooden frame, they are silent (0).`,
    senseiChant: '親指は下珠を上げ、人差し指・中指は下珠を下げる。五の珠は中指で上下する。(Thumb lifts Earth; Middle finger drops Earth; Middle finger commands Heaven 5.)',
    lectureSections: [
      {
        title: '1. The Physical Architecture',
        content: `Take a look at your abacus:
• Outer Ebony Frame (枠 - Waku): The rectangular boundary. Beads pushed against this outer frame have zero value.
• Reckoning Beam (梁 - Hari): The central bar dividing upper and lower decks. Any bead touching this beam is ACTIVE.
• Reckoning Unit Dots (定位点 - Tei-iten): The ivory/white dots stamped every three rods. The center dot marks the "Unit Rod" (the 1s digit). The dot to its left marks the thousands (1,000s). The next dot marks millions (1,000,000s).
• Heaven Deck (天珠 - Ten-dama): 1 upper bead per rod. Value = 5.
• Earth Deck (地珠 - Ji-dama): 4 lower beads per rod. Value = 1 each.`,
        beadVisualDescription: '1 Heaven bead on top (worth 5) + 4 Earth beads below (worth 1 each). Total possible on one rod = 9.',
      },
      {
        title: '2. The Japanese Finger Discipline (Bi-Finger Technique)',
        content: `In authentic Japanese academies, students are strictly trained never to use random fingers. Your fingers must become automatic mechanisms:
1. Thumb (親指 - Oyayubi): Used EXCLUSIVELY to push Earth beads UP against the reckoning beam (+1, +2, +3, +4).
2. Index or Middle Finger (中指/人差し指):
   • Used to pull Earth beads DOWN away from the beam (-1, -2, -3, -4).
   • Used to operate the Heaven Bead (5) in BOTH directions (pulling it down to add 5, pushing it up to subtract 5).
3. The Japanese Pencil Grip: Japanese students curl their ring and pinky fingers around a pencil while calculating so they can write answers instantly without putting down their tool.`,
        fingerRule: '👍 THUMB = Earth Beads UP (+)\n👆 MIDDLE/INDEX = Earth Beads DOWN (-) & Heaven Bead BOTH WAYS (±5)',
      },
      {
        title: '3. Reading and Setting Digits (0 to 9)',
        content: `Every rod can represent any single digit from 0 to 9:
• 0: Clean board. All 4 earth beads down against bottom frame, upper bead up against top frame.
• 1 to 4: Push 1, 2, 3, or 4 earth beads UP to the beam with your thumb.
• 5: Push all earth beads down, and pull the heaven bead DOWN with your middle finger.
• 6: The "Pinch" (挟む - Hasamu). Pull 5 down AND push 1 earth bead up together! (5 + 1 = 6).
• 7: 5 down + 2 earth beads up.
• 8: 5 down + 3 earth beads up.
• 9: 5 down + all 4 earth beads up (5 + 4 = 9).`,
        formulaHighlight: 'Rod Value = (Heaven ? 5 : 0) + (Earth Active Count)',
      },
    ],
    guidedExercises: [
      {
        id: 'ch1-ex1',
        title: 'Exercise 1: Setting 3 with Your Thumb',
        instruction: 'Using your thumb, slide 3 lower Earth beads UP against the reckoning beam on the ones rod (rightmost).',
        explanation: 'Each lower bead is worth 1. Moving 3 beads up gives the value 3.',
        initialValue: 0,
        targetValue: 3,
        highlightRod: 12,
        senseiAdvice: 'Rest your wrist comfortably. Flick the 3 beads up in a single fluid thumb motion.',
      },
      {
        id: 'ch1-ex2',
        title: 'Exercise 2: Setting the Heaven Bead (5)',
        instruction: 'Reset earth beads to 0, and pull the UPPER Heaven bead DOWN against the beam.',
        explanation: 'The single upper bead represents 5. Notice how 5 is represented by one elegant bead instead of five individual ones.',
        initialValue: 0,
        targetValue: 5,
        highlightRod: 12,
        senseiAdvice: 'Use your middle or index finger to slide the upper bead smoothly down against the reckoning bar.',
      },
      {
        id: 'ch1-ex3',
        title: 'Exercise 3: The Traditional Pinch (Setting 7)',
        instruction: 'Set 7 on the ones column: Heaven bead (5) DOWN + 2 Earth beads UP.',
        explanation: '5 + 2 = 7. In Japanese abacus schools, students practice "pinching" the beads together in one instant motion.',
        initialValue: 0,
        targetValue: 7,
        highlightRod: 12,
        senseiAdvice: 'Pinch both 5 and the two earth beads toward the reckoning bar.',
      },
    ],
    checkpointQuestions: [
      {
        id: 'ch1-chk1',
        questionText: 'Display the single digit 4 on the rightmost column.',
        initialValue: 0,
        operationText: 'Set digit 4',
        expectedResult: 4,
        conceptTested: 'Earth beads direct activation',
        hint: 'Slide all four lower beads up using your thumb.',
      },
      {
        id: 'ch1-chk2',
        questionText: 'Display the number 8 on the rightmost column.',
        initialValue: 0,
        operationText: 'Set digit 8',
        expectedResult: 8,
        conceptTested: 'Compound digit pinch (5 + 3)',
        hint: 'Upper bead 5 down + 3 lower beads up.',
      },
      {
        id: 'ch1-chk3',
        questionText: 'Set the two-digit number 25 (2 on the tens rod, 5 on the ones rod).',
        initialValue: 0,
        operationText: 'Set number 25',
        expectedResult: 25,
        conceptTested: 'Multi-digit place value alignment',
        hint: 'Rod 2 from right: 2 earth beads up. Rod 1 from right: upper bead 5 down.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 2: DIRECT ADDITION & SUBTRACTION
  // =========================================================================
  {
    id: 'ch-2',
    number: 2,
    title: 'Direct Operations (単純加減算)',
    japaneseTitle: '第二章: 単純加減算と合成分解',
    subtitle: 'Operating Without Complements (Clean Moves)',
    levelBadge: 'Level 1: Absolute Beginner',
    estimatedTimeMin: 20,
    overview: `Now that you know how to read the board, you will learn direct addition and subtraction. 
A "direct operation" means the beads you need to move are already available on the rod without borrowing or carrying.
Mastering clean finger transitions here builds the muscle memory necessary for lightning-fast calculations later.`,
    senseiChant: '足すときは下から押し上げ、引くときは上から払い落とす。(Adding: push up from below. Subtracting: sweep down and away.)',
    lectureSections: [
      {
        title: '1. Direct Earth Addition (+1, +2, +3)',
        content: `When beads are free on the lower deck:
Example: You have 1 on the rod, and you want to add 2.
• Look at the inactive earth beads below: 3 are available.
• With your thumb, simply flick 2 more earth beads UP to meet the beam.
• 1 + 2 = 3. Clean and instantaneous.`,
        fingerRule: 'Thumb flicks up only the exact count needed.',
      },
      {
        title: '2. Direct Subtraction (-1, -2, -3, -4)',
        content: `When you need to subtract and the active lower beads already contain that amount:
Example: You have 4 on the rod, and you want to subtract 3.
• Look at the active earth beads touching the beam: all 4 are active.
• Place your index or middle finger on the 3rd bead from top and slide DOWN away from the beam.
• 4 - 3 = 1. Only 1 earth bead remains touching the beam.`,
        fingerRule: 'Index or middle finger pulls the required beads down to the outer frame.',
      },
      {
        title: '3. Direct Heaven Operations (±5) & Compound Pinches (±6, ±7, ±8, ±9)',
        content: `Direct Addition of 5: Pull heaven bead DOWN with middle finger.
Direct Subtraction of 5: Push heaven bead UP to the frame with middle finger.
Compound Direct Subtraction (e.g. 8 - 6):
• Start with 8 (upper 5 + 3 lower).
• To subtract 6 (which is 5 and 1):
  1. Push upper bead 5 UP (away from beam).
  2. Slide 1 lower bead DOWN (away from beam).
• This is called "Splitting" (開く - Hiraku). 8 - 6 = 2 lower beads left!`,
        formulaHighlight: 'Adding 6-9: Pinch together. Subtracting 6-9: Split apart.',
      },
    ],
    guidedExercises: [
      {
        id: 'ch2-ex1',
        title: 'Exercise 1: Direct Earth Math (2 + 2 - 3)',
        instruction: 'The abacus starts at 2. Add 2 (thumb UP), then subtract 3 (middle finger DOWN).',
        explanation: '2 + 2 = 4. Then 4 - 3 = 1. All moves are direct.',
        initialValue: 2,
        targetValue: 1,
        highlightRod: 12,
        senseiAdvice: 'Feel the snappy clack of the beads. Keep your thumb relaxed below the beam.',
      },
      {
        id: 'ch2-ex2',
        title: 'Exercise 2: Heaven Addition and Subtraction (3 + 5 - 2)',
        instruction: 'Starts at 3. Add 5 by dropping the upper bead, then subtract 2 lower beads.',
        explanation: '3 + 5 = 8. Then 8 - 2 = 6 (upper 5 + 1 lower).',
        initialValue: 3,
        targetValue: 6,
        highlightRod: 12,
        senseiAdvice: 'Middle finger drops 5, then middle finger pulls 2 lower beads down.',
      },
      {
        id: 'ch2-ex3',
        title: 'Exercise 3: The Compound Split (9 - 7)',
        instruction: 'Starts at 9. Subtract 7 by pushing 5 UP and pulling 2 lower beads DOWN.',
        explanation: 'Splitting: 9 - 7 = 2. You remove 5 from above and 2 from below.',
        initialValue: 9,
        targetValue: 2,
        highlightRod: 12,
        senseiAdvice: 'Split 5 and 2 away from the beam in one fluid outward flick.',
      },
    ],
    checkpointQuestions: [
      {
        id: 'ch2-chk1',
        questionText: 'Starting at 1, add 3, then subtract 2.',
        initialValue: 1,
        operationText: '1 + 3 - 2 = ?',
        expectedResult: 2,
        conceptTested: 'Direct earth addition and subtraction',
        hint: '1 + 3 = 4. Then 4 - 2 = 2.',
      },
      {
        id: 'ch2-chk2',
        questionText: 'Starting at 2, add 5, then subtract 1.',
        initialValue: 2,
        operationText: '2 + 5 - 1 = ?',
        expectedResult: 6,
        conceptTested: 'Direct mixed earth and heaven operations',
        hint: '2 + 5 = 7. 7 - 1 = 6 (5 down + 1 lower bead).',
      },
      {
        id: 'ch2-chk3',
        questionText: 'Calculate: 9 - 6 on the ones rod.',
        initialValue: 9,
        operationText: '9 - 6 = ?',
        expectedResult: 3,
        conceptTested: 'Compound split subtraction',
        hint: 'Remove 5 (up) and remove 1 (down). 3 lower beads remain.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 3: THE SECRET OF 5 — FIVE-COMPLEMENTS (FRIENDS OF 5)
  // =========================================================================
  {
    id: 'ch-3',
    number: 3,
    title: 'The Secret of 5: Friends of 5 (五の補数)',
    japaneseTitle: '第三章: 五の補数加減算',
    subtitle: 'Overcoming the First Mental Hurdle',
    levelBadge: 'Level 2: Elementary',
    estimatedTimeMin: 25,
    overview: `Here is where 90% of self-taught abacus learners get stuck—and where a real Japanese teacher makes all the difference!
What happens when you have 4 on the rod and you want to add 1? 
All 4 earth beads are already touching the beam. There are no earth beads left to push up!
To solve this, we use the "Friends of 5". 
Because 5 is the midpoint of our 10-digit system, two numbers that add up to 5 are called "Friends of 5":
• 1 and 4 are Friends (1 + 4 = 5)
• 2 and 3 are Friends (2 + 3 = 5)`,
    senseiChant: '足せないときは、五を足して友を引く！引けないときは、友を足して五を引く！(If you cannot add: add 5 and subtract its friend! If you cannot subtract: add its friend and subtract 5!)',
    lectureSections: [
      {
        title: '1. The 5-Complement Addition Rules',
        content: `When there are not enough lower beads to add directly, but the upper bead (5) is available:
Formula: +X = +5 - (5 - X)

• To add 4: Add 5, subtract 1 (+4 = +5 - 1)
• To add 3: Add 5, subtract 2 (+3 = +5 - 2)
• To add 2: Add 5, subtract 3 (+2 = +5 - 3)
• To add 1: Add 5, subtract 4 (+1 = +5 - 4)

Example: Calculate 4 + 1:
1. You have 4 lower beads up.
2. You need to add 1, but no lower beads are free.
3. Bring the upper bead 5 DOWN (+5).
4. Pull 4 lower beads DOWN (-4).
5. Result: exactly 5!`,
        formulaHighlight: '+1 = +5 - 4  |  +2 = +5 - 3  |  +3 = +5 - 2  |  +4 = +5 - 1',
        fingerRule: 'Drop 5 down with middle finger; sweep the friend down with middle finger.',
      },
      {
        title: '2. The 5-Complement Subtraction Rules (Your Core Weakness Conquered!)',
        content: `What if you have 5 on the board and want to subtract 1?
You look at the lower deck: zero beads are touching the beam! How do you subtract 1?
Formula: -X = -5 + (5 - X)

• To subtract 1: Subtract 5, add 4 (-1 = -5 + 4)
• To subtract 2: Subtract 5, add 3 (-2 = -5 + 3)
• To subtract 3: Subtract 5, add 2 (-3 = -5 + 2)
• To subtract 4: Subtract 5, add 1 (-4 = -5 + 1)

Example: Calculate 7 - 3:
1. You have 7 (upper 5 + 2 lower).
2. You need to subtract 3, but only 2 lower beads are active!
3. Push the upper bead 5 UP (-5).
4. Push 2 lower beads UP (+2) with your thumb!
5. Result: 4 lower beads touching the beam. 7 - 3 = 4!`,
        formulaHighlight: '-1 = -5 + 4  |  -2 = -5 + 3  |  -3 = -5 + 2  |  -4 = -5 + 1',
        fingerRule: 'Push 5 UP with middle finger; push friend UP with thumb.',
      },
    ],
    guidedExercises: [
      {
        id: 'ch3-ex1',
        title: 'Exercise 1: 5-Complement Addition (4 + 3)',
        instruction: 'The abacus starts at 4. Add 3: Bring 5 DOWN, and pull 2 lower beads DOWN.',
        explanation: 'Formula: +3 = +5 - 2. 4 + 3 = 7 (5 down + 2 lower beads).',
        initialValue: 4,
        targetValue: 7,
        highlightRod: 12,
        formula: '+3 = +5 - 2',
        senseiAdvice: 'Think: "Friend of 3 is 2". Drop 5, drop 2.',
      },
      {
        id: 'ch3-ex2',
        title: 'Exercise 2: 5-Complement Subtraction (5 - 2)',
        instruction: 'The abacus starts at 5. Subtract 2: Push 5 UP, and push 3 lower beads UP.',
        explanation: 'Formula: -2 = -5 + 3. You remove 5 and return 2\'s friend (3). 5 - 2 = 3.',
        initialValue: 5,
        targetValue: 3,
        highlightRod: 12,
        formula: '-2 = -5 + 3',
        senseiAdvice: 'Flick 5 up with your index/middle finger, flick 3 up with your thumb.',
      },
      {
        id: 'ch3-ex3',
        title: 'Exercise 3: 5-Complement Subtraction (6 - 4)',
        instruction: 'Starts at 6 (5 + 1). Subtract 4: Push 5 UP, and push 1 lower bead UP (total 2 lower).',
        explanation: 'Formula: -4 = -5 + 1. 6 - 4 = 2.',
        initialValue: 6,
        targetValue: 2,
        highlightRod: 12,
        formula: '-4 = -5 + 1',
        senseiAdvice: 'Push 5 up, push 1 more lower bead up. You now have 2.',
      },
    ],
    checkpointQuestions: [
      {
        id: 'ch3-chk1',
        questionText: 'Calculate: 3 + 4 using the 5-complement rule.',
        initialValue: 3,
        operationText: '3 + 4 = ?',
        expectedResult: 7,
        conceptTested: '+4 = +5 - 1',
        hint: 'Bring 5 down, remove 1 lower bead. 3 + 4 = 7.',
      },
      {
        id: 'ch3-chk2',
        questionText: 'Calculate: 5 - 1 using the 5-complement subtraction rule.',
        initialValue: 5,
        operationText: '5 - 1 = ?',
        expectedResult: 4,
        conceptTested: '-1 = -5 + 4',
        hint: 'Remove 5 (up), add 4 lower beads (up). Result is 4.',
      },
      {
        id: 'ch3-chk3',
        questionText: 'Calculate: 7 - 4 using the 5-complement subtraction rule.',
        initialValue: 7,
        operationText: '7 - 4 = ?',
        expectedResult: 3,
        conceptTested: '-4 = -5 + 1',
        hint: 'Remove 5 (up), add 1 lower bead (up). Result is 3.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 4: THE POWER OF 10 — TEN-COMPLEMENTS (CARRIES & BORROWS)
  // =========================================================================
  {
    id: 'ch-4',
    number: 4,
    title: 'The Power of 10: Friends of 10 (十の補数)',
    japaneseTitle: '第四章: 十の補数 (繰り上がりと繰り下がり)',
    subtitle: 'Multi-Digit Carries & Borrows Across Rods',
    levelBadge: 'Level 2: Elementary',
    estimatedTimeMin: 30,
    overview: `What happens when you have 9 on a rod and want to add 1? 
The rod is completely full (5 + 4 = 9). No beads are left on that rod!
In base-10 mathematics, when a column exceeds 9, we carry 1 over to the tens column on the left.
Two numbers that sum to 10 are called "Friends of 10":
• 9 & 1  |  8 & 2  |  7 & 3  |  6 & 4  |  5 & 5
Mastering the 10-complement allows you to carry and borrow across any number of rods smoothly.`,
    senseiChant: '足せない十は、友を引いて左へ一繰り上げる！引けない十は、左から一繰り下げて友を足す！(Cannot add: subtract friend and carry 1 left! Cannot subtract: borrow 1 from left and add friend!)',
    lectureSections: [
      {
        title: '1. Carrying to the Next Rod (+X with Carry)',
        content: `Rule: +X = - (10 - X) + 10
Whenever a rod cannot hold the addition:
1. Subtract the friend of 10 on the current rod.
2. Add 1 (carry) on the rod immediately to the left!

Formulas:
• +9 = -1 on current rod, +1 on tens rod
• +8 = -2 on current rod, +1 on tens rod
• +7 = -3 on current rod, +1 on tens rod
• +6 = -4 on current rod, +1 on tens rod
• +5 = -5 on current rod, +1 on tens rod`,
        formulaHighlight: '+9 = -1 + 10  |  +8 = -2 + 10  |  +7 = -3 + 10  |  +6 = -4 + 10',
      },
      {
        title: '2. Borrowing from the Left Rod (-X with Borrow)',
        content: `Rule: -X = -10 + (10 - X)
When you must subtract a digit that exceeds the current rod's available beads:
1. Borrow 10: remove 1 bead on the rod to the left (-10).
2. Add the friend of 10 to the current rod.

Formulas:
• -9 = -1 on left rod, +1 on current rod
• -8 = -1 on left rod, +2 on current rod
• -7 = -1 on left rod, +3 on current rod
• -6 = -1 on left rod, +4 on current rod
• -5 = -1 on left rod, +5 on current rod

Example: 12 - 4
1. Tens rod has 1. Ones rod has 2.
2. Cannot subtract 4 directly from 2.
3. Remove 1 from tens rod (-10).
4. Add 4's friend (6) to the ones rod (+6): pinch 5 down and 1 up.
5. Result: 8! (12 - 4 = 8).`,
        formulaHighlight: '-9 = -10 + 1  |  -8 = -10 + 2  |  -7 = -10 + 3  |  -6 = -10 + 4',
      },
    ],
    guidedExercises: [
      {
        id: 'ch4-ex1',
        title: 'Exercise 1: Carrying with Friend of 10 (9 + 4)',
        instruction: 'The abacus starts at 9. Add 4: Subtract 6 on the ones rod, add 1 on the tens rod.',
        explanation: 'Formula: +4 = -6 + 10. You remove 6 (split 5 and 1) from the ones rod, and push 1 earth bead up on the tens rod. 9 + 4 = 13.',
        initialValue: 9,
        targetValue: 13,
        highlightRod: 11,
        formula: '+4 = -6 + 10',
        senseiAdvice: 'Flick 6 off the ones rod, lift 1 on the tens rod with your thumb.',
      },
      {
        id: 'ch4-ex2',
        title: 'Exercise 2: Multi-digit Borrowing (15 - 7)',
        instruction: 'Starts at 15 (1 on tens, 5 on ones). Subtract 7: Remove 1 on tens rod, add 3 on ones rod.',
        explanation: 'Formula: -7 = -10 + 3. Tens becomes 0. Ones had 5 + 3 = 8. Result is 8.',
        initialValue: 15,
        targetValue: 8,
        highlightRod: 11,
        formula: '-7 = -10 + 3',
        senseiAdvice: 'Remove 1 from the tens rod first, then add 3 lower beads to the ones rod.',
      },
      {
        id: 'ch4-ex3',
        title: 'Exercise 3: The Big Borrow (20 - 9)',
        instruction: 'Starts at 20 (2 on tens rod). Subtract 9: lower tens rod to 1, add 1 on ones rod.',
        explanation: 'Formula: -9 = -10 + 1. 20 - 10 = 10, then +1 = 11.',
        initialValue: 20,
        targetValue: 11,
        highlightRod: 11,
        formula: '-9 = -10 + 1',
        senseiAdvice: 'Drop 1 on tens rod, push 1 up on ones rod.',
      },
    ],
    checkpointQuestions: [
      {
        id: 'ch4-chk1',
        questionText: 'Calculate: 8 + 5 using the 10-complement carry rule.',
        initialValue: 8,
        operationText: '8 + 5 = ?',
        expectedResult: 13,
        conceptTested: '+5 = -5 + 10',
        hint: 'Remove 5 on ones rod, add 1 on tens rod. 8 + 5 = 13.',
      },
      {
        id: 'ch4-chk2',
        questionText: 'Calculate: 14 - 9 using the 10-complement borrow rule.',
        initialValue: 14,
        operationText: '14 - 9 = ?',
        expectedResult: 5,
        conceptTested: '-9 = -10 + 1',
        hint: 'Remove 1 from tens rod (-10), add 1 to ones rod (4 + 1 = 5). Result is 5.',
      },
      {
        id: 'ch4-chk3',
        questionText: 'Calculate: 23 - 8 on the abacus.',
        initialValue: 23,
        operationText: '23 - 8 = ?',
        expectedResult: 15,
        conceptTested: '-8 = -10 + 2',
        hint: 'Tens rod: 2 becomes 1. Ones rod: 3 + 2 = 5 (upper bead down). Result is 15.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 5: MIXED COMBINATIONS — THE MASTER'S HURDLE (破五加減算)
  // =========================================================================
  {
    id: 'ch-5',
    number: 5,
    title: 'Mixed Combinations: The Master\'s Hurdle (破五減算)',
    japaneseTitle: '第五章: 破五加減算 (混合公式の奥義)',
    subtitle: 'Simultaneous 10-Borrow & 5-Split Formulas',
    levelBadge: 'Level 3: Intermediate',
    estimatedTimeMin: 35,
    overview: `This chapter is the absolute crown jewel of your Soroban education. 
In Japanese Shuzan, this is called "Ha-go" (破五 - Breaking Five). 
Consider this problem: 13 - 7.
You need to subtract 7 from 13.
According to the 10-complement rule, -7 = -10 + 3.
You borrow 10 from the tens rod (tens becomes 0).
Now you must add 3 to the ones rod! But the ones rod already has 3 lower beads active! There aren't enough lower beads to add 3 directly!
So you must invoke the 5-complement: adding 3 becomes (+5 - 2)!
Combining both formulas:
-7 = -10 + 5 - 2!
This fluid motion—flicking the tens rod down, dropping 5 down, and pushing 2 beads down—is what separates masters from novices.`,
    senseiChant: '十を払って、五を下ろし、余りを下げる！(Sweep 10 away, drop 5 down, push the remainder down!)',
    lectureSections: [
      {
        title: '1. The Four Mixed Subtraction Formulas',
        content: `When subtracting 6, 7, 8, or 9 requires borrowing 10, but the ones rod has only 1, 2, 3, or 4 beads:
• -6 = -10 + 5 - 1
• -7 = -10 + 5 - 2
• -8 = -10 + 5 - 3
• -9 = -10 + 5 - 4

Step-by-step physical movement for 14 - 7:
1. Tens rod: Remove 1 (-10).
2. Ones rod: Drop heaven bead 5 DOWN (+5).
3. Ones rod: Push 2 earth beads DOWN (-2).
4. Result: 7! Notice how natural and rhythmic this sequence feels once practiced.`,
        formulaHighlight: '-6 = -10 + 5 - 1  |  -7 = -10 + 5 - 2  |  -8 = -10 + 5 - 3  |  -9 = -10 + 5 - 4',
      },
      {
        title: '2. The Four Mixed Addition Formulas',
        content: `The reverse happens when adding 6, 7, 8, or 9:
• +6 = +10 - 5 + 1
• +7 = +10 - 5 + 2
• +8 = +10 - 5 + 3
• +9 = +10 - 5 + 4

Example for 6 + 7:
1. Start at 6.
2. Want to add 7. We need +10, but must remove 3.
3. Since we have upper 5 down, removing 3 is (-5 + 2).
4. So: Add 1 on tens rod, push 5 UP on ones rod, push 2 earth beads UP on ones rod!
5. Result: 13!`,
        formulaHighlight: '+6 = +10 - 5 + 1  |  +7 = +10 - 5 + 2  |  +8 = +10 - 5 + 3  |  +9 = +10 - 5 + 4',
      },
    ],
    guidedExercises: [
      {
        id: 'ch5-ex1',
        title: 'Exercise 1: Mixed Subtraction -6 (13 - 6)',
        instruction: 'The abacus starts at 13. Subtract 6: Tens rod -1, Ones rod: drop 5 down, push 1 lower bead down.',
        explanation: 'Formula: -6 = -10 + 5 - 1. 13 - 6 = 7 (upper 5 + 2 lower beads).',
        initialValue: 13,
        targetValue: 7,
        highlightRod: 11,
        formula: '-6 = -10 + 5 - 1',
        senseiAdvice: 'Perform in sequence: 10 down, 5 down, 1 down.',
      },
      {
        id: 'ch5-ex2',
        title: 'Exercise 2: Mixed Subtraction -7 (14 - 7)',
        instruction: 'Starts at 14. Subtract 7: Tens rod -1, Ones rod: drop 5 down, push 2 lower beads down.',
        explanation: 'Formula: -7 = -10 + 5 - 2. 14 - 7 = 7.',
        initialValue: 14,
        targetValue: 7,
        highlightRod: 11,
        formula: '-7 = -10 + 5 - 2',
        senseiAdvice: 'Notice how 14 becomes 7 cleanly. This formula will never confuse you again.',
      },
      {
        id: 'ch5-ex3',
        title: 'Exercise 3: Mixed Subtraction -8 (12 - 8)',
        instruction: 'Starts at 12. Subtract 8: 12 - 8 = 4.',
        explanation: 'Formula: -8 = -10 + 2. Tens -1, ones +2 = 4.',
        initialValue: 12,
        targetValue: 4,
        highlightRod: 11,
        formula: '-8 = -10 + 2',
        senseiAdvice: 'Here 2 + 2 = 4 fits directly on lower beads. Result is 4.',
      },
    ],
    checkpointQuestions: [
      {
        id: 'ch5-chk1',
        questionText: 'Calculate: 13 - 7 using the mixed combination formula.',
        initialValue: 13,
        operationText: '13 - 7 = ?',
        expectedResult: 6,
        conceptTested: '-7 = -10 + 5 - 2',
        hint: 'Tens rod -1. Ones rod: 5 down, 2 down. Result is 6.',
      },
      {
        id: 'ch5-chk2',
        questionText: 'Calculate: 14 - 8 on the abacus.',
        initialValue: 14,
        operationText: '14 - 8 = ?',
        expectedResult: 6,
        conceptTested: '-8 = -10 + 5 - 3',
        hint: 'Tens rod -1. Ones rod: 5 down, 3 down. Result is 6.',
      },
      {
        id: 'ch5-chk3',
        questionText: 'Calculate: 6 + 7 on the abacus.',
        initialValue: 6,
        operationText: '6 + 7 = ?',
        expectedResult: 13,
        conceptTested: '+7 = +10 - 5 + 2',
        hint: 'Tens rod +1. Ones rod: 5 up, 2 up. Result is 13.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 6: KAKE-ZAN — MULTIPLICATION ARCHITECTURE (乗算の構造)
  // =========================================================================
  {
    id: 'ch-6',
    number: 6,
    title: 'Kake-zan: Multiplication Architecture (乗算)',
    japaneseTitle: '第六章: 乗算の基本と桁取り (Kake-zan)',
    subtitle: 'Accumulating Partial Products Across Columns',
    levelBadge: 'Level 4: Advanced',
    estimatedTimeMin: 35,
    overview: `In Western paper math, long multiplication is done right-to-left with tedious carrying marks. 
On the Japanese Soroban, multiplication is fluid, visual, and accumulates naturally from left to right.
Every single-digit multiplication produces a 2-digit product (e.g. 3 × 7 = 21, or 2 × 3 = 06).
By assigning the product digits to the correct columns, complex products build up effortlessly!`,
    senseiChant: '九九を唱えて桁を置く。十の位は左、一の位は右。(Recite the times table and place the digits. Tens digit on the left, ones digit on the right.)',
    lectureSections: [
      {
        title: '1. Column Allocation (Keta-tori 桁取り)',
        content: `When multiplying on a Soroban:
• Multiplicand (e.g. 23) is held in memory or placed on the left rods.
• Multiplier (e.g. 4) is held in memory.
• Product is formed on the active calculation rods.

Rule of Digits:
If multiplying an M-digit number by an N-digit number, the maximum product length is M + N digits.
Example for 23 × 4:
• 23 has 2 digits, 4 has 1 digit. Total rods needed = 2 + 1 = 3 rods (Hundreds, Tens, Ones).`,
        formulaHighlight: 'Total Product Rods = Digits(A) + Digits(B)',
      },
      {
        title: '2. The Left-to-Right Multiplication Method',
        content: `Let's calculate 24 × 3 step by step:
Step 1: Multiply tens digit first (2 × 3 = 06)
• Place 0 on hundreds rod, 6 on tens rod.
• Active total so far = 60.

Step 2: Multiply unit digit next (4 × 3 = 12)
• Add 1 to the tens rod (6 + 1 = 7).
• Add 2 to the ones rod.
• Total on abacus = 72!

Notice: There is no scratch paper, no messy carrying marks. The Soroban handles the addition automatically using the complement rules you already mastered!`,
        formulaHighlight: '24 × 3 = (20 × 3 = 60) + (4 × 3 = 12) = 72',
      },
    ],
    guidedExercises: [
      {
        id: 'ch6-ex1',
        title: 'Exercise 1: Single-Digit Multiplication (7 × 8)',
        instruction: 'Calculate 7 × 8 = 56 on the abacus. Set 5 on the tens rod and 6 on the ones rod.',
        explanation: '7 × 8 = 56. Rod 2 gets 5 (upper bead). Rod 1 gets 6 (upper 5 + 1 lower).',
        initialValue: 0,
        targetValue: 56,
        highlightRod: 11,
        formula: '7 × 8 = 56',
        senseiAdvice: 'Tens rod gets 5, ones rod gets 6.',
      },
      {
        id: 'ch6-ex2',
        title: 'Exercise 2: Two Digits × One Digit (23 × 4)',
        instruction: 'Calculate 23 × 4: 20 × 4 = 80, then 3 × 4 = 12. Total is 92. Set 92 on the abacus.',
        explanation: '80 + 12 = 92. Tens rod gets 8 + 1 = 9. Ones rod gets 2.',
        initialValue: 0,
        targetValue: 92,
        highlightRod: 11,
        formula: '23 × 4 = 80 + 12 = 92',
        senseiAdvice: 'Tens rod: 9 (upper 5 + 4 lower). Ones rod: 2 lower beads.',
      },
      {
        id: 'ch6-ex3',
        title: 'Exercise 3: Two Digits × One with Carry (35 × 4)',
        instruction: 'Calculate 35 × 4: 30 × 4 = 120, plus 5 × 4 = 20. Total is 140. Set 140 on the abacus.',
        explanation: 'Hundreds rod gets 1, tens rod gets 2 + 2 = 4, ones rod is 0. Total: 140.',
        initialValue: 0,
        targetValue: 140,
        highlightRod: 10,
        formula: '35 × 4 = 140',
        senseiAdvice: 'Hundreds: 1. Tens: 4. Ones: 0.',
      },
    ],
    checkpointQuestions: [
      {
        id: 'ch6-chk1',
        questionText: 'Calculate: 6 × 9 on the abacus.',
        initialValue: 0,
        operationText: '6 × 9 = ?',
        expectedResult: 54,
        conceptTested: 'Single digit basic Kake-zan',
        hint: 'Tens rod: 5. Ones rod: 4.',
      },
      {
        id: 'ch6-chk2',
        questionText: 'Calculate: 14 × 5 on the abacus.',
        initialValue: 0,
        operationText: '14 × 5 = ?',
        expectedResult: 70,
        conceptTested: '2-digit by 1-digit multiplication',
        hint: '10 × 5 = 50. 4 × 5 = 20. 50 + 20 = 70. Tens rod: 7, Ones: 0.',
      },
      {
        id: 'ch6-chk3',
        questionText: 'Calculate: 32 × 3 on the abacus.',
        initialValue: 0,
        operationText: '32 × 3 = ?',
        expectedResult: 96,
        conceptTested: 'Accumulating partial products',
        hint: '30 × 3 = 90. 2 × 3 = 6. Total is 96.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 7: WARI-ZAN — THE ART OF DIVISION (除算の極意)
  // =========================================================================
  {
    id: 'ch-7',
    number: 7,
    title: 'Wari-zan: The Art of Division (除算)',
    japaneseTitle: '第七章: 除算の基本と商の立て方 (Wari-zan)',
    subtitle: 'Demystifying Left-to-Right Division',
    levelBadge: 'Level 4: Advanced',
    estimatedTimeMin: 40,
    overview: `Many students dread long division in school. But on the Soroban, division is a favorite!
Why? Because division on a Soroban is simply:
1. Estimate a trial quotient digit.
2. Multiply that digit by the divisor.
3. Subtract that product directly from the dividend beads on the board!
Because you already mastered subtraction in Chapters 2 through 5, division becomes an exciting puzzle of peeling away numbers until zero remains.`,
    senseiChant: '商を立て、掛け、そして引く。残りが零になれば完成！(Set the quotient, multiply, and subtract. When remainder is zero, you are done!)',
    lectureSections: [
      {
        title: '1. The Structure of Wari-zan',
        content: `Vocabulary:
• Dividend (被除数): The number being divided (e.g., 84 in 84 ÷ 4). Set on the right/center rods.
• Divisor (除数): The number you divide by (e.g., 4 in 84 ÷ 4).
• Quotient (商): The final answer beads you build up.

The 3-Step Rhythm:
Step 1: Estimate quotient digit (How many times does the divisor fit?).
Step 2: Multiply quotient × divisor.
Step 3: Subtract product from the dividend on the abacus.`,
        formulaHighlight: 'Quotient × Divisor = Subtraction Amount',
      },
      {
        title: '2. The Quotient Rod Positioning Rule',
        content: `Where do you place the quotient bead?
Standard Japanese Rule:
• Compare the first digit of the dividend (A) with the divisor (B):
  1. If A ≥ B: Place the quotient TWO rods to the left of A.
  2. If A < B: Place the quotient ONE rod to the left of A.

Example: 84 ÷ 4:
• First digit of dividend is 8. Divisor is 4.
• Since 8 ≥ 4, place quotient on tens rod: 8 ÷ 4 = 2.
• Subtract 2 × 4 = 8 from the 8. Tens rod becomes 0!
• Next digit is 4. 4 ÷ 4 = 1.
• Subtract 1 × 4 = 4 from the 4. Ones rod becomes 0!
• Remaining beads on quotient rods show: 21!`,
        formulaHighlight: '84 ÷ 4 = 21  |  96 ÷ 3 = 32',
      },
      {
        title: '3. Division with 2-Digit Divisors',
        content: `What about 468 ÷ 12?
1. Compare first two digits (46) with 12.
2. Estimate: How many 12s in 46? 12 × 3 = 36. Quotient digit is 3.
3. Subtract 36 from 46: 46 - 36 leaves 10!
4. Combine 10 with the next digit 8 to get 108.
5. How many 12s in 108? 12 × 9 = 108! Quotient digit is 9.
6. Subtract 108 - 108 = 0.
7. Total quotient: 39!`,
        formulaHighlight: '468 ÷ 12 = 39',
      },
    ],
    guidedExercises: [
      {
        id: 'ch7-ex1',
        title: 'Exercise 1: Basic Division (84 ÷ 4)',
        instruction: 'Calculate 84 ÷ 4: 8 tens ÷ 4 = 2 tens. 4 ones ÷ 4 = 1 one. Set quotient 21 on the abacus.',
        explanation: '8 ÷ 4 = 2 (subtract 8). 4 ÷ 4 = 1 (subtract 4). Quotient is 21.',
        initialValue: 0,
        targetValue: 21,
        highlightRod: 11,
        formula: '84 ÷ 4 = 21',
        senseiAdvice: 'Set 2 on tens rod, 1 on ones rod.',
      },
      {
        id: 'ch7-ex2',
        title: 'Exercise 2: Division with Carry (156 ÷ 6)',
        instruction: 'Calculate 156 ÷ 6: 15 ÷ 6 = 2 (leaves 3). 36 ÷ 6 = 6. Quotient is 26. Set 26 on the abacus.',
        explanation: '15 - 12 = 3. 36 - 36 = 0. Total quotient is 26.',
        initialValue: 0,
        targetValue: 26,
        highlightRod: 11,
        formula: '156 ÷ 6 = 26',
        senseiAdvice: 'Tens rod: 2. Ones rod: 6 (5 down + 1 lower).',
      },
      {
        id: 'ch7-ex3',
        title: 'Exercise 3: Two-Digit Divisor (468 ÷ 12)',
        instruction: 'Calculate 468 ÷ 12: 46 ÷ 12 = 3 (rem 10). 108 ÷ 12 = 9. Quotient is 39. Set 39 on the abacus.',
        explanation: '46 - 36 = 10. 108 - 108 = 0. Result is 39.',
        initialValue: 0,
        targetValue: 39,
        highlightRod: 11,
        formula: '468 ÷ 12 = 39',
        senseiAdvice: 'Tens rod: 3. Ones rod: 9.',
      },
    ],
    checkpointQuestions: [
      {
        id: 'ch7-chk1',
        questionText: 'Calculate: 96 ÷ 3 on the abacus.',
        initialValue: 0,
        operationText: '96 ÷ 3 = ?',
        expectedResult: 32,
        conceptTested: 'Direct Wari-zan',
        hint: '9 ÷ 3 = 3, 6 ÷ 3 = 2. Result is 32.',
      },
      {
        id: 'ch7-chk2',
        questionText: 'Calculate: 144 ÷ 6 on the abacus.',
        initialValue: 0,
        operationText: '144 ÷ 6 = ?',
        expectedResult: 24,
        conceptTested: 'Division with remainder transfer',
        hint: '14 ÷ 6 = 2 (remainder 2). 24 ÷ 6 = 4. Total is 24.',
      },
      {
        id: 'ch7-chk3',
        questionText: 'Calculate: 875 ÷ 25 on the abacus.',
        initialValue: 0,
        operationText: '875 ÷ 25 = ?',
        expectedResult: 35,
        conceptTested: 'Two-digit divisor division',
        hint: '87 ÷ 25 = 3 (75, rem 12). 125 ÷ 25 = 5. Result is 35.',
      },
    ],
  },

  // =========================================================================
  // CHAPTER 8: THE AWAKENING OF ANZAN (暗算 - MENTAL SOROBAN)
  // =========================================================================
  {
    id: 'ch-8',
    number: 8,
    title: 'The Awakening of Anzan (暗算)',
    japaneseTitle: '第八章: 珠算式暗算への昇華 (Anzan Mastery)',
    subtitle: 'From Physical Beads to Photographic Mental Calculation',
    levelBadge: 'Level 5: Master',
    estimatedTimeMin: 30,
    overview: `You have reached the final stage of traditional Japanese training: Anzan (暗算 - Mental Calculation).
In Japan, the true goal of the Soroban is not to remain dependent on the physical frame. The ultimate goal is to burn the image of the Soroban into your right brain hemisphere!
Once the image is etched in your mind, your fingers twitch slightly in mid-air as you flick imaginary beads at speeds that surpass paper and electronic calculators.`,
    senseiChant: '頭の中にそろばんを浮かべよ。指を動かせば、答えは自ずと現れる。(Envision the abacus in your mind. Move your phantom fingers, and the answer reveals itself.)',
    lectureSections: [
      {
        title: '1. The Right-Brain Photographic Abacus',
        content: `Neuroscience studies of Japanese Anzan champions show that while normal mental math uses the left brain (linguistic/logic), Soroban Anzan activates the right-brain visual cortex (spatial/photographic processing).
Instead of calculating numbers as words:
"Twelve plus fourteen equals twenty-six..."
The Anzan master simply sees a 1 and 2, flicking beads into a 2 and 6. It takes 1/10th of a second!`,
        beadVisualDescription: 'Visualizing beads floating in space with zero weight.',
      },
      {
        title: '2. The 3-Step Transition Technique',
        content: `How to transition from physical to mental:
Step 1: Ghost Abacus Training: Look at a semi-transparent abacus and calculate without touching the screen.
Step 2: Air Soroban (空そろばん): Close your eyes and move your physical thumb and middle finger in the air as if flicking beads on a table.
Step 3: Pure Flash Anzan: Digits flash on screen for 0.5 seconds; your right brain photographic accumulator tallies them instantly!`,
        fingerRule: 'Twitch your thumb and middle finger in mid-air to command the mental beads.',
      },
    ],
    guidedExercises: [
      {
        id: 'ch8-ex1',
        title: 'Exercise 1: Mental Bead Projection (12 + 15)',
        instruction: 'Visualize the beads first in your mind: 12 + 15 = 27. Set 27 on the abacus to verify your mental image.',
        explanation: 'Tens rod: 1 + 1 = 2. Ones rod: 2 + 5 = 7. Mental total: 27.',
        initialValue: 0,
        targetValue: 27,
        highlightRod: 11,
        formula: '12 + 15 = 27',
        senseiAdvice: 'See the 5 bead dropping in your mind before your fingers touch the screen.',
      },
      {
        id: 'ch8-ex2',
        title: 'Exercise 2: Mental 5-Complement (24 + 13)',
        instruction: 'Mentally calculate 24 + 13: 20 + 10 = 30. 4 + 3 uses +5 - 2 = 7. Total 37. Set 37 on the board.',
        explanation: 'Mental complement: seeing the 5 drop and 2 drop in your mind. Total: 37.',
        initialValue: 0,
        targetValue: 37,
        highlightRod: 11,
        formula: '24 + 13 = 37',
        senseiAdvice: 'Project the beads in your imagination.',
      },
    ],
    checkpointQuestions: [
      {
        id: 'ch8-chk1',
        questionText: 'Mentally calculate and set: 15 + 23',
        initialValue: 0,
        operationText: '15 + 23 = ?',
        expectedResult: 38,
        conceptTested: 'Mental two-digit direct addition',
        hint: '10 + 20 = 30. 5 + 3 = 8. Total is 38.',
      },
      {
        id: 'ch8-chk2',
        questionText: 'Mentally calculate and set: 45 - 12',
        initialValue: 0,
        operationText: '45 - 12 = ?',
        expectedResult: 33,
        conceptTested: 'Mental subtraction',
        hint: '40 - 10 = 30. 5 - 2 = 3. Total is 33.',
      },
      {
        id: 'ch8-chk3',
        questionText: 'Mentally calculate and set: 24 × 3',
        initialValue: 0,
        operationText: '24 × 3 = ?',
        expectedResult: 72,
        conceptTested: 'Mental multiplication',
        hint: '60 + 12 = 72.',
      },
    ],
  },
];
