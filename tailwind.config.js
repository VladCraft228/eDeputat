/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                'header': "url('/src/assets/icons/header.jpg')",
                'arrow': "url('/src/assets/nav_icon/arrow.svg')",
            },
            fontFamily: {
                custom: ['DniproCity', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

