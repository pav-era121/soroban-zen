import React from 'react';
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
}) => {
  const totalRods = state.length;

  // Handle clicking the upper bead (value 5)
  const handleUpperBeadClick = (rodIndex: number) => {
    if (readOnly) return;
    const currentState = [...state];
    const newUpper = !currentState[rodIndex].upper;
    currentState[rodIndex] = {
      ...currentState[rodIndex],
      upper: newUpper,
    };
    sound.playClack(true, 0.95 + (totalRods - rodIndex) * 0.03);
    onChange(currentState);
  };

  // Handle clicking a lower bead (0-indexed from top near beam: 0 is highest lower bead, 3 is lowest)
  const handleLowerBeadClick = (rodIndex: number, beadIndex: number) => {
    if (readOnly) return;
    const currentState = [...state];
    const currentActiveLower = currentState[rodIndex].lower; // 0 to 4
    
    // beadIndex is 0 to 3. If beadIndex < currentActiveLower, that bead is currently active (UP).
    // Clicking an active bead sets active lower beads to beadIndex (moving this and below down).
    // Clicking an inactive bead sets active lower beads to beadIndex + 1 (moving this and above up).
    let newLower = currentActiveLower;
    if (beadIndex < currentActiveLower) {
      newLower = beadIndex;
    } else {
      newLower = beadIndex + 1;
    }

    currentState[rodIndex] = {
      ...currentState[rodIndex],
      lower: newLower,
    };
    sound.playClack(false, 0.9 + (totalRods - rodIndex) * 0.03 + newLower * 0.02);
    onChange(currentState);
  };

  // Determine bead color palette
  const getBeadColors = (rodIndex: number) => {
    if (colorGrouping === 'uniform' || ghostMode) {
      // Classic Terracotta (matches uploaded image)
      return {
        top: '#f06c4b',
        mid: '#e05638',
        bot: '#b83b22',
        stroke: '#8a2411',
      };
    }

    // 3-Column Alternating Grouping
    const group = getRodGroup3Index(rodIndex, totalRods);
    if (group % 2 === 0) {
      // Group A (Ones, Tens, Hundreds & Millions...): Warm Terracotta / Cinnabar
      return {
        top: '#f06c4b',
        mid: '#e05638',
        bot: '#b83b22',
        stroke: '#8a2411',
      };
    } else {
      // Group B (Thousands, Ten-Thousands, 100K...): Warm Golden Bamboo / Amber Ochre
      return {
        top: '#f59e42',
        mid: '#e08328',
        bot: '#ad5c10',
        stroke: '#7e3e06',
      };
    }
  };

  // Dimensions for responsive SVG layout
  const rodWidth = 44;
  const paddingX = 24;
  const totalWidth = paddingX * 2 + totalRods * rodWidth;
  const upperDeckHeight = 72;
  const beamHeight = 14;
  const lowerDeckHeight = 164;
  const totalHeight = 44 + upperDeckHeight + beamHeight + lowerDeckHeight + 36;

  const frameY = 32;
  const frameHeight = upperDeckHeight + beamHeight + lowerDeckHeight;
  const beamY = frameY + upperDeckHeight;

  // Bead dimensions (Bi-conical diamond profile)
  const beadW = 38;
  const beadH = 22;

  return (
    <div className="soroban-container select-none w-full flex flex-col items-center">
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="soroban-svg w-full max-w-4xl drop-shadow-2xl"
        style={{
          filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.35))',
          touchAction: 'manipulation',
        }}
      >
        <defs>
          {/* Outer Frame Gradient - Sleek Ebony / Dark Rosewood */}
          <linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2b2625" />
            <stop offset="50%" stopColor="#1e1b1a" />
            <stop offset="100%" stopColor="#141212" />
          </linearGradient>

          {/* Inner Cavity Shadow */}
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

          {/* Metal Rod Gradient */}
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

        {/* 2. INNER CAVITY (Dark recess where beads slide) */}
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
          const isHighlighted = highlightRodIndex === i;
          return (
            <g key={`rod-${i}`}>
              {/* Highlight halo if this rod is targeted in a lesson */}
              {isHighlighted && (
                <rect
                  x={rodX - rodWidth / 2 + 2}
                  y={frameY}
                  width={rodWidth - 4}
                  height={frameHeight}
                  fill="rgba(240, 108, 75, 0.15)"
                  rx={4}
                  className="animate-pulse"
                />
              )}
              {/* Metal/Bamboo rod */}
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

        {/* 4. BEADS (UPPER & LOWER) */}
        {state.map((rod, i) => {
          const rodX = paddingX + i * rodWidth + rodWidth / 2;
          const colors = getBeadColors(i);
          const activeLowerCount = rod.lower;

          // Upper bead position
          // If NOT active (upper === false): pushed UP against top frame (y = frameY + 3)
          // If ACTIVE (upper === true): pushed DOWN against beam (y = beamY - beadH - 2)
          const upperY = rod.upper ? beamY - beadH - 2 : frameY + 4;

          return (
            <g key={`rod-beads-${i}`}>
              {/* UPPER BEAD (Value 5) */}
              <g
                className="bead-group cursor-pointer transition-all duration-150 ease-out"
                onClick={() => handleUpperBeadClick(i)}
                style={{
                  transform: `translate(${rodX}px, ${upperY}px)`,
                  opacity: ghostMode ? (rod.upper ? 0.8 : 0.2) : 1,
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
                // If ACTIVE (pushed UP against beam):
                // beadIdx 0 touches beam: beamY + beamHeight + 2
                // beadIdx 1 touches bead 0: beamY + beamHeight + 2 + beadH
                // ...
                // If INACTIVE (pushed DOWN against bottom frame):
                // beadIdx 3 sits at bottom: (frameY + frameHeight) - beadH - 4
                // beadIdx 2 sits above 3: (frameY + frameHeight) - beadH * 2 - 4
                let beadY: number;
                if (isActive) {
                  beadY = beamY + beamHeight + 2 + beadIdx * (beadH + 1);
                } else {
                  // Inactive bead offset from bottom
                  const inactiveOffset = 3 - beadIdx;
                  beadY = frameY + frameHeight - beadH - 4 - inactiveOffset * (beadH + 1);
                }

                return (
                  <g
                    key={`lower-${i}-${beadIdx}`}
                    className="bead-group cursor-pointer transition-all duration-150 ease-out"
                    onClick={() => handleLowerBeadClick(i, beadIdx)}
                    style={{
                      transform: `translate(${rodX}px, ${beadY}px)`,
                      opacity: ghostMode ? (isActive ? 0.8 : 0.2) : 1,
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

        {/* 5. HORIZONTAL RECKONING BEAM (BEAM BAR) */}
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
        {/* Subtle highlight line on top edge of beam */}
        <line
          x1={paddingX - 10}
          y1={beamY + 1}
          x2={paddingX - 10 + totalRods * rodWidth + 20}
          y2={beamY + 1}
          stroke="rgba(255,255,255,0.18)"
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

        {/* 7. PLACE VALUE LABELS & DIGIT READOUT (ABOVE & BELOW) */}
        {state.map((rod, i) => {
          const rodX = paddingX + i * rodWidth + rodWidth / 2;
          const digit = getRodDigit(rod);
          const label = getPlaceValueLabel(i, totalRods);
          const isHighlighted = highlightRodIndex === i;

          return (
            <g key={`labels-${i}`}>
              {/* Place Value Header (Top: 1, 10, 100, 1K...) */}
              {showPlaceLabels && (
                <text
                  x={rodX}
                  y={frameY - 18}
                  textAnchor="middle"
                  fill={isHighlighted ? '#e05638' : '#8c827d'}
                  fontSize={11}
                  fontWeight={isHighlighted ? '700' : '500'}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {label}
                </text>
              )}

              {/* Single Rod Digit Value Readout (Bottom: 0 to 9) */}
              {showRodValues && !ghostMode && (
                <text
                  x={rodX}
                  y={frameY + frameHeight + 24}
                  textAnchor="middle"
                  fill={digit > 0 ? '#f06c4b' : '#6b6360'}
                  fontSize={15}
                  fontWeight={digit > 0 ? '700' : '500'}
                  fontFamily="'SF Pro Display', system-ui, sans-serif"
                >
                  {digit}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// True Japanese Soroban Bi-Conical (Diamond) Bead Component
const BiConicalBead: React.FC<{
  w: number;
  h: number;
  colors: { top: string; mid: string; bot: string; stroke: string };
  isActive: boolean;
}> = ({ w, h, colors, isActive }) => {
  const halfW = w / 2;
  const halfH = h / 2;
  const ridgeY = 0; // middle sharp ridge

  // Diamond / Bi-conical polygon vertices centered at (0,0)
  // Top point (flat small rim): (-6, -halfH) to (6, -halfH)
  // Rightmost sharp ridge: (halfW, ridgeY)
  // Bottom point (flat small rim): (6, halfH) to (-6, halfH)
  // Leftmost sharp ridge: (-halfW, ridgeY)
  const topRimW = 7;
  const botRimW = 7;

  return (
    <g>
      {/* Upper Slope Facet (Reflects light) */}
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

      {/* Lower Slope Facet (In shadow) */}
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
          fill="rgba(255,255,255,0.6)"
        />
      )}
    </g>
  );
};
