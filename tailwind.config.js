/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#2ECC71",
          greenDark: "#27AE60",
          blue: "#3498DB",
          blueDark: "#2980B9",
          yellow: "#F1C40F",
          orange: "#F39C12",
          red: "#E74C3C",
          slate: "#2C3E50",
          bgLight: "#F8F9FA",
        },
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        card: "0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
        hover: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};
