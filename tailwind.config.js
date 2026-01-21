/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        categories: {
          finance: '#3B82F6',
          sport: '#F97316',
          nutrition: '#10B981',
          lifestyle: '#8B5CF6',
          health: '#EF4444',
          education: '#F59E0B',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['Epilogue', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 10px 40px -10px rgba(56, 128, 245, 0.3)',
        'glow': '0 0 20px -5px rgba(56, 128, 245, 0.3)',
      },
    },
  },
  plugins: [],
}