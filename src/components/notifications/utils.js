import React from 'react'

export function Text ({ text }) {
  return <p>
    {text.split('\n').flatMap((line, index) => index === 0
      ? line
      : [<br key={'br_' + index} />, line]
    )}
  </p>
}
