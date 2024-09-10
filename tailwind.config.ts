import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    {
      pattern: /bg-(lte-blue|lte-red|lte-yellow|lte-green)/,
    },
    {
      pattern: /from-(lte-blue|lte-red|lte-yellow|lte-green)/,
    },
    {
      pattern: /to-(lte-blue|lte-red|lte-yellow|lte-green)/,
    }
  ],
  theme: {

    container: {
      padding: '2rem'
    },

    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {

        'lte-red': '#E7004A',
        'lte-blue': '#0041E9',
        'lte-yellow': '#FFD300',
        'lte-green': "#00D99E"
  
      },
    },
  },
  plugins: [],
};
export default config;
