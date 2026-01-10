/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Design System Colors (60-30-10)
      colors: {
        // Background (60%)
        background: {
          primary: '#FFFFFF',
          secondary: '#F8F8F8',
        },
        // Text & UI (30%)
        text: {
          heading: '#1C1C1C',
          body: '#4A4A4A',
          divider: '#E6E6E6',
        },
        // Accent (10%)
        accent: {
          primary: '#5F6F7A', // Slate blue
        },
        // States (not in 60-30-10, used only for states)
        state: {
          error: '#DC2626',
          warning: '#F59E0B',
          success: '#10B981',
        },
        // Keep existing primary for backward compatibility during migration
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      // Typography
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Inter as default
      },
      fontSize: {
        body: ['14px', { lineHeight: '20px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        heading: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'heading-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      },
      // Spacing System (8/16/24/32px)
      // Note: Tailwind's default spacing already includes these values
      // We're explicitly defining them for clarity and consistency
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        // Keep existing spacing for backward compatibility
      },
      // Border Radius
      borderRadius: {
        DEFAULT: '8px', // 8px everywhere
      },
    },
  },
  plugins: [],
};







