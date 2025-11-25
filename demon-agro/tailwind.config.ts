import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          brown: "#5C4033",
          beige: "#C9A77C",
          cream: "#F5F1E8",
          green: "#4A7C59",
        },
      },
    },
  },
  plugins: [],
};
export default config;
