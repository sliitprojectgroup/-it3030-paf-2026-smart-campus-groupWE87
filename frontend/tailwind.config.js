/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#001b44",
        "inverse-on-surface": "#f0f0f9",
        "surface-variant": "#e1e2eb",
        "primary-container": "#002f6c",
        "secondary-fixed-dim": "#84d5c5",
        "inverse-surface": "#2e3037",
        "surface-bright": "#f9f9ff",
        "surface-dim": "#d9d9e2",
        "inverse-primary": "#aec6ff",
        "tertiary": "#291a00",
        "secondary": "#046b5e",
        "on-tertiary-fixed": "#281900",
        "background": "#f9f9ff",
        "error-container": "#ffdad6",
        "on-tertiary": "#ffffff",
        "surface": "#f9f9ff",
        "on-error-container": "#93000a",
        "surface-tint": "#3c5d9c",
        "tertiary-container": "#442d00",
        "on-tertiary-container": "#cb8e00",
        "on-background": "#191b22",
        "on-primary": "#ffffff",
        "secondary-fixed": "#a0f2e1",
        "surface-container": "#ededf6",
        "on-secondary": "#ffffff",
        "surface-container-highest": "#e1e2eb",
        "on-secondary-fixed-variant": "#005046",
        "error": "#ba1a1a",
        "primary-fixed-dim": "#aec6ff",
        "primary-fixed": "#d8e2ff",
        "on-tertiary-fixed-variant": "#604100",
        "tertiary-fixed-dim": "#ffba38",
        "on-surface-variant": "#434750",
        "on-secondary-fixed": "#00201b",
        "tertiary-fixed": "#ffdeac",
        "outline-variant": "#c4c6d2",
        "surface-container-low": "#f3f3fc",
        "surface-container-high": "#e7e7f0",
        "on-error": "#ffffff",
        "secondary-container": "#9defde",
        "outline": "#747781",
        "on-secondary-container": "#0f6f62",
        "on-primary-fixed": "#001a42",
        "on-primary-fixed-variant": "#224583",
        "on-primary-container": "#7999dc",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#191b22"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
