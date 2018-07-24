'use strict'

const os = require('os')

const macaddress = require('macaddress')

test('it should have a method for returning one mac-address', () => {
  expect(typeof macaddress.one).toBe('function')
})

test('it should return a string in mac-address-format', () => {
  return new Promise((resolve, reject) => {
    macaddress.one((err, mac) => {
      if (err) {
        reject(err)
        return
      }

      expect(mac).toMatch(
        /[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}/
      )
      resolve()
    })
  })
})

test('it should provide a mac address', () => {
  return new Promise((resolve, reject) => {
    try {
      macaddress.one((err, mac) => {
        if (err) {
          reject(err)
          return
        }

        const interfaces = os.networkInterfaces()
        for (const key in interfaces) {
          const networkInterface = interfaces[key]

          for (const info of networkInterface) {
            if (info.mac === mac) {
              resolve()
              return
            }
          }
        }
      })
    } catch (err) {
      reject(err)
    }
  })
})
