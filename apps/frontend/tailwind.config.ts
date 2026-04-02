import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Palette violette principale
        arcane: {
          50: "#E2A8FE",
          100: "#AF77D5",
          200: "#7E4EAC",
          300: "#532D84",
          400: "#2E165B",
          500: "#120632",
          600: "#02000A",
        },
        // Backgrounds
        void: {
          DEFAULT: "#02000A",
          50: "#0d0a14",
          100: "#120632",
          200: "#1a0d3d",
          300: "#2E165B",
          400: "#3d2070",
        },
        // Accents
        glow: {
          purple: "#AF77D5",
          lavender: "#E2A8FE",
          blue: "#4060FF",
          cyan: "#00D4FF",
        },
        // WoW item quality colors
        quality: {
          common: "#9d9d9d",
          uncommon: "#1eff00",
          rare: "#0070dd",
          epic: "#a335ee",
          legendary: "#ff8000",
          artifact: "#e6cc80",
        },
        // Gold WoW
        gold: {
          DEFAULT: "#f8b700",
          light: "#ffd700",
          dark: "#c47700",
        },
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern": `
          linear-gradient(rgba(174, 119, 213, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(174, 119, 213, 0.03) 1px, transparent 1px)
        `,
        "arcane-gradient":
          "linear-gradient(135deg, #02000A 0%, #120632 50%, #02000A 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(46, 22, 91, 0.4) 0%, rgba(18, 6, 50, 0.8) 100%)",
        "glow-gradient":
          "radial-gradient(ellipse at center, rgba(174, 119, 213, 0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        arcane:
          "0 0 20px rgba(174, 119, 213, 0.15), 0 0 60px rgba(174, 119, 213, 0.05)",
        "arcane-lg":
          "0 0 40px rgba(174, 119, 213, 0.2), 0 0 100px rgba(174, 119, 213, 0.08)",
        glow: "0 0 15px rgba(226, 168, 254, 0.4)",
        card: "0 4px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(174, 119, 213, 0.1)",
      },
      borderColor: {
        arcane: "rgba(174, 119, 213, 0.2)",
        "arcane-bright": "rgba(226, 168, 254, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
