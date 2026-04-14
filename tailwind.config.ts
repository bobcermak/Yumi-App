/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        colors: {
          green: "#84C754",
          darkGreen: "#355E3B",
          yellow: "#C5E384",
          darkYellow: "#B2D26F",
          brown: "#8F593C",
          pink: "#CA877E",
          white: "#FFFFFF",
          dark: "#1D1D1D",
          black: "#121212"
        }
    }
  },
  plugins: [],
}