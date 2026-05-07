/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: {
            DEFAULT: '#00ff41',
            dim: '#003b00',
            glow: 'rgba(0, 255, 65, 0.5)',
          },
          amber: {
            DEFAULT: '#ffb000',
            dim: '#3b2a00',
            glow: 'rgba(255, 176, 0, 0.5)',
          },
          cyan: {
            DEFAULT: '#00faff',
            dim: '#003a3b',
            glow: 'rgba(0, 250, 255, 0.5)',
          },
          red: {
            DEFAULT: '#ff0000',
            dim: '#3b0000',
            glow: 'rgba(255, 0, 0, 0.5)',
          },
          bg: '#0a0a0a',
          panel: '#121212',
          border: '#333333',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        vt323: ['"VT323"', 'monospace'],
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 10s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.97' },
          '100%': { opacity: '1' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
