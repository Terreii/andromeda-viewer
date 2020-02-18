import React, { useMemo } from 'react'
import anchorme from 'anchorme'

/**
 * Render text and detect URLs it. URLs will be rendered as <a>.
 * This can also use the [url some text] formatting used in SL and openSIM.
 * @param {object} param             React Argument.
 * @param {string} param.text        Text body that should be rendered.
 * @param {string} [param.className] ClassNames for the links (<a>).
 */
export default function Text ({ text, className }) {
  const parsed = useMemo(
    () => {
      const urls = anchorme(text, { list: true })

      if (urls.length === 0) {
        return [text]
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
          result.push(rest.substring(0, index))
        }

        result.push({
          text: linkBody,
          url: url.raw
        })

        rest = rest.substring(endIndex)
      }

      if (rest.length > 0) {
        result.push(rest)
      }

      return result
    },
    [text]
  )

  return <>
    {parsed.map((part, index) => {
      if (typeof part === 'string') {
        return part
      } else {
        return <a
          key={index}
          href={part.url}
          target='_blank'
          rel='noopener noreferrer'
          className={className}
        >
          {part.text}
        </a>
      }
    })}
  </>
}
