/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#F6F2EA',
          sand: '#ECE6DB',
          card: 'rgba(255, 255, 255, 0.78)',
          cardOpaque: '#FFFFFF',
          glass: 'rgba(255, 255, 255, 0.65)',
          border: 'rgba(255, 255, 255, 0.9)',
          borderSubtle: 'rgba(22, 22, 24, 0.08)',
          obsidian: '#141416',
          charcoal: '#222226',
          graphite: '#5C5C64',
          muted: '#8C8C94',
        },
        terracotta: {
          light: '#FF9E66',
          DEFAULT: '#FF6F1F',
          dark: '#E55300',
          glow: 'rgba(255, 111, 31, 0.25)',
          soft: '#FFF0E6'
        },
        material: {
          primary: 'var(--color-primary, #FF6F1F)',
          'primary-container': 'var(--color-primary-container, #FFE8D9)',
          'on-primary': '#ffffff',
          'on-primary-container': '#381400',
          surface: '#ffffff',
          'surface-container-low': '#F6F2EA',
          'surface-container': '#EFE9DE',
          'surface-container-high': '#E5DFC0',
          'on-surface': '#161618',
          'on-surface-variant': '#5C5C64',
          outline: '#8C8C94',
          'outline-variant': '#D8D1C4',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Syne"', '"Outfit"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
        'pill': '9999px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(160, 140, 120, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
        'glass-hover': '0 16px 48px 0 rgba(160, 140, 120, 0.14), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'obsidian': '0 20px 40px -15px rgba(20, 20, 22, 0.35)',
        'amber-glow': '0 10px 40px -10px rgba(255, 111, 31, 0.45)',
      }
    },
  },
  plugins: [],
}
