// parses an avatar name
// Searches for a dot or white space that separates the first and last names
// if neither is given, then 'resident' will be used for the last name

// first.last and first last will become {first: 'first', last: 'last'}

function cleanName (name) {
  // deletes characters that will be in names but shouldn't
  const trimmed = name.trim().replace(/["\0]/gi, '')
  const upperCased = trimmed.charAt(0).toUpperCase() + // name -> Name
    trimmed.substring(1).toLowerCase()
  return upperCased
}

export default class AvatarName {
  constructor (name) {
    if (name instanceof AvatarName) {
      this.first = name.first
      this.last = name.last
      this.displayName = name.displayName
      this.isUsingDisplayName = name.isUsingDisplayName
      this.didLoadDisplayName = name.didLoadDisplayName
      this.isLoadingDisplayName = name.isLoadingDisplayName
      return
    } else if (typeof name === 'object' && typeof name.first === 'string') {
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
    this.displayName = ''
    this.isUsingDisplayName = false
    this.didLoadDisplayName = false
    this.isLoadingDisplayName = false
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

  getDisplayName () {
    if (this.didLoadDisplayName && this.isUsingDisplayName) {
      return `${this.displayName} (${this.getName()})`
    } else {
      return this.getName()
    }
  }

  toString () {
    return this.getDisplayName()
  }

  compare (other, strict) {
    if (strict && !(other instanceof AvatarName)) {
      return false
    }

    const otherName = typeof other === 'string' ? new AvatarName(other) : other

    return otherName.first === this.first && otherName.last === this.last
  }

  willHaveDisplayName () {
    return this.didLoadDisplayName || this.isLoadingDisplayName || this.displayName.length > 0
  }

  withIsLoadingSetTo (isLoading) {
    const next = new AvatarName(this)
    next.isLoadingDisplayName = isLoading
    return next
  }

  withDisplayNameSetTo (displayName, legacyFirstName, legacyLastName) {
    const next = new AvatarName(this)

    if (legacyFirstName != null) {
      next.first = legacyFirstName
    }
    if (legacyLastName != null) {
      next.last = legacyLastName
    }

    next.isLoadingDisplayName = false
    next.didLoadDisplayName = true
    next.displayName = displayName
    next.isUsingDisplayName = next.getName() !== displayName
    return next
  }
}
