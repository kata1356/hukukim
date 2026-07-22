/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        lacivert: {
          DEFAULT: "#1B2A4A",
          koyu: "#121D38",
        },
        altin: {
          DEFAULT: "#C9A227",
          koyu: "#A9861E",
        },
        gece: {
          DEFAULT: "#0A0F1D",
          yuzey: "#111827",
          "yuzey-acik": "#161F32",
          kenar: "rgba(255,255,255,0.08)",
        },
        turkuaz: {
          DEFAULT: "#22D3EE",
          koyu: "#0EA5C4",
          parlak: "#67E8F9",
        },
        yonetim: {
          DEFAULT: "#101415",
          dusuk: "#0B0F10",
          kutu: "#1D2022",
          "kutu-acik": "#272A2C",
          kenar: "#3B494C",
        },
        vurgu: {
          DEFAULT: "#00DAF3",
          acik: "#C3F5FF",
          koyu: "#00626E",
        },
      },
      fontFamily: {
        sans: ["var(--font-hanken)", "sans-serif"],
        heading: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
