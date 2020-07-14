module.exports = {
  purge: [
    './public/**/*.html',
    './src/components/**/*.js',
    './src/components/**/*.tsx',
    './src/components/**/*.jsx'
  ],
  theme: {
    extend: {}
  },
  variants: {
    boxShadow: ['responsive', 'hover', 'focus', 'focus-within'],
    textColor: ['responsive', 'hover', 'focus', 'visited']
  },
  plugins: [
    require('@tailwindcss/custom-forms')
  ]
}
