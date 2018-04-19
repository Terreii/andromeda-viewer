// Helper functions to access values in network messages

// Return the value of a variable in an block
// msg.getValue(blockName, [blockIndex,] variableName)
// blockIndex defaults to 0
export function getValueOf (msg, blockName, blockOrValue, varName) {
  let blockNumber = 0
  let variableName

  if (varName == null) {
    variableName = blockOrValue
  } else {
    blockNumber = +blockOrValue
    variableName = varName
  }

  return msg[blockName][blockNumber][variableName]
}

// Transforms the value of a variable into a string.
// If the value is a Buffer (Fixed, Variable1 or Variable2)
// then it will be parsed as a UTF-8 String.
export function getStringValueOf (msg, blockName, blockOrValue, varName) {
  const value = getValueOf(msg, blockName, blockOrValue, varName)

  return parseValueAsString(value)
}

// Return the value of multiple variables in an block
// getValueOf(msg, blockName, [blockIndex,] variableNames)
// blockIndex defaults to 0
export function getValuesOf (msg, blockName, blockOrValues, varNames) {
  let blockNumber = 0
  let variableNames

  if (varNames == null) {
    variableNames = blockOrValues
  } else {
    blockNumber = +blockOrValues
    variableNames = varNames
  }
  if (!Array.isArray(variableNames)) throw new TypeError('names of variables must be an Array!')

  const blockInstance = msg[blockName][blockNumber]
  if (variableNames.length === 0) {
    variableNames = Object.keys(blockInstance)
  }

  return variableNames.reduce((result, name) => {
    result[name] = blockInstance[name]
    return result
  }, {})
}

// Returns multiple values as a object.
// Transforms the value of a variable into a string.
// If the value is a Buffer (Fixed, Variable1 or Variable2)
// then it will be parsed as a UTF-8 String.
export function getStringValuesOf (msg, blockName, blockOrValues, varNames) {
  const values = getValuesOf(msg, blockName, blockOrValues, varNames)

  return Object.keys(values).reduce((result, key) => {
    result[key] = parseValueAsString(values[key])
    return result
  }, {})
}

// How many instances of a block are there?
export function getNumberOfBlockInstancesOf (msg, blockName) {
  return msg[blockName].length
}

// Maps over every instance of a block.
// expects the block name and a function.
// The function receives a getValue function and the index.
// The getValue function expects the name of a variable
//     and as an optional second argument a Boolean if the value should be a String.
export function mapBlockOf (msg, blockName, fn) {
  return msg[blockName].map((blockInstance, index) => {
    const getter = (valueName, asString = false) => {
      const value = blockInstance[valueName]

      return asString
        ? parseValueAsString(value)
        : value
    }

    return fn(getter, index)
  })
}

// Helper function to stringify

function parseValueAsString (value) {
  return Buffer.isBuffer(value)
    ? value.toString('utf8').replace(/\0/gi, '')
    : value.toString()
}
