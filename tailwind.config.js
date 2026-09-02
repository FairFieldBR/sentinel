/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a0f1e',
          light: '#111833',
          dark: '#060a14',
          surface: '#0d1429'
        },
        sentinel: {
          DEFAULT: '#7DD3FC',
          light: '#a5e1fd',
          dark: '#38bdf8',
          glow: 'rgba(125,211,252,0.15)'
        },
        cobre: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706'
        },
        accent: {
          emerald: '#34d399',
          violet: '#a78bfa',
          rose: '#fb7185'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(125,211,252,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-40': '40px 40px'
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scan': 'scan 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(125,211,252,0.2), 0 0 20px rgba(125,211,252,0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(125,211,252,0.4), 0 0 40px rgba(125,211,252,0.2)' }
        }
      }
    }
  },
  plugins: []
}
