/**
 * Design tokens shared by both color schemes. `accent` is Circle's brand
 * blue; `gradientPalette` is the fixed set of avatar/group/image-block
 * gradients, picked deterministically per entity via `paletteIndexForKey`.
 */
import { paletteIndexForKey } from '../core/text';

export type ThemeMode = 'light' | 'dark';

export const accent = '#2563EB';

export const gradientPalette: ReadonlyArray<readonly [string, string]> = [
  ['#2563EB', '#7C3AED'],
  ['#0EA5E9', '#22C55E'],
  ['#F97316', '#DB2777'],
  ['#8B5CF6', '#EC4899'],
  ['#059669', '#0EA5E9'],
  ['#DC2626', '#F59E0B'],
  ['#0891B2', '#4F46E5'],
  ['#D946EF', '#6366F1'],
] as const;

const FALLBACK_GRADIENT: readonly [string, string] = ['#2563EB', '#7C3AED'];

/** Deterministically picks a gradient pair from the palette for a given seed key. */
export function gradientForKey(key: string): readonly [string, string] {
  const index = paletteIndexForKey(key, gradientPalette.length);
  return gradientPalette[index] ?? gradientPalette[0] ?? FALLBACK_GRADIENT;
}

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentMuted: string;
  onAccent: string;
  like: string;
  likeActive: string;
  danger: string;
  tabInactive: string;
}

export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface RadiusTokens {
  sm: number;
  md: number;
  lg: number;
  pill: number;
}

export interface FontTokens {
  size: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  weight: { regular: '400'; medium: '500'; semibold: '600'; bold: '700' };
}

export interface ThemeTokens {
  mode: ThemeMode;
  colors: ColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  font: FontTokens;
}

const spacing: SpacingTokens = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
const radius: RadiusTokens = { sm: 8, md: 12, lg: 20, pill: 999 };
const font: FontTokens = {
  size: { xs: 12, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
};

export const lightTheme: ThemeTokens = {
  mode: 'light',
  colors: {
    background: '#F5F6FA',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E4E7EE',
    text: '#111827',
    textMuted: '#6B7280',
    textFaint: '#9CA3AF',
    accent,
    accentMuted: '#DBEAFE',
    onAccent: '#FFFFFF',
    like: '#9CA3AF',
    likeActive: '#E11D48',
    danger: '#DC2626',
    tabInactive: '#9CA3AF',
  },
  spacing,
  radius,
  font,
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  colors: {
    background: '#0B1220',
    surface: '#141B2D',
    surfaceRaised: '#1B2438',
    border: '#263048',
    text: '#F3F4F6',
    textMuted: '#9AA5B8',
    textFaint: '#6B7686',
    accent: '#3B82F6',
    accentMuted: '#1E3A5F',
    onAccent: '#FFFFFF',
    like: '#6B7686',
    likeActive: '#FB7185',
    danger: '#F87171',
    tabInactive: '#6B7686',
  },
  spacing,
  radius,
  font,
};

export function getTheme(mode: ThemeMode | null | undefined): ThemeTokens {
  return mode === 'dark' ? darkTheme : lightTheme;
}
