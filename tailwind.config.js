module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true
  },
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
    backgroundColor: ['responsive', 'even', 'hover', 'focus'],
    boxShadow: ['responsive', 'hover', 'focus', 'focus-within'],
    textColor: ['responsive', 'hover', 'focus', 'visited']
  },
  plugins: [
    require('@tailwindcss/custom-forms')
  ]
}
