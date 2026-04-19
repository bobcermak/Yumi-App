/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        fontFamily: {
          //Normal
          "nunito-200": ["Nunito-200"],
          "nunito-300": ["Nunito-300"],
          "nunito-400": ["Nunito-400"],
          "nunito-500": ["Nunito-500"],
          "nunito-600": ["Nunito-600"],
          "nunito-700": ["Nunito-700"],
          "nunito-800": ["Nunito-800"],
          "nunito-900": ["Nunito-900"],
          //Cursive
          "nunito-200i": ["Nunito-200i"],
          "nunito-300i": ["Nunito-300i"],
          "nunito-400i": ["Nunito-400i"],
          "nunito-500i": ["Nunito-500i"],
          "nunito-600i": ["Nunito-600i"],
          "nunito-700i": ["Nunito-700i"],
          "nunito-800i": ["Nunito-800i"],
          "nunito-900i": ["Nunito-900i"],
        },
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