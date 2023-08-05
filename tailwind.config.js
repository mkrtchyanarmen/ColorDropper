/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        'inset-1': '0 0 0 1px red inset',
      },
    },
  },
  plugins: [],
};
