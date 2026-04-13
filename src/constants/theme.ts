// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Travel Buddy — Design System Tokens v2
// Style: Tripsy-inspired (frosted sheets, category glyphs, gradient hero)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const Colors = {
  // ── Primary accent — Tripsy warm orange
  primary: '#F26A1C',
  primaryLight: '#FFE6D4',
  primaryDark: '#C2500F',

  // ── Surfaces (light mode base)
  background: '#F7F7F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceDim: '#EFEFF3',

  // ── Dark surfaces — used behind frosted sheets
  surfaceDark: '#1C1C20',
  surfaceDarkElevated: '#242428',

  // ── Text (light)
  text: '#111216',
  textSecondary: '#6B6E76',
  textTertiary: '#9AA0A6',

  // ── Text (on dark / over photos)
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255,255,255,0.72)',
  textOnDarkTertiary: 'rgba(255,255,255,0.48)',

  // ── Borders
  border: '#E7E7EB',
  borderStrong: '#D4D4D8',
  borderFocus: '#F26A1C',
  borderOnDark: 'rgba(255,255,255,0.10)',

  // ── Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3AA4FF',

  // ── Overlays & scrims
  overlay: 'rgba(0, 0, 0, 0.45)',
  scrimTop: 'rgba(0,0,0,0)',
  scrimBottom: 'rgba(0,0,0,0.55)',

  // ── Frosted-sheet fills (RGBA w/ BlurView underneath)
  frostedDark: 'rgba(28,28,32,0.72)',
  frostedDarkStrong: 'rgba(20,20,24,0.85)',
  frostedLight: 'rgba(255,255,255,0.72)',
  frostedTintedOnDark: 'rgba(255,255,255,0.10)',
  frostedTintedOnLight: 'rgba(0,0,0,0.06)',

  // ── Category glyph palette (Tripsy screenshot-accurate)
  category: {
    flight: '#3AA4FF',     // cyan / sky
    lodging: '#E94A8B',    // magenta
    food: '#F2994A',       // orange
    activity: '#F04747',   // red
    places: '#F04747',     // red (alias of activity)
    shopping: '#F5B63B',   // gold
    culture: '#C94FBF',    // pink-magenta (museums)
    transport: '#5E7891',  // muted blue-grey
    weather: '#F5B800',    // yellow sun
    note: '#8E8E93',       // neutral grey
    gas: '#22C55E',        // green (road trip)
    other: '#8E8E93',
    // legacy aliases for existing code paths
    hotel: '#E94A8B',
  },

  // ── Gradient presets (for per-category GradientScreen)
  gradient: {
    flight: ['#0B1E3A', '#1E3A8A', '#0B1E3A'],
    lodging: ['#3A0B28', '#8A1E58', '#3A0B28'],
    alert: ['#0B0F2A', '#3B0F3A', '#601E3C'],
    places: ['#2A0B0B', '#8A3A1E', '#F26A1C'],
    trip: ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.55)'],
    hero: ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.75)'],
  },

  // ── Dark mode palette
  dark: {
    background: '#0E0E10',
    backgroundSecondary: '#17171A',
    text: '#F7F7F9',
    textSecondary: '#A1A1AA',
    border: '#2A2A2F',
  },
} as const;

// ── Typography — SF Pro Rounded for display, SF Pro Text for body
// `fontFamily` left undefined so system default picks SF on iOS / Roboto on Android;
// display variant declares the *intent* of SF Pro Rounded 800.
export const Typography = {
  // Big trip titles & marketing hero titles (Tripsy: "New York City", "Never be Late")
  display: {
    fontSize: 40,
    fontWeight: '800' as const,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  displaySm: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMed: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  micro: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.4 },
  // Tracked-out uppercase label (Tripsy "FLIGHT ALERTS")
  eyebrow: {
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
  },
  // Monospaced time/number emphasis
  mono: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 20,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  // Frosted sheet top-corner radius (Tripsy uses ~30pt)
  sheet: 30,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  // Frosted sheet floating over hero photo — softer, taller drop
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  // Circular quick-action + glyph buttons
  glyph: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;

export const Animation = {
  durationFast: 150,
  durationNormal: 250,
  durationSlow: 400,
  spring: { damping: 18, stiffness: 180 },
  springBouncy: { damping: 12, stiffness: 220 },
} as const;

// ── Sheet geometry constants (used by FrostedSheet + BottomSheet wrappers)
export const Sheet = {
  handleWidth: 36,
  handleHeight: 5,
  handleColor: 'rgba(255,255,255,0.35)',
  handleColorOnLight: 'rgba(0,0,0,0.22)',
  topRadius: Radius.sheet,
  backdropOpacity: 0.55,
} as const;
