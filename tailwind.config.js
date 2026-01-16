/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    safelist: [
        'bg-red-500',
        'p-4'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
