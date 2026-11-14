import React, { useState } from 'react';
import {
  Sparkles,
  Fingerprint,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { sound } from '../audio/soundEffects';

export type AnatomyPartId = 'upper' | 'rod' | 'beam' | 'lower' | 'frame' | 'dots' | 'clearButton';

export interface AnatomyPartInfo {
  id: AnatomyPartId;
  name: string;
  japanese: string;
  romaji: string;
  valueDescription: string;
  fingerRule: string;
  description: string;
  proTip: string;
}

export const ANATOMY_PARTS: Record<AnatomyPartId, AnatomyPartInfo> = {
  upper: {
    id: 'upper',
    name: 'Upper Beads',
    japanese: '天珠',
    romaji: 'Ten-dama',
    valueDescription: 'Value = 5 per rod (1 bead per column)',
    fingerRule: 'Operated exclusively by the Index or Middle Finger (中指/人差し指) in BOTH directions: pull DOWN to add 5, push UP to clear 5.',
    description:
      'Also known as the "Heaven Bead". Located in the upper deck above the reckoning beam. When resting against the top frame, its value is 0. Moving it down to touch the beam activates its value of 5.',
    proTip:
      'Never use your thumb on the upper bead. In Japanese academies, touching the upper bead with the thumb is an immediate form penalty.',
  },
  lower: {
    id: 'lower',
    name: 'Lower Beads',
    japanese: '地珠',
    romaji: 'Ji-dama',
    valueDescription: 'Value = 1 each (4 beads per column = max 4)',
    fingerRule: 'Push UP with the THUMB (親指). Pull DOWN with the INDEX or MIDDLE finger (人差し指/中指).',
    description:
      'Also known as "Earth Beads". Located in the lower deck below the reckoning beam. Each bead is worth 1. Together with the heaven bead (5), a single rod can represent all digits from 0 to 9.',
    proTip:
      'The bi-finger rule is sacred: Thumb only moves UP (+1 to +4). The index/middle finger only moves DOWN (-1 to -4). This strict separation enables blinding Anzan speed.',
  },
  beam: {
    id: 'beam',
    name: 'Reckoning Beam',
    japanese: '梁',
    romaji: 'Hari',
    valueDescription: 'The Reckoning Separator (Calculation Line)',
    fingerRule: 'Beads only count when they touch the beam.',
    description:
      'The sturdy horizontal crossbar that divides heaven (5) and earth (1s). Beads floating away against the outer borders are inactive (0). Only beads pushed into direct contact with the beam are reckoned into the active number.',
    proTip:
      'Notice the white dots on the beam—these are reckoning dots (Tei-iten) that mark every three columns, acting as standard comma separators (thousands, millions).',
  },
  rod: {
    id: 'rod',
    name: 'Rod',
    japanese: '桁 / 軸',
    romaji: 'Keta / Kushi',
    valueDescription: 'Decimal Place Value Axis (Power of 10)',
    fingerRule: 'Keep your wrist steady; flick beads along the polished bamboo or metal axis.',
    description:
      'The vertical columns that guide the beads. Each rod represents an order of magnitude: units ($10^0$), tens ($10^1$), hundreds ($10^2$), thousands ($10^3$), and beyond.',
    proTip:
      'Standard Japanese competition sorobans have 17, 23, or 27 rods, allowing calculations into billions and quadrillions without running out of columns.',
  },
  frame: {
    id: 'frame',
    name: 'Frame',
    japanese: '枠',
    romaji: 'Waku',
    valueDescription: 'Outer Boundary (Zero / Ground Plane)',
    fingerRule: 'Rest the soroban flat on your desk with your left hand anchoring the top-left edge.',
    description:
      'The rigid rectangular outer casing, traditionally handcrafted from dense Japanese ebony (Kokutan), rosewood (Shitan), or durable matte composite resin. Beads resting against the frame are silent and equal to zero.',
    proTip:
      'Keep your left hand holding the left side of the frame with fingers curled—this prevents the abacus from sliding during intense speed drills.',
  },
  dots: {
    id: 'dots',
    name: 'Reckoning Unit Dots',
    japanese: '定位点',
    romaji: 'Tei-iten',
    valueDescription: 'Unit & Thousands Place Indicators',
    fingerRule: 'Choose the center dot as your Units column (1s).',
    description:
      'White or ivory inlaid dots placed on the beam every 3 rods. The chosen center dot marks the unit rod (ones place). The dot to its left marks thousands, and the next marks millions—identical to commas in modern mathematics (1,000,000).',
    proTip:
      'For multiplication and division, the unit dot serves as the anchor point to distinguish whole numbers from decimal fractions.',
  },
  clearButton: {
    id: 'clearButton',
    name: 'One-Touch Quick Clear Button',
    japanese: 'ワンタッチご破算ボタン',
    romaji: 'One-Touch Gohasan Button',
    valueDescription: 'Instant Board Reset Mechanism (0)',
    fingerRule: 'Press with your index finger for instant mechanical reset.',
    description:
      'A beloved mechanical innovation seen on modern student and competition sorobans (such as Tomoe Sorobans). Pressing this button trips an internal spring-loaded lever that sweeps all beads away from the beam, instantly clearing the entire board to 0 in under 0.1 seconds.',
    proTip:
      'In Japanese, resetting the abacus is called "Gohasan ni suru" (ご破算にする), which metaphorically means "to start fresh from a clean slate" in daily Japanese conversation.',
  },
};

interface AnatomyDiagramProps {
  onSelectPart?: (part: AnatomyPartId) => void;
  selectedPart?: AnatomyPartId | null;
}

export const AnatomyDiagram: React.FC<AnatomyDiagramProps> = ({
  onSelectPart,
  selectedPart: externalSelectedPart,
}) => {
  const [internalSelected, setInternalSelected] = useState<AnatomyPartId>('upper');
  const [quizMode, setQuizMode] = useState(false);
  const [quizTarget, setQuizTarget] = useState<AnatomyPartId>('beam');
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const activePartId = externalSelectedPart || internalSelected;
  const currentPartInfo = ANATOMY_PARTS[activePartId];

  const handleSelect = (id: AnatomyPartId) => {
    sound.playClack(id === 'upper', 1.0);
    if (quizMode) {
      if (id === quizTarget) {
        sound.playSuccessChime();
        setQuizFeedback(`Correct! That is the ${ANATOMY_PARTS[id].name} (${ANATOMY_PARTS[id].japanese}). Outstanding!`);
        // Pick next quiz target
        const parts: AnatomyPartId[] = ['upper', 'lower', 'beam', 'rod', 'frame', 'dots'];
        const remaining = parts.filter((p) => p !== id);
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        setTimeout(() => {
          setQuizTarget(next);
          setQuizFeedback(null);
        }, 1800);
      } else {
        sound.playClack(true, 0.6);
        setQuizFeedback(`Not quite! You tapped ${ANATOMY_PARTS[id].name}. Try finding the ${ANATOMY_PARTS[quizTarget].name}.`);
      }
    } else {
      setInternalSelected(id);
      onSelectPart?.(id);
    }
  };

  const startQuiz = () => {
    setQuizMode(true);
    setQuizFeedback(null);
    const parts: AnatomyPartId[] = ['beam', 'upper', 'lower', 'rod', 'frame', 'dots'];
    setQuizTarget(parts[Math.floor(Math.random() * parts.length)]);
    sound.playResetSweep();
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-orange-400 bg-orange-950/70 border border-orange-800/40 px-2.5 py-0.5 rounded-full">
              Anatomy & Terminology
            </span>
            <span className="text-xs text-stone-500 font-mono">そろばんの構造</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-100 mt-1 flex items-center gap-2">
            <span>The Anatomy of the Japanese Soroban</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Tap any labeled part below to inspect its Japanese name, numerical value, and finger movement rules.
          </p>
        </div>

        {/* Quiz Mode Toggle */}
        <button
          onClick={() => {
            if (quizMode) {
              setQuizMode(false);
              setQuizFeedback(null);
            } else {
              startQuiz();
            }
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            quizMode
              ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{quizMode ? 'Exit Anatomy Quiz' : 'Interactive Anatomy Quiz'}</span>
        </button>
      </div>

      {/* Quiz Prompt if Active */}
      {quizMode && (
        <div className="bg-amber-950/40 border border-amber-600/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ?
            </div>
            <div>
              <div className="text-xs text-amber-300 uppercase tracking-widest font-semibold">
                Anatomy Challenge
              </div>
              <div className="text-sm font-black text-white">
                Tap the <span className="text-amber-400 underline decoration-amber-500 underline-offset-4 font-extrabold">{ANATOMY_PARTS[quizTarget].name} ({ANATOMY_PARTS[quizTarget].japanese})</span> on the diagram below!
              </div>
            </div>
          </div>
          {quizFeedback && (
            <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-500/40 text-amber-200">
              {quizFeedback}
            </div>
          )}
        </div>
      )}

      {/* INTERACTIVE SVG DIAGRAM MATCHING THE USER'S PHOTO */}
      <div className="relative w-full bg-[#110f0e] border border-stone-800/90 rounded-2xl p-4 sm:p-6 overflow-hidden flex flex-col items-center">
        <svg
          viewBox="0 0 920 380"
          className="w-full max-w-4xl drop-shadow-2xl select-none"
          style={{ touchAction: 'manipulation' }}
        >
          <defs>
            {/* Outer Frame gradient */}
            <linearGradient id="anatFrameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c2726" />
              <stop offset="50%" stopColor="#1a1817" />
              <stop offset="100%" stopColor="#0f0e0d" />
            </linearGradient>

            {/* Cavity gradient */}
            <linearGradient id="anatCavityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0a0909" />
              <stop offset="100%" stopColor="#141211" />
            </linearGradient>

            {/* Beam gradient */}
            <linearGradient id="anatBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3c3633" />
              <stop offset="50%" stopColor="#24201e" />
              <stop offset="100%" stopColor="#181514" />
            </linearGradient>

            {/* Bead gradient: Terracotta */}
            <linearGradient id="anatBeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f06c4b" />
              <stop offset="50%" stopColor="#e05638" />
              <stop offset="100%" stopColor="#b83b22" />
            </linearGradient>

            {/* Highlight Glow filter */}
            <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ============================================================== */}
          {/* THE PHYSICAL SOROBAN GRAPHIC */}
          {/* ============================================================== */}
          <g transform="translate(60, 120)">
            {/* Outer Frame */}
            <rect
              x="0"
              y="0"
              width="800"
              height="150"
              rx="16"
              ry="16"
              fill="url(#anatFrameGrad)"
              stroke={activePartId === 'frame' ? '#22c55e' : '#3d3633'}
              strokeWidth={activePartId === 'frame' ? 4 : 3}
              className="cursor-pointer transition-all"
              onClick={() => handleSelect('frame')}
            />

            {/* Inner Cavity */}
            <rect
              x="14"
              y="12"
              width="772"
              height="126"
              rx="8"
              ry="8"
              fill="url(#anatCavityGrad)"
              stroke="#080707"
              strokeWidth="2"
            />

            {/* 17 Rods */}
            {Array.from({ length: 17 }).map((_, i) => {
              const rodX = 36 + i * 44;
              const isTargetRod = i === 12; // Pointer to rod 12 in the diagram
              return (
                <g key={`anat-rod-${i}`}>
                  <rect
                    x={rodX - 2}
                    y="12"
                    width="4"
                    height="126"
                    fill={activePartId === 'rod' && isTargetRod ? '#22c55e' : '#574f4b'}
                    className="cursor-pointer"
                    onClick={() => handleSelect('rod')}
                  />
                  {/* Subtle rod highlight */}
                  {activePartId === 'rod' && (
                    <rect
                      x={rodX - 10}
                      y="12"
                      width="20"
                      height="126"
                      fill="rgba(34, 197, 94, 0.12)"
                    />
                  )}
                </g>
              );
            })}

            {/* Reckoning Beam */}
            <rect
              x="14"
              y="44"
              width="772"
              height="12"
              rx="2"
              ry="2"
              fill="url(#anatBeamGrad)"
              stroke={activePartId === 'beam' ? '#22c55e' : '#453e3b'}
              strokeWidth={activePartId === 'beam' ? 3 : 1}
              className="cursor-pointer transition-all"
              onClick={() => handleSelect('beam')}
            />

            {/* Reckoning Unit Dots on Beam (Every 3 rods: rods 2, 5, 8, 11, 14) */}
            {[2, 5, 8, 11, 14].map((dotRod) => {
              const dotX = 36 + dotRod * 44;
              return (
                <circle
                  key={`dot-${dotRod}`}
                  cx={dotX}
                  cy="50"
                  r="3.2"
                  fill="#ffffff"
                  stroke={activePartId === 'dots' ? '#22c55e' : '#141211'}
                  strokeWidth={activePartId === 'dots' ? 2 : 0.8}
                  className="cursor-pointer"
                  onClick={() => handleSelect('dots')}
                />
              );
            })}

            {/* One-Touch Quick Clear Button in Center Under Beam */}
            <g
              transform="translate(400, 78)"
              className="cursor-pointer group"
              onClick={() => handleSelect('clearButton')}
            >
              <circle
                cx="0"
                cy="0"
                r="10"
                fill="#2c2826"
                stroke={activePartId === 'clearButton' ? '#22c55e' : '#4a4441'}
                strokeWidth={activePartId === 'clearButton' ? 2.5 : 1.5}
              />
              <circle
                cx="0"
                cy="0"
                r="6.5"
                fill="#e6e1de"
                stroke="#171514"
                strokeWidth="1"
              />
            </g>

            {/* Upper Beads (Go-dama: 1 per rod, resting against top frame in silent 0 state) */}
            {Array.from({ length: 17 }).map((_, i) => {
              const rodX = 36 + i * 44;
              const isTargetBead = i === 5; // Pointer to bead 5 in the diagram
              return (
                <g
                  key={`anat-upper-${i}`}
                  transform={`translate(${rodX}, 24)`}
                  className="cursor-pointer"
                  onClick={() => handleSelect('upper')}
                >
                  {/* Bi-conical Diamond Bead */}
                  <polygon
                    points="-16,-9 16,-9 18,0 -18,0"
                    fill={activePartId === 'upper' && isTargetBead ? '#22c55e' : 'url(#anatBeadGrad)'}
                    stroke={activePartId === 'upper' ? '#15803d' : '#8a2411'}
                    strokeWidth="0.8"
                  />
                  <polygon
                    points="-18,0 18,0 16,9 -16,9"
                    fill={activePartId === 'upper' && isTargetBead ? '#16a34a' : '#b83b22'}
                    stroke={activePartId === 'upper' ? '#15803d' : '#8a2411'}
                    strokeWidth="0.8"
                  />
                  <line x1="-17" y1="0" x2="17" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
                </g>
              );
            })}

            {/* Lower Beads (Ji-dama: 4 per rod, resting against bottom frame in silent 0 state) */}
            {Array.from({ length: 17 }).map((_, rodIdx) => {
              const rodX = 36 + rodIdx * 44;
              const isTargetColumn = rodIdx === 9; // Pointer to lower beads in column 9
              return (
                <g
                  key={`anat-lower-col-${rodIdx}`}
                  className="cursor-pointer"
                  onClick={() => handleSelect('lower')}
                >
                  {[0, 1, 2, 3].map((beadIdx) => {
                    const beadY = 68 + beadIdx * 17.5;
                    return (
                      <g
                        key={`bead-${beadIdx}`}
                        transform={`translate(${rodX}, ${beadY})`}
                      >
                        <polygon
                          points="-16,-8 16,-8 18,0 -18,0"
                          fill={activePartId === 'lower' && isTargetColumn ? '#22c55e' : 'url(#anatBeadGrad)'}
                          stroke={activePartId === 'lower' ? '#15803d' : '#8a2411'}
                          strokeWidth="0.8"
                        />
                        <polygon
                          points="-18,0 18,0 16,8 -16,8"
                          fill={activePartId === 'lower' && isTargetColumn ? '#16a34a' : '#b83b22'}
                          stroke={activePartId === 'lower' ? '#15803d' : '#8a2411'}
                          strokeWidth="0.8"
                        />
                        <line x1="-17" y1="0" x2="17" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>

          {/* ============================================================== */}
          {/* THE EXACT GREEN ANATOMY POINTER LINES & LABELS (FROM IMAGE) */}
          {/* ============================================================== */}

          {/* 1. UPPER BEADS (Top Left Pointer) */}
          <g
            className="cursor-pointer group"
            onClick={() => handleSelect('upper')}
          >
            {/* Label Text */}
            <text
              x="280"
              y="52"
              textAnchor="middle"
              fill={activePartId === 'upper' ? '#22c55e' : '#f5f5f4'}
              fontSize="20"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              Upper Beads
            </text>
            <text
              x="280"
              y="74"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="12"
              fontWeight="600"
            >
              天珠 (Ten-dama • 5)
            </text>
            {/* Pointer line */}
            <line
              x1="280"
              y1="82"
              x2="280"
              y2="140"
              stroke="#22c55e"
              strokeWidth="2.5"
            />
            {/* Pointer End Dot */}
            <circle cx="280" cy="144" r="5" fill="#22c55e" />
          </g>

          {/* 2. ROD (Top Right Pointer) */}
          <g
            className="cursor-pointer group"
            onClick={() => handleSelect('rod')}
          >
            {/* Label Text */}
            <text
              x="620"
              y="68"
              textAnchor="middle"
              fill={activePartId === 'rod' ? '#22c55e' : '#f5f5f4'}
              fontSize="20"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              Rod
            </text>
            <text
              x="620"
              y="90"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="12"
              fontWeight="600"
            >
              桁 / 軸 (Keta / Kushi)
            </text>
            {/* Pointer line */}
            <line
              x1="620"
              y1="98"
              x2="620"
              y2="175"
              stroke="#22c55e"
              strokeWidth="2.5"
            />
            {/* Pointer End Dot */}
            <circle cx="620" cy="178" r="5" fill="#22c55e" />
          </g>

          {/* 3. BEAM (Bottom Left Pointer) */}
          <g
            className="cursor-pointer group"
            onClick={() => handleSelect('beam')}
          >
            {/* Pointer line */}
            <line
              x1="180"
              y1="315"
              x2="180"
              y2="175"
              stroke="#22c55e"
              strokeWidth="2.5"
            />
            {/* Pointer End Dot */}
            <circle cx="180" cy="172" r="5" fill="#22c55e" />
            {/* Label Text */}
            <text
              x="180"
              y="342"
              textAnchor="middle"
              fill={activePartId === 'beam' ? '#22c55e' : '#f5f5f4'}
              fontSize="20"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              Beam
            </text>
            <text
              x="180"
              y="362"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="12"
              fontWeight="600"
            >
              梁 (Hari • Reckoning Line)
            </text>
          </g>

          {/* 4. LOWER BEADS (Bottom Center Pointer) */}
          <g
            className="cursor-pointer group"
            onClick={() => handleSelect('lower')}
          >
            {/* Pointer line */}
            <line
              x1="510"
              y1="315"
              x2="510"
              y2="235"
              stroke="#22c55e"
              strokeWidth="2.5"
            />
            {/* Pointer End Dot */}
            <circle cx="510" cy="232" r="5" fill="#22c55e" />
            {/* Label Text */}
            <text
              x="510"
              y="342"
              textAnchor="middle"
              fill={activePartId === 'lower' ? '#22c55e' : '#f5f5f4'}
              fontSize="20"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              Lower Beads
            </text>
            <text
              x="510"
              y="362"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="12"
              fontWeight="600"
            >
              地珠 (Ji-dama • 1 each)
            </text>
          </g>

          {/* 5. FRAME (Bottom Right Pointer) */}
          <g
            className="cursor-pointer group"
            onClick={() => handleSelect('frame')}
          >
            {/* Pointer line */}
            <line
              x1="810"
              y1="315"
              x2="810"
              y2="260"
              stroke="#22c55e"
              strokeWidth="2.5"
            />
            {/* Pointer End Dot */}
            <circle cx="810" cy="256" r="5" fill="#22c55e" />
            {/* Label Text */}
            <text
              x="810"
              y="342"
              textAnchor="middle"
              fill={activePartId === 'frame' ? '#22c55e' : '#f5f5f4'}
              fontSize="20"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              Frame
            </text>
            <text
              x="810"
              y="362"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="12"
              fontWeight="600"
            >
              枠 (Waku • Ebony Casing)
            </text>
          </g>
        </svg>
      </div>

      {/* QUICK PART SWITCH BUTTONS */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(Object.keys(ANATOMY_PARTS) as AnatomyPartId[]).map((key) => {
          const item = ANATOMY_PARTS[key];
          const isSelected = activePartId === key;
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                  : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
              }`}
            >
              <span>{item.name}</span>
              <span className="opacity-75 font-normal">({item.japanese})</span>
            </button>
          );
        })}
      </div>

      {/* DETAILED INSPECTION CARD FOR SELECTED PART */}
      <div className="bg-stone-950/80 border border-emerald-900/40 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-black text-lg">
              {currentPartInfo.japanese}
            </div>
            <div>
              <div className="text-lg font-black text-white flex items-center gap-2">
                <span>{currentPartInfo.name}</span>
                <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                  {currentPartInfo.romaji}
                </span>
              </div>
              <div className="text-xs text-stone-400">
                {currentPartInfo.valueDescription}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full font-bold">
            <CheckCircle className="w-3.5 h-3.5" /> Traditional Standard
          </div>
        </div>

        {/* Content & Rules */}
        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
          {currentPartInfo.description}
        </p>

        {/* Sacred Finger Discipline Rule */}
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3.5 flex items-start gap-3">
          <Fingerprint className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-400 font-bold block mb-0.5">
              Finger Movement Discipline:
            </strong>
            {currentPartInfo.fingerRule}
          </div>
        </div>

        {/* Sensei Pro Tip */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div className="text-xs text-stone-300 leading-relaxed">
            <strong className="text-orange-400 font-bold block mb-0.5">
              Sensei's Dojo Tip:
            </strong>
            {currentPartInfo.proTip}
          </div>
        </div>
      </div>
    </div>
  );
};
