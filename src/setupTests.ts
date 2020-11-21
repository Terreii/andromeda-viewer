// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

import nativeCrypto from 'crypto'

import { toHaveNoViolations } from 'jest-axe'
import msrCrypto from 'hoodie-plugin-store-crypto/lib/utils/msrcrypto'

const webHashToNode = {
  'SHA-256': 'sha256'
}

expect.extend(toHaveNoViolations)

global.crypto = {
  ...msrCrypto,
  subtle: {
    ...msrCrypto.subtle,

    async importKey (format: string, keyData: ArrayBuffer, algorithm: any, extractable: boolean, keyUsages: string[]) {
      if (format !== 'raw') {
        throw new TypeError('format must be raw')
      }

      if (algorithm.name === 'PBKDF2') {
        if (extractable) {
          throw new TypeError('extractable must be false')
        }
        return {
          type: 'key',
          keyData,
          algorithm: algorithm.name,
          extractable,
          keyUsages
        }
      } else if (algorithm.name === 'AES-GCM') {
        return msrCrypto.subtle.importKey(format, keyData, algorithm, extractable, keyUsages)
      }
    },

    deriveBits (algorithm: any, baseKey: any, length: number) {
      if (algorithm.name !== baseKey.algorithm) {
        return Promise.reject(new TypeError('Algorithm missmatch'))
      }
      const digest = algorithm.hash.name === 'SHA-256' ? webHashToNode["SHA-256"] : 'unknown'
      const salt = algorithm.salt
      const iterations = algorithm.iterations
      const len = length >> 3

      return new Promise((resolve, reject) => {
        nativeCrypto.pbkdf2(baseKey.keyData, salt, iterations, len, digest, (err, derivedKey) => {
          if (err) {
            reject(err)
          } else {
            resolve(derivedKey)
          }
        })
      })
    }
  }
}
