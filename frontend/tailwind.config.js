/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#050505",
                foreground: "#ededed",
                neon: {
                    blue: "#00f3ff",
                    purple: "#bc13fe",
                    green: "#0aff00",
                    red: "#ff003c",
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
}
