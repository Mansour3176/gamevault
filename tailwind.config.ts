/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
      },
      colors: {
        bg:      '#080B10',
        bg2:     '#0D1117',
        card:    '#111620',
        card2:   '#161C28',
        accent:  '#00D4FF',
        accent2: '#7C3AED',
        red:     '#EF4444',
        green:   '#22C55E',
        gold:    '#F59E0B',
        gwhite:  '#F0F4FF',
        muted:   '#6B7280',
        border:  '#1E2836',
        gtext:   '#CBD5E1',
      },
      animation: {
        'ticker':     'ticker 25s linear infinite',
        'float':      'float 4s ease-in-out infinite',
        'pulse-dot':  'pulseDot 1.5s ease-in-out infinite',
        'slide-in':   'slideIn 0.3s ease forwards',
      },
      keyframes: {
        ticker:   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        slideIn:  { from: { transform: 'translateX(60px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
