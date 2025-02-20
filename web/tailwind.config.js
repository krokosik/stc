/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,vue,ts}",
        "node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx,vue}",
        "node_modules/flowbite/**/*.{js,jsx,ts,tsx}"
    ],
    darkMode: "media",
    theme: {
        extend: {},
    },
    plugins: [
        'flowbite/plugin',
    ],
}
