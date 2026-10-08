/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Klasy kolorów składane dynamicznie (ekran kontrolny etapu 0).
  safelist: [{ pattern: /^bg-(paper|surface|coral|lavender|lime|sun|flame|heart|locked)$/ }],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)', surface: 'var(--surface)', ink: 'var(--ink)', 'ink-muted': 'var(--ink-muted)',
        coral: 'var(--coral)', 'coral-soft': 'var(--coral-soft)',
        lavender: 'var(--lavender)', 'lavender-soft': 'var(--lavender-soft)',
        lime: 'var(--lime)', 'lime-ink': 'var(--lime-ink)', 'lime-soft': 'var(--lime-soft)',
        sun: 'var(--sun)', flame: 'var(--flame)', heart: 'var(--heart)',
        'error-ink': 'var(--error-ink)', 'error-soft': 'var(--error-soft)', locked: 'var(--locked)',
        league: { bronze: '#D9A273', silver: '#C9CED6', gold: '#FFD23F', sapphire: '#5AA9FF', diamond: '#B9F2FF' },
      },
      borderRadius: { sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)', node: 'var(--r-node)' },
      boxShadow: { 'st-sm': 'var(--shadow-sm)', 'st-md': 'var(--shadow-md)', 'st-lg': 'var(--shadow-lg)' },
      fontFamily: { head: ['Young Serif', 'serif'], body: ['DM Sans', 'sans-serif'] },
      fontSize: {
        display: ['32px', '38px'],
        h1: ['24px', '30px'],
        h2: ['20px', '26px'],
        body: ['16px', '24px'],
        small: ['14px', '20px'],
        label: ['11px', { lineHeight: '14px', letterSpacing: '0.06em' }],
        stat: ['20px', '24px'],
      },
      transitionTimingFunction: { brand: 'cubic-bezier(.2,.8,.2,1)' },
      transitionDuration: { fast: '120ms', std: '200ms', screen: '280ms' },
    },
  },
  plugins: [],
}
