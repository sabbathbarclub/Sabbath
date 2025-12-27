/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neonPurple: '#A855F7',
                neonPink: '#EC4899',
                glassBlack: 'rgba(0, 0, 0, 0.7)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'hero-pattern': "url('/bg.svg')",
            }
        },
    },
    plugins: [],
}
