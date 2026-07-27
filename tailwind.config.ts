import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    screens: {
      'mobile': '390px',
      'tablet': '768px',
      'laptop': '1280px',
      'desktop': '1440px',
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "var(--border)",
        divider: "var(--divider)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: {
          DEFAULT: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-hover)",
          pressed: "var(--brand-pressed)",
          foreground: "var(--primary-foreground)",
        },
        ai: {
          DEFAULT: "var(--ai-accent)",
          background: "var(--ai-bg)",
        },
        success: {
          DEFAULT: "var(--success)",
          background: "var(--success-bg)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          background: "var(--warning-bg)",
        },
        error: {
          DEFAULT: "var(--error)",
          background: "var(--error-bg)",
        },
        info: {
          DEFAULT: "var(--info)",
          background: "var(--info-bg)",
        },
        primary: {
          DEFAULT: "var(--brand-primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--foreground)",
        },
      },
      transitionDuration: {
        fast: "120ms",
        normal: "180ms",
        slow: "240ms",
      },
      borderRadius: {
        button: "12px",
        input: "14px",
        dropdown: "16px",
        table: "18px",
        card: "20px",
        dialog: "24px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        DEFAULT: "0 1px 2px rgba(0,0,0,.05), 0 6px 24px rgba(0,0,0,.05)",
        hover: "0 10px 30px rgba(0,0,0,.08)",
        dialog: "0 24px 64px rgba(0,0,0,.12)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
