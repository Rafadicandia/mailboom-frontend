/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Notion color palette
        notion: {
          bg: '#FFFFFF',
          'bg-secondary': '#F7F7F5',
          'bg-hover': '#EFEFEE',
          border: '#E9E9E7',
          'border-hover': '#D3D3D1',
          text: '#37352F',
          'text-secondary': '#787774',
          'text-tertiary': '#9B9A97',
          red: '#E03E3E',
          orange: '#DFAB01',
          yellow: '#CB8907',
          green: '#4DAB9A',
          blue: '#529CCA',
          purple: '#9065B0',
          pink: '#D973AE',
        },
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#37352F',
          900: '#312e81',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'notion': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'notion-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'notion': '4px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
