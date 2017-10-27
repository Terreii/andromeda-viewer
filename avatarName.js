'use strict'

// parses an avatar name
// Searches for a dot or white space that separates the first and last names
// if neither is given, then 'resident' will be used for the last name

// first.last and first last will become {first: 'first', last: 'last'}

function cleanName (name) {
  return name.trim().replace(/"/g, '')
}

export default class AvatarName {
  constructor (name) {
    if (typeof name === 'object' && typeof name.first === 'string') {
      this.first = cleanName(name.first)
      this.last = cleanName(name.last || 'Resident')
    } else if (typeof name === 'string' && arguments.length === 1) {
      var separator = name.match(/[.\s]/) // either a dot or a space
      if (separator) {
        var parts = name.split(separator[0])
        this.first = cleanName(parts[0])
        this.last = cleanName(parts[1])
      } else {
        this.first = cleanName(name)
        this.last = 'Resident'
      }
    } else if (typeof name === 'string' && typeof arguments[1] === 'string') {
      this.first = cleanName(name)
      this.last = cleanName(arguments[1])
    }
  }

  getFullName () {
    return `${this.first} ${this.last}`
  }

  getName () {
    if (this.last === 'Resident') {
      return this.first
    } else {
      return this.getFullName()
    }
  }

  toString () {
    return this.getName()
  }

  compare (other, strict) {
    if (typeof other === 'string') {
      other = other.trim()
      return other === this.getName() || other === this.getFullName()
    }
    if (strict && !(other instanceof AvatarName)) {
      return false
    }
    return other.first === this.first && other.last === this.last
  }
}
