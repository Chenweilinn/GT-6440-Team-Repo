/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(91 35 112)',
        'primary-bg': 'rgba(91,35,112,0.06)',
        'primary-border': 'rgba(91,35,112,0.35)',
        'text-h': '#1a1a1a',
        bg: '#f8fafc',
        border: '#e5e7eb',
        sidebar: '#e9f6ff',
        'sidebar-heading': '#111827',
        'sidebar-text': '#374151',
        'sidebar-border': '#bfdbfe',
        'sidebar-hover': 'rgba(191,219,254,0.4)',
        'sidebar-active': 'rgba(191,219,254,0.7)',
      },
    },
  },
  plugins: [],
}
