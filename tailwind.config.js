/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        main: '#09090b',
        card: '#18181b',
        input: '#27272a',
        subtle: '#3f3f46',
        primary: '#ffffff',
        secondary: '#a1a1aa',
        accent: '#FDDA0D',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
}
