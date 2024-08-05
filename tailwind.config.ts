import type { Config } from "tailwindcss";

const customSizes = {
  5.5: '1.37rem',
  6.5: '1.55rem',
  7.5: '1.87rem',
  84: '20rem',
  88: '22rem',
  112: '28rem',
  128: '32rem',
  140: '36rem',
  160: '40rem',
  192: '48rem',
  256: '64rem',
  512: '128rem',
};


const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '400px'
      },
      height: customSizes,
      maxWidth: customSizes,
      size: customSizes,
      width: customSizes
    }
  },
  plugins: [],
};
export default config;
