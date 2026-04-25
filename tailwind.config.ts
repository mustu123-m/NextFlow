import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        foreground: "#ffffff",
        primary: "#3b82f6",
        secondary: "#1f2937",
        accent: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
        success: "#10b981",
        "node-text": "#8b5cf6",
        "node-image": "#06b6d4",
        "node-video": "#ec4899",
        "node-llm": "#f59e0b",
        "node-crop": "#6366f1",
        "node-extract": "#14b8a6",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "node-executing": "node-executing 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)",
          },
          "50%": {
            boxShadow: "0 0 0 10px rgba(59, 130, 246, 0)",
          },
        },
        "node-executing": {
          "0%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.6",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
}

export default config