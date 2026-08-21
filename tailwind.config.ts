import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Lexend Deca",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "Droid Sans",
          "Helvetica Neue",
          "sans-serif"
        ],
        heading: ["Montserrat", "sans-serif"]
      },
      colors: {
        umerco: {
          canvas: "#f0f2f5",
          surface: "#ffffff",
          sidebar: "#1a1d21",
          dark: "#1a1d21",
          primary: "#2563eb",
          "primary-hover": "#1d4ed8",
          "primary-soft": "#eff6ff",
          muted: "#6b7280",
          border: "#e8eaed",
          beige: "#f4f5f7",
          tan: "#dbeafe",
          white: "#ffffff",
          success: "#059669",
          "success-soft": "#ecfdf5",
          danger: "#ef4444"
        }
      },
      letterSpacing: {
        section: "0.12em"
      },
      borderRadius: {
        card: "0.75rem",
        xl: "0.75rem"
      },
      boxShadow: {
        card: "0 1px 2px rgb(17 24 39 / 0.03), 0 4px 16px rgb(17 24 39 / 0.05), 0 16px 48px rgb(240 242 245 / 0.95)",
        smoke: "0 1px 2px rgb(17 24 39 / 0.03), 0 4px 16px rgb(17 24 39 / 0.05), 0 16px 48px rgb(240 242 245 / 0.95)"
      },
      keyframes: {
        "detail-in": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "login-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "dropdown-in": {
          from: { opacity: "0", transform: "translateY(-8px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "dropdown-out": {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to: { opacity: "0", transform: "translateY(-8px) scale(0.96)" }
        }
      },
      animation: {
        "detail-in": "detail-in 280ms ease-out",
        "login-in": "login-in 520ms cubic-bezier(0.22, 1, 0.36, 1)",
        "dropdown-in": "dropdown-in 200ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "dropdown-out": "dropdown-out 160ms ease-in both"
      }
    }
  },
  plugins: []
};

export default config;
