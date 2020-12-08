module.exports = {
  purge: [
    './public/**/*.html',
    './src/components/**/*.js',
    './src/components/**/*.tsx',
    './src/components/**/*.jsx'
  ],
  darkMode: false, // it should be 'media' once enabled
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      backgroundColor: ['even', 'active'],
      opacity: ['disabled'],
      textColor: ['visited']
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
