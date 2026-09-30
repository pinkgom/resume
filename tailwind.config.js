/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: token('paper'),
        ink: token('ink'),
        'ink-soft': token('ink-soft'),
        rule: token('rule'),
        playhead: token('playhead'),
        track: {
          pm: token('track-pm'),
          architect: token('track-architect'),
          dev: token('track-dev'),
          ops: token('track-ops'),
          teach: token('track-teach'),
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans KR"', 'system-ui', 'sans-serif'],
        serif: ['Hahmlet', 'serif'],
      },
    },
  },
  plugins: [],
}
