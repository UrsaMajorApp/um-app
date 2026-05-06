/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        secondary: "#AF52DE",
        accent: "#FF9F0A",
        background: "#FDFDFF",
      },
    },
  },
  plugins: [],
};
