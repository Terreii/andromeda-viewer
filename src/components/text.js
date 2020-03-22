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
      const found = anchorme(text.replace(/\)/g, '.)escape'), { list: true })

      const urls = found.map(url => {
        if (/\.\)escape/g.test(url.raw)) {
          return {
            ...url,
            raw: url.raw.replace(/\.\)escape/g, ')'),
            encoded: url.encoded.replace(/\.\)escape/g, ')')
          }
        } else {
          return url
        }
      })

      if (urls.length === 0) {
        return [
          multiline ? toMultiLine(text) : text
        ]
      }

      let rest = text
      const result = []

      for (const url of urls) {
        const urlStartIndex = rest.indexOf(url.raw)
        const urlEndIndex = urlStartIndex + url.raw.length

        const hasLinkBody = rest.charAt(urlStartIndex - 1) === '[' &&
          /\s/.test(rest.charAt(urlEndIndex))

        let index = urlStartIndex
        let endIndex = urlEndIndex
        let linkBody = url.raw

        if (hasLinkBody) {
          const closingIndex = rest.indexOf(']', urlEndIndex + 1)
          const body = rest.substring(urlEndIndex + 1, closingIndex)

          if (closingIndex >= 0 && body.length > 0) {
            index = urlStartIndex - 1
            endIndex = closingIndex + 1
            linkBody = body
          }
        }

        // split out text only part
        if (index > 0) {
          const subString = rest.substring(0, index)
          result.push(multiline ? toMultiLine(subString) : subString)
        }

        result.push({
          text: multiline ? toMultiLine(linkBody) : linkBody,
          url: url.raw
        })

        rest = rest.substring(endIndex)
      }

      if (rest.length > 0) {
        result.push(multiline ? toMultiLine(rest) : rest)
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
 */
function toMultiLine (text) {
  const result = []

  text.split('\n').forEach((line, index) => {
    if (index > 0) {
      result.push(<br key={'br_' + index} />)
    }

    result.push(line)
  })

  return result
}
