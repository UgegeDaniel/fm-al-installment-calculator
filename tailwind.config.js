import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Poppins", ...fontFamily.sans],
            },
            colors: {
                primary: "#37a477",      // Ocean Green
                background: "#e5e7eb",   // Athens Gray
                foreground: "#000000",   // Black
            },
        },
    },
    plugins: [],
};

export default config;
