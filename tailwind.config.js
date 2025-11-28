/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Démon agro barvy
        'primary-brown': '#5C4033',
        'beige': '#C9A77C',
        'cream': '#F5F1E8',
        'green-cta': '#4A7C59',
        'text-dark': '#2D2A26',
        'text-light': '#6B6560',
        // Barvy živin
        'nutrient-ca': '#0EA5E9', // sky-500
        'nutrient-mg': '#10B981', // emerald-500
        'nutrient-k': '#8B5CF6',  // violet-500
        'nutrient-s': '#EAB308',  // yellow-500
        'nutrient-p': '#F97316',  // orange-500
        'nutrient-n': '#EC4899',  // pink-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'warm-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
