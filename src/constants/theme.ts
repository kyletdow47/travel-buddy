// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Travel Buddy — Design System Tokens v2
// Style: Tripsy-inspired (frosted sheets, category glyphs, gradient hero)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const Colors = {
  // ── Primary accent — cool blue
  primary: '#4F8CFF',
  primaryLight: 'rgba(79,140,255,0.20)',
  primaryTinted: 'rgba(79,140,255,0.15)',
  primaryDark: '#3A6FCC',

  // ── Surfaces (dark-first — Tripsy navy aesthetic)
  background: '#0B1120',
  backgroundSecondary: '#111827',
  surface: '#1A2235',
  surfaceElevated: '#1F2A40',
  surfaceDim: '#0A0F1A',

  // ── Card surfaces — glass overlays on dark backgrounds
  card: 'rgba(255,255,255,0.07)',
  cardSecondary: 'rgba(255,255,255,0.04)',
  cardElevated: 'rgba(255,255,255,0.10)',

  // ── Text (primary — light on dark)
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.72)',
  textTertiary: 'rgba(255,255,255,0.48)',

  // ── Text (on cards — light on glass)
  textOnCard: '#FFFFFF',
  textOnCardSecondary: 'rgba(255,255,255,0.72)',
  textOnCardTertiary: 'rgba(255,255,255,0.48)',

  // ── Legacy aliases for backward compat
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255,255,255,0.72)',
  textOnDarkTertiary: 'rgba(255,255,255,0.48)',

  // ── Borders
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.15)',
  borderFocus: '#4F8CFF',
  borderOnDark: 'rgba(255,255,255,0.10)',
  borderOnCard: 'rgba(255,255,255,0.10)',

  // ── Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3AA4FF',

  // ── Overlays & scrims
  overlay: 'rgba(0, 0, 0, 0.55)',
  scrimTop: 'rgba(11,17,32,0)',
  scrimBottom: 'rgba(11,17,32,0.85)',

  // ── Frosted-sheet fills (RGBA w/ BlurView underneath)
  frostedDark: 'rgba(11,17,32,0.80)',
  frostedDarkStrong: 'rgba(8,12,24,0.90)',
  frostedLight: 'rgba(255,255,255,0.08)',
  frostedTintedOnDark: 'rgba(255,255,255,0.06)',
  frostedTintedOnLight: 'rgba(255,255,255,0.12)',

  // ── Tab bar
  tabBar: 'rgba(11,17,32,0.95)',
  tabBarBorder: 'rgba(255,255,255,0.06)',

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
    // Main app background gradient
    screen: ['#0B1120', '#111827', '#0B1120'],
    screenAlt: ['#0B1120', '#1A1040', '#0B1120'],
    // Category-specific
    flight: ['#0B1E3A', '#1E3A8A', '#0B1E3A'],
    lodging: ['#3A0B28', '#8A1E58', '#3A0B28'],
    alert: ['#0B0F2A', '#3B0F3A', '#601E3C'],
    places: ['#0B1E3A', '#1E3A6A', '#4F8CFF'],
    trip: ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.55)'],
    hero: ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.75)'],
    // Card accent gradients
    cardGlow: ['rgba(79,140,255,0.0)', 'rgba(79,140,255,0.05)'],
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
  '4xl': 64,
  '5xl': 80,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
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
