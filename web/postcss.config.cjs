// web/postcss.config.cjs
module.exports = {
  plugins: [
    // Achtung: hier das neue PostCSS-Plugin-Paket von Tailwind
    require('@tailwindcss/postcss'),
    // Automatisches Vendor–Prefixing
    require('autoprefixer'),
  ]
}
