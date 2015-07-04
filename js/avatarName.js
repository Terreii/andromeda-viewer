'use strict';

// parses an avatar name
// Searches for a dot or white space that separates the first and last names
// if neither is given, then 'resident' will be used for the last name

// first.last and first last will become {first: 'first', last: 'last'}

function parseFullName (name) {
  if (typeof name !== 'string') {
    throw new TypeError('Name must be a string');
  }
  name = name.trim();

  var parts;
  var parsed = name.match(/[\.\s]/);
  // if the first name and last name are given
  if (parsed) {
    parts = name.split(parsed[0]);
  } else {
    parts = [
      name,
      'Resident'
    ];
  }

  return {
    first: parts[0],
    last: parts[1]
  };
}

module.exports = parseFullName;
