import type { AbacusState, RodValue } from '../types';

export const DEFAULT_ROD_COUNT = 9;

// Create an empty abacus with all beads at zero
export function createEmptyAbacus(rodCount: number = DEFAULT_ROD_COUNT): AbacusState {
  return Array.from({ length: rodCount }, () => ({
    upper: false,
    lower: 0,
  }));
}

// Calculate the single digit value (0-9) of a rod
export function getRodDigit(rod: RodValue): number {
  return (rod.upper ? 5 : 0) + rod.lower;
}

// Calculate total numeric value of the abacus
export function abacusToNumber(state: AbacusState): number {
  let total = 0;
  for (let i = 0; i < state.length; i++) {
    const digit = getRodDigit(state[i]);
    const power = state.length - 1 - i;
    total += digit * Math.pow(10, power);
  }
  return total;
}

// Convert a non-negative integer into AbacusState
export function numberToAbacus(num: number, rodCount: number = DEFAULT_ROD_COUNT): AbacusState {
  const state = createEmptyAbacus(rodCount);
  const str = Math.max(0, Math.floor(num)).toString();
  
  if (str.length > rodCount) {
    // If number exceeds rod count, take rightmost digits
    const trimmed = str.slice(-rodCount);
    for (let i = 0; i < rodCount; i++) {
      const digit = parseInt(trimmed[i], 10);
      state[i] = {
        upper: digit >= 5,
        lower: digit % 5,
      };
    }
    return state;
  }

  // Right-align number on the abacus
  const offset = rodCount - str.length;
  for (let i = 0; i < str.length; i++) {
    const digit = parseInt(str[i], 10);
    state[offset + i] = {
      upper: digit >= 5,
      lower: digit % 5,
    };
  }

  return state;
}

// Format numbers with commas (e.g. 1,234,567)
export function formatWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

// Get place value label for rod index (from right to left: 1, 10, 100, 1K, 10K, 100K, 1M, etc.)
export function getPlaceValueLabel(rodIndex: number, totalRods: number): string {
  const power = totalRods - 1 - rodIndex;
  if (power === 0) return '1';
  if (power === 1) return '10';
  if (power === 2) return '100';
  if (power === 3) return '1K';
  if (power === 4) return '10K';
  if (power === 5) return '100K';
  if (power === 6) return '1M';
  if (power === 7) return '10M';
  if (power === 8) return '100M';
  if (power === 9) return '1B';
  return `10^${power}`;
}

// Traditional Japanese Reckoning Unit dots are usually located at unit positions (power % 3 === 0)
// e.g., ones (10^0), thousands (10^3), millions (10^6), billions (10^9)
export function isReckoningDotPosition(rodIndex: number, totalRods: number): boolean {
  const power = totalRods - 1 - rodIndex;
  return power % 3 === 0;
}

// Group index for 3-column alternating color requirement
// Group 0: ones, tens, hundreds (power 0, 1, 2)
// Group 1: thousands, 10k, 100k (power 3, 4, 5)
// Group 2: millions... (power 6, 7, 8)
export function getRodGroup3Index(rodIndex: number, totalRods: number): number {
  const power = totalRods - 1 - rodIndex;
  return Math.floor(power / 3);
}
