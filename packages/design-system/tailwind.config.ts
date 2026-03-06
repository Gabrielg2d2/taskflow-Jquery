import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx,html}",
    "./.storybook/**/*.{ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens definidos em tokens.css podem ser referenciados aqui se necessário
      },
    },
  },
  plugins: [],
} satisfies Config;
