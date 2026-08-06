import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#454545",
        secondary: "#06bfa2",
        tertiary: "#0f7f6d",
        "on-tertiary": "#F7F8F8",
        neutral: "#F7F8F8",
        surface: "#FFFFFF",
        border: "#E3E8E7",
      },
      fontFamily: {
        heading: ["Roboto", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
