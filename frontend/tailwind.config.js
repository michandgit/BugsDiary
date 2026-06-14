/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': {
          100: '#1f2937',
          200: '#111827',
          300: '#0f172a',
        }
      },
      fontFamily: {
        'mono': ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      }
    },
  },
  safelist: [
    'bg-dark-100',
    'bg-dark-200',
    'bg-dark-300',
    'border-gray-700',
  ],
  plugins: [],
}