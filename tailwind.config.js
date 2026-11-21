/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        material: {
          primary: 'var(--color-primary, #0b57d0)',
          'primary-container': 'var(--color-primary-container, #d3e3fd)',
          'on-primary': '#ffffff',
          'on-primary-container': '#041e49',
          surface: '#ffffff',
          'surface-dim': '#f8fafd',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f0f4f9',
          'surface-container': '#e9eef6',
          'surface-container-high': '#e3e8ef',
          'surface-container-highest': '#dde3ea',
          'on-surface': '#1b1b1f',
          'on-surface-variant': '#444746',
          outline: '#747775',
          'outline-variant': '#c4c7c5',
          secondary: '#535f70',
          'secondary-container': '#d7e3f7',
          tertiary: '#6e5b76',
          error: '#ba1a1a',
          'error-container': '#ffdad6',
          success: '#1e8e3e',
          'success-container': '#ceead6',
        }
      },
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '24px',
        'm3-2xl': '28px',
        'm3-full': '9999px',
      },
      boxShadow: {
        'm3-1': '0 1px 3px 1px rgba(0,0,0,0.15), 0 1px 2px 0 rgba(0,0,0,0.30)',
        'm3-2': '0 2px 6px 2px rgba(0,0,0,0.15), 0 1px 2px 0 rgba(0,0,0,0.30)',
        'm3-3': '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px 0 rgba(0,0,0,0.30)',
      }
    },
  },
  plugins: [],
}
