import React, { useMemo } from 'react'
import anchorme from 'anchorme'

/**
 * Render text and detect URLs it. URLs will be rendered as <a>.
 * This can also use the [url some text] formatting used in SL and openSIM.
 * @param {object}  param             React Argument.
 * @param {string}  param.text        Text body that should be rendered.
 * @param {boolean} [param.multiline] Should a <br> be added for \n?
 * @param {string}  [param.className] ClassNames for the links (<a>).
 */
export default function Text ({ text, multiline, className }) {
  const parsed = useMemo(
    () => {
      // Escape ) because anchorme has an error with it.
      const escapedText = text.replace(/\)/g, '.)escape')
      const found = anchorme.list(escapedText)

      if (found.length === 0) {
        return multiline ? toMultiLine(text) : [text]
      }

      let move = 0
      // remove the escape and move the start and end indexes
      const urls = found.map((url, index) => {
        // set move to the correct index if there was a ) before the first url.
        if (index === 0) {
          const textBeforeFirstURL = escapedText.substring(0, url.start)
          move = textBeforeFirstURL.length - textBeforeFirstURL.replace(/\.\)escape/g, ')').length
        }

        if (/\.\)escape/g.test(url.string)) {
          // replace the escape
          const urlString = url.string.replace(/\.\)escape/g, ')')
          const oldMove = move
          move += url.string.length - urlString.length
          return {
            ...url,
            start: url.start - oldMove,
            end: url.end - move,
            string: urlString,
            path: url.path.replace(/\.\)escape/g, ')')
          }
        } else {
          return {
            ...url,
            start: url.start - move,
            end: url.end - move
          }
        }
      })

      let lastEnd = 0

      const result = urls.flatMap((url, index, all) => {
        let startIndex = url.start
        let endIndex = url.end
        let linkBody = url.string

        // if the link is a SL formatted link [url body text]
        // There must be a [ before the url and a space after
        if (text.charAt(url.start - 1) === '[' && /\s/.test(text.charAt(url.end))) {
          // find the body
          const closingIndex = text.indexOf(']', endIndex)
          const body = text.substring(endIndex, closingIndex)

          if (body.length > 0) {
            startIndex = url.start - 1
            endIndex = closingIndex + 1
            linkBody = body
          }
        }

        let lines = []
        // get the text between last url (or start) and this one
        if ((lastEnd + 1) < startIndex) {
          const slice = text.substring(lastEnd, startIndex)
          lines = multiline ? toMultiLine(slice, index) : [slice]
        }

        lines.push({
          text: multiline ? toMultiLine(linkBody, 0) : linkBody,
          url: url.string
        })

        lastEnd = endIndex

        return lines
      })

      const rest = text.substring(lastEnd)
      if (rest.length > 0 && multiline) {
        result.push(...toMultiLine(rest))
      } else if (rest.length > 0) {
        result.push(rest)
      }

      return result
    },
    [text, multiline]
  )

  return (
    <>
      {parsed.map((part, index) => {
        if (typeof part === 'string' || part.url == null) {
          return part
        } else {
          return (
            <a
              key={index}
              href={part.url}
              target='_blank'
              rel='noopener noreferrer'
              className={className}
            >
              {part.text}
            </a>
          )
        }
      })}
    </>
  )
}

/**
 * Add <br> to strings.
 * @param {string} text Text that should be split up and <br> be added.
 * @param {number} index Index of the string slice.
 */
function toMultiLine (text, index) {
  const result = []

  text.split('\n').forEach((line, i) => {
    if (i > 0) {
      result.push(<br key={`br_${index}_${i}`} />)
    }

    result.push(line)
  })

  return result
}
