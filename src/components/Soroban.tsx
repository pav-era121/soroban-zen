import React, { useRef, useState } from 'react';
import type { AbacusState, ColorGroupingMode } from '../types';
import { sound } from '../audio/soundEffects';
import {
  getPlaceValueLabel,
  isReckoningDotPosition,
  getRodGroup3Index,
  getRodDigit,
} from '../utils/sorobanUtils';

interface SorobanProps {
  state: AbacusState;
  onChange: (newState: AbacusState) => void;
  colorGrouping?: ColorGroupingMode;
  readOnly?: boolean;
  ghostMode?: boolean;
  showPlaceLabels?: boolean;
  showRodValues?: boolean;
  highlightRodIndex?: number;
  landscapeMode?: boolean;
  showFingerGuide?: boolean;
  showAnatomyOverlay?: boolean;
  showQuickClearButton?: boolean;
  onQuickClear?: () => void;
}

interface PointerDragState {
  pointerId: number;
  startX: number;
  startY: number;
  rodIndex: number;
  beadKind: 'upper' | 'lower';
  beadIndex: number; // 0 for upper; 0-3 for lower
  hasTriggeredSlide: boolean;
}

export const Soroban: React.FC<SorobanProps> = ({
  state,
  onChange,
  colorGrouping = 'alternating3',
  readOnly = false,
  ghostMode = false,
  showPlaceLabels = true,
  showRodValues = true,
  highlightRodIndex,
  landscapeMode = false,
  showFingerGuide = false,
  showAnatomyOverlay = false,
  showQuickClearButton = true,
  onQuickClear,
}) => {
  const totalRods = state.length;
  const dragStateRef = useRef<PointerDragState | null>(null);
  const [activeRodHighlight, setActiveRodHighlight] = useState<number | null>(null);

  // Toggle or slide upper bead (5)
  const setUpperBead = (rodIndex: number, newUpper: boolean) => {
    if (readOnly) return;
    const currentState = [...state];
    currentState[rodIndex] = {
      ...currentState[rodIndex],
      upper: newUpper,
    };
    sound.playClack(true, 0.95 + (totalRods - rodIndex) * 0.03);
    onChange(currentState);
  };

  // Toggle or slide lower beads (1-4)
  const setLowerBeads = (rodIndex: number, newLower: number) => {
    if (readOnly) return;
    const currentState = [...state];
    currentState[rodIndex] = {
      ...currentState[rodIndex],
      lower: newLower,
    };
    sound.playClack(false, 0.9 + (totalRods - rodIndex) * 0.03 + newLower * 0.02);
    onChange(currentState);
  };

  // POINTER DOWN: Start drag/slide or prepare for tap
  const handlePointerDown = (
    e: React.PointerEvent<SVGGElement>,
    rodIndex: number,
    beadKind: 'upper' | 'lower',
    beadIndex: number
  ) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      rodIndex,
      beadKind,
      beadIndex,
      hasTriggeredSlide: false,
    };
    setActiveRodHighlight(rodIndex);
  };

  // POINTER MOVE: True gesture sliding physics!
  // Thumb slides lower beads UP; Middle/Index finger slides lower beads DOWN; Upper slides UP & DOWN.
  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId || drag.hasTriggeredSlide) return;

    const deltaY = e.clientY - drag.startY;
    const threshold = 12; // pixels of movement required to detect intentional slide

    if (drag.beadKind === 'upper') {
      const isCurrentlyDown = state[drag.rodIndex].upper;
      // If bead is UP (inactive), sliding DOWN pulls it against the beam
      if (!isCurrentlyDown && deltaY > threshold) {
        drag.hasTriggeredSlide = true;
        setUpperBead(drag.rodIndex, true);
      }
      // If bead is DOWN (active), sliding UP pushes it away to the frame
      else if (isCurrentlyDown && deltaY < -threshold) {
        drag.hasTriggeredSlide = true;
        setUpperBead(drag.rodIndex, false);
      }
    } else {
      // Lower beads: beadIndex is 0 to 3 (0 is nearest beam, 3 nearest bottom)
      const currentActive = state[drag.rodIndex].lower;
      const isCurrentlyActive = drag.beadIndex < currentActive;

      // Inactive lower bead: sliding UP (thumb motion) raises it and all beads above it to the beam!
      if (!isCurrentlyActive && deltaY < -threshold) {
        drag.hasTriggeredSlide = true;
        setLowerBeads(drag.rodIndex, drag.beadIndex + 1);
      }
      // Active lower bead: sliding DOWN (index/middle finger motion) drops it and beads below it away!
      else if (isCurrentlyActive && deltaY > threshold) {
        drag.hasTriggeredSlide = true;
        setLowerBeads(drag.rodIndex, drag.beadIndex);
      }
    }
  };

  // POINTER UP: If movement was less than threshold, treat as a quick tap
  const handlePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (!drag.hasTriggeredSlide) {
      // Quick tap fallback
      if (drag.beadKind === 'upper') {
        const currentUpper = state[drag.rodIndex].upper;
        setUpperBead(drag.rodIndex, !currentUpper);
      } else {
        const currentLower = state[drag.rodIndex].lower;
        const newLower = drag.beadIndex < currentLower ? drag.beadIndex : drag.beadIndex + 1;
        setLowerBeads(drag.rodIndex, newLower);
      }
    }

    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    dragStateRef.current = null;
    setActiveRodHighlight(null);
  };

  const handlePointerCancel = () => {
    dragStateRef.current = null;
    setActiveRodHighlight(null);
  };

  // Determine bead colors
  const getBeadColors = (rodIndex: number) => {
    if (colorGrouping === 'uniform' || ghostMode) {
      return {
        top: '#f06c4b',
        mid: '#e05638',
        bot: '#b83b22',
        stroke: '#8a2411',
      };
    }

    // 3-Column Alternating Grouping (Thousands & Millions aid)
    const group = getRodGroup3Index(rodIndex, totalRods);
    if (group % 2 === 0) {
      return {
        top: '#f06c4b',
        mid: '#e05638',
        bot: '#b83b22',
        stroke: '#8a2411',
      };
    } else {
      return {
        top: '#f59e42',
        mid: '#e08328',
        bot: '#ad5c10',
        stroke: '#7e3e06',
      };
    }
  };

  // Dimensions
  const rodWidth = landscapeMode ? 52 : 44;
  const paddingX = landscapeMode ? 28 : 24;
  const totalWidth = paddingX * 2 + totalRods * rodWidth;
  const upperDeckHeight = 72;
  const beamHeight = 14;
  const lowerDeckHeight = 164;

  const topExtra = showAnatomyOverlay ? 52 : 0;
  const bottomExtra = showAnatomyOverlay ? 60 : 0;
  const totalHeight = 44 + upperDeckHeight + beamHeight + lowerDeckHeight + 36 + topExtra + bottomExtra;

  const frameY = 32 + topExtra;
  const frameHeight = upperDeckHeight + beamHeight + lowerDeckHeight;
  const beamY = frameY + upperDeckHeight;
  const centerX = paddingX + (totalRods * rodWidth) / 2;

  const beadW = landscapeMode ? 44 : 38;
  const beadH = 22;

  return (
    <div
      className={`soroban-container select-none w-full flex flex-col items-center ${
        landscapeMode ? 'max-w-6xl' : 'max-w-4xl'
      }`}
      style={{
        touchAction: 'none', // PREVENTS MOBILE PAGE SCROLLING WHEN SLIDING BEADS!
      }}
    >
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="soroban-svg w-full drop-shadow-2xl"
        style={{
          touchAction: 'none', // PREVENT DRAG-TO-SCROLL ON ALL BROWSERS
          filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.45))',
        }}
      >
        <defs>
          {/* Outer Frame Gradient - Authentic Sleek Ebony / Dark Rosewood */}
          <linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2b2625" />
            <stop offset="50%" stopColor="#1e1b1a" />
            <stop offset="100%" stopColor="#141212" />
          </linearGradient>

          {/* Inner Cavity Recess Shadow */}
          <linearGradient id="cavityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#121010" />
            <stop offset="100%" stopColor="#1d1918" />
          </linearGradient>

          {/* Separation Beam Gradient */}
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a3432" />
            <stop offset="50%" stopColor="#24201f" />
            <stop offset="100%" stopColor="#171413" />
          </linearGradient>

          {/* Metal/Bamboo Rod Gradient */}
          <linearGradient id="rodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a1817" />
            <stop offset="45%" stopColor="#4a4442" />
            <stop offset="65%" stopColor="#665e5b" />
            <stop offset="100%" stopColor="#1f1c1b" />
          </linearGradient>
        </defs>

        {/* 1. OUTER WOODEN / EBONY FRAME */}
        <rect
          x={paddingX - 16}
          y={frameY - 12}
          width={totalRods * rodWidth + 32}
          height={frameHeight + 24}
          rx={14}
          ry={14}
          fill="url(#frameGradient)"
          stroke="#3d3633"
          strokeWidth={3}
        />

        {/* 2. INNER CAVITY */}
        <rect
          x={paddingX - 4}
          y={frameY - 2}
          width={totalRods * rodWidth + 8}
          height={frameHeight + 4}
          rx={6}
          ry={6}
          fill="url(#cavityGradient)"
          stroke="#0d0b0b"
          strokeWidth={2}
        />

        {/* 3. VERTICAL RODS */}
        {state.map((_, i) => {
          const rodX = paddingX + i * rodWidth + rodWidth / 2;
          const isHighlighted = highlightRodIndex === i || activeRodHighlight === i;

          return (
            <g key={`rod-${i}`}>
              {/* Highlight halo if this rod is targeted */}
              {isHighlighted && (
                <rect
                  x={rodX - rodWidth / 2 + 2}
                  y={frameY}
                  width={rodWidth - 4}
                  height={frameHeight}
                  fill="rgba(240, 108, 75, 0.16)"
                  rx={4}
                  className="animate-pulse"
                />
              )}
              {/* Metal/Bamboo Rod */}
              <rect
                x={rodX - 2.5}
                y={frameY}
                width={5}
                height={frameHeight}
                fill="url(#rodGradient)"
                rx={2}
              />
            </g>
          );
        })}

        {/* 4. BEADS (UPPER & LOWER) WITH TRUE SLIDE / FLICK GESTURES */}
        {state.map((rod, i) => {
          const rodX = paddingX + i * rodWidth + rodWidth / 2;
          const colors = getBeadColors(i);
          const activeLowerCount = rod.lower;

          // Upper bead position
          const upperY = rod.upper ? beamY - beadH - 2 : frameY + 4;

          return (
            <g key={`rod-beads-${i}`}>
              {/* UPPER BEAD (Value 5) - Slide UP/DOWN with index or middle finger */}
              <g
                className="bead-group cursor-grab active:cursor-grabbing transition-transform duration-150 ease-out"
                onPointerDown={(e) => handlePointerDown(e, i, 'upper', 0)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                style={{
                  transform: `translate(${rodX}px, ${upperY}px)`,
                  opacity: ghostMode ? (rod.upper ? 0.8 : 0.2) : 1,
                  touchAction: 'none',
                }}
              >
                <BiConicalBead
                  w={beadW}
                  h={beadH}
                  colors={colors}
                  isActive={rod.upper}
                />
              </g>

              {/* LOWER BEADS (Value 1 each, 4 beads total: index 0 to 3) */}
              {[0, 1, 2, 3].map((beadIdx) => {
                const isActive = beadIdx < activeLowerCount;
                let beadY: number;
                if (isActive) {
                  beadY = beamY + beamHeight + 2 + beadIdx * (beadH + 1);
                } else {
                  const inactiveOffset = 3 - beadIdx;
                  beadY = frameY + frameHeight - beadH - 4 - inactiveOffset * (beadH + 1);
                }

                return (
                  <g
                    key={`lower-${i}-${beadIdx}`}
                    className="bead-group cursor-grab active:cursor-grabbing transition-transform duration-150 ease-out"
                    onPointerDown={(e) => handlePointerDown(e, i, 'lower', beadIdx)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    style={{
                      transform: `translate(${rodX}px, ${beadY}px)`,
                      opacity: ghostMode ? (isActive ? 0.8 : 0.2) : 1,
                      touchAction: 'none',
                    }}
                  >
                    <BiConicalBead
                      w={beadW}
                      h={beadH}
                      colors={colors}
                      isActive={isActive}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* 5. HORIZONTAL RECKONING BEAM */}
        <rect
          x={paddingX - 10}
          y={beamY}
          width={totalRods * rodWidth + 20}
          height={beamHeight}
          rx={2}
          fill="url(#beamGradient)"
          stroke="#47403d"
          strokeWidth={1}
        />
        <line
          x1={paddingX - 10}
          y1={beamY + 1}
          x2={paddingX - 10 + totalRods * rodWidth + 20}
          y2={beamY + 1}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={1}
        />

        {/* 6. TRADITIONAL RECKONING UNIT DOTS ON THE BEAM */}
        {state.map((_, i) => {
          if (!isReckoningDotPosition(i, totalRods)) return null;
          const dotX = paddingX + i * rodWidth + rodWidth / 2;
          const dotY = beamY + beamHeight / 2;
          return (
            <g key={`reckoning-dot-${i}`}>
              <circle
                cx={dotX}
                cy={dotY}
                r={3.2}
                fill="#ffffff"
                stroke="#171413"
                strokeWidth={0.8}
                filter="drop-shadow(0 1px 1px rgba(0,0,0,0.6))"
              />
            </g>
          );
        })}

        {/* 7. PLACE VALUE LABELS & DIGIT READOUT */}
        {state.map((rod, i) => {
          const rodX = paddingX + i * rodWidth + rodWidth / 2;
          const digit = getRodDigit(rod);
          const label = getPlaceValueLabel(i, totalRods);
          const isHighlighted = highlightRodIndex === i;

          return (
            <g key={`labels-${i}`}>
              {showPlaceLabels && (
                <text
                  x={rodX}
                  y={frameY - 18}
                  textAnchor="middle"
                  fill={isHighlighted ? '#e05638' : '#8c827d'}
                  fontSize={landscapeMode ? 12 : 11}
                  fontWeight={isHighlighted ? '700' : '500'}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {label}
                </text>
              )}

              {showRodValues && !ghostMode && (
                <text
                  x={rodX}
                  y={frameY + frameHeight + 24}
                  textAnchor="middle"
                  fill={digit > 0 ? '#f06c4b' : '#6b6360'}
                  fontSize={landscapeMode ? 16 : 15}
                  fontWeight={digit > 0 ? '700' : '500'}
                  fontFamily="'SF Pro Display', system-ui, sans-serif"
                >
                  {digit}
                </text>
              )}
            </g>
          );
        })}

        {/* 8. ONE-TOUCH QUICK RESET BUTTON (ワンタッチご破算) */}
        {showQuickClearButton && !readOnly && (
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              sound.playResetSweep();
              if (onQuickClear) {
                onQuickClear();
              } else {
                onChange(state.map(() => ({ upper: false, lower: 0 })));
              }
            }}
            style={{ touchAction: 'manipulation' }}
          >
            {/* Button Bezel Mount */}
            <circle
              cx={centerX}
              cy={beamY + beamHeight + 16}
              r={9.5}
              fill="#221e1d"
              stroke="#453d39"
              strokeWidth={1.5}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
            />
            {/* Ivory / White Button Core */}
            <circle
              cx={centerX}
              cy={beamY + beamHeight + 16}
              r={6}
              fill="#f5efe6"
              stroke="#8a7e75"
              strokeWidth={0.8}
              className="transition-transform group-hover:scale-110 group-active:scale-90"
            />
            <title>ワンタッチご破算 (One-Touch Quick Clear)</title>
          </g>
        )}

        {/* 9. ANATOMY OVERLAY (MATCHING TRADITIONAL DIAGRAM) */}
        {showAnatomyOverlay && (
          <g className="anatomy-overlay pointer-events-none select-none">
            {/* Upper Beads Pointer */}
            {(() => {
              const uRod = Math.min(totalRods - 1, Math.max(1, Math.floor(totalRods * 0.28)));
              const uX = paddingX + uRod * rodWidth + rodWidth / 2;
              const uY = frameY + 22;
              const labelY = frameY - 24;
              return (
                <g>
                  <text
                    x={uX}
                    y={labelY - 14}
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize={13}
                    fontWeight="800"
                    fontFamily="system-ui, sans-serif"
                  >
                    Upper Beads
                  </text>
                  <text
                    x={uX}
                    y={labelY - 1}
                    textAnchor="middle"
                    fill="#86efac"
                    fontSize={9}
                    fontWeight="600"
                  >
                    天珠 (5)
                  </text>
                  <line
                    x1={uX}
                    y1={labelY + 4}
                    x2={uX}
                    y2={uY - 12}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <circle cx={uX} cy={uY} r={4.5} fill="#22c55e" />
                </g>
              );
            })()}

            {/* Rod Pointer */}
            {(() => {
              const rRod = Math.min(totalRods - 1, Math.max(1, Math.floor(totalRods * 0.72)));
              const rX = paddingX + rRod * rodWidth + rodWidth / 2;
              const rY = frameY + 42;
              const labelY = frameY - 24;
              return (
                <g>
                  <text
                    x={rX}
                    y={labelY - 14}
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize={13}
                    fontWeight="800"
                    fontFamily="system-ui, sans-serif"
                  >
                    Rod
                  </text>
                  <text
                    x={rX}
                    y={labelY - 1}
                    textAnchor="middle"
                    fill="#86efac"
                    fontSize={9}
                    fontWeight="600"
                  >
                    桁 / 軸
                  </text>
                  <line
                    x1={rX}
                    y1={labelY + 4}
                    x2={rX}
                    y2={rY - 6}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <circle cx={rX} cy={rY} r={4.5} fill="#22c55e" />
                </g>
              );
            })()}

            {/* Beam Pointer */}
            {(() => {
              const bX = paddingX + 24;
              const bY = beamY + beamHeight / 2;
              const labelY = frameY + frameHeight + 38;
              return (
                <g>
                  <line
                    x1={bX}
                    y1={labelY - 14}
                    x2={bX}
                    y2={bY + 8}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <circle cx={bX} cy={bY} r={4.5} fill="#22c55e" />
                  <text
                    x={bX}
                    y={labelY}
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize={13}
                    fontWeight="800"
                    fontFamily="system-ui, sans-serif"
                  >
                    Beam
                  </text>
                  <text
                    x={bX}
                    y={labelY + 12}
                    textAnchor="middle"
                    fill="#86efac"
                    fontSize={9}
                    fontWeight="600"
                  >
                    梁 (Hari)
                  </text>
                </g>
              );
            })()}

            {/* Lower Beads Pointer */}
            {(() => {
              const lRod = Math.min(totalRods - 1, Math.max(1, Math.floor(totalRods * 0.54)));
              const lX = paddingX + lRod * rodWidth + rodWidth / 2;
              const lY = frameY + frameHeight - 38;
              const labelY = frameY + frameHeight + 38;
              return (
                <g>
                  <line
                    x1={lX}
                    y1={labelY - 14}
                    x2={lX}
                    y2={lY + 12}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <circle cx={lX} cy={lY} r={4.5} fill="#22c55e" />
                  <text
                    x={lX}
                    y={labelY}
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize={13}
                    fontWeight="800"
                    fontFamily="system-ui, sans-serif"
                  >
                    Lower Beads
                  </text>
                  <text
                    x={lX}
                    y={labelY + 12}
                    textAnchor="middle"
                    fill="#86efac"
                    fontSize={9}
                    fontWeight="600"
                  >
                    地珠 (1 each)
                  </text>
                </g>
              );
            })()}

            {/* Frame Pointer */}
            {(() => {
              const fX = paddingX + totalRods * rodWidth + 4;
              const fY = frameY + frameHeight - 6;
              const labelY = frameY + frameHeight + 38;
              return (
                <g>
                  <line
                    x1={fX}
                    y1={labelY - 14}
                    x2={fX}
                    y2={fY + 6}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <circle cx={fX} cy={fY} r={4.5} fill="#22c55e" />
                  <text
                    x={fX}
                    y={labelY}
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize={13}
                    fontWeight="800"
                    fontFamily="system-ui, sans-serif"
                  >
                    Frame
                  </text>
                  <text
                    x={fX}
                    y={labelY + 12}
                    textAnchor="middle"
                    fill="#86efac"
                    fontSize={9}
                    fontWeight="600"
                  >
                    枠 (Waku)
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {/* 10. FINGER TECHNIQUE VISUAL GUIDES (IF ENABLED) */}
        {showFingerGuide && (
          <g>
            {/* Guide on rightmost rod */}
            <text
              x={paddingX + (totalRods - 1) * rodWidth + rodWidth / 2 + 22}
              y={frameY + 28}
              fill="#d97736"
              fontSize={10}
              fontWeight="bold"
            >
              👆 Middle/Index: 5 UP & DOWN
            </text>
            <text
              x={paddingX + (totalRods - 1) * rodWidth + rodWidth / 2 + 22}
              y={frameY + frameHeight - 35}
              fill="#e05638"
              fontSize={10}
              fontWeight="bold"
            >
              👍 Thumb: Earth UP / 👆 Down
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// Bi-conical diamond bead component
const BiConicalBead: React.FC<{
  w: number;
  h: number;
  colors: { top: string; mid: string; bot: string; stroke: string };
  isActive: boolean;
}> = ({ w, h, colors, isActive }) => {
  const halfW = w / 2;
  const halfH = h / 2;
  const ridgeY = 0;
  const topRimW = 7;
  const botRimW = 7;

  return (
    <g>
      {/* Upper Slope Facet */}
      <polygon
        points={`
          -${topRimW},-${halfH} 
          ${topRimW},-${halfH} 
          ${halfW},${ridgeY} 
          -${halfW},${ridgeY}
        `}
        fill={colors.top}
        stroke={colors.stroke}
        strokeWidth={0.7}
      />

      {/* Lower Slope Facet */}
      <polygon
        points={`
          -${halfW},${ridgeY} 
          ${halfW},${ridgeY} 
          ${botRimW},${halfH} 
          -${botRimW},${halfH}
        `}
        fill={colors.bot}
        stroke={colors.stroke}
        strokeWidth={0.7}
      />

      {/* Middle Sharp Ridge Line */}
      <line
        x1={-halfW + 1}
        y1={ridgeY}
        x2={halfW - 1}
        y2={ridgeY}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={0.8}
      />

      {/* Active Subtle Glow */}
      {isActive && (
        <circle
          cx={0}
          cy={0}
          r={2}
          fill="rgba(255,255,255,0.7)"
        />
      )}
    </g>
  );
};
