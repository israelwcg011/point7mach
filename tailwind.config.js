/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,vue,ts}",
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.{js,vue,ts}",
    "./app/pages/**/*.{js,vue,ts}",
    "./app/plugins/**/*.{js,vue,ts}",
    "./app/app.vue",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
