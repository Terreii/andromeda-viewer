/*
$LicenseInfo:firstyear=2010&license=mit$

Copyright (c) 2010, Linden Research, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
$/LicenseInfo$
*/

// Source https://bitbucket.org/lindenlab/llsd/src/7d2646cd3f9b4c806e73aebc4b32bd81e4047fdc/js/?at=default

var ArrayBuffer, Uint8Array, DataView // typedarray.js

 //
 // LLSD Type          ECMAScript Type
 // ------------------ ---------------
 // Undefined          null
 // Boolean            Boolean
 // Integer            Number
 // Real               Number
 // UUID               UUID
 // String             String
 // Date               Date
 // URI                URI
 // Binary             Binary
 // Map                Object
 // Array              Array
 //

var LL_LEGACY // Set to true to enable notation formatting
var LLSD, URI, UUID, Binary;

(function () {
  'use strict'

    //
    // var u = new URI("http://www.example.com");
    // u.toString() // -> "http://www.example.com"
    // u.toJSON()   // -> "http://www.example.com"
    //
  if (!URI) {
    URI = function (val) {
      if (typeof val === 'undefined') {
        this.uri = ''
      } else if (/^(|([A-Za-z][A-Za-z0-9+\-.]*):([A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]|%[A-Fa-f0-9]{2})+)$/.test(val)) {
        this.uri = String(val)
      } else {
        throw new TypeError('Invalid URI')
      }
    }

    URI.prototype.toString = function () {
      return this.uri
    }

    URI.prototype.toJSON = function () {
      return this.uri
    }
  }

    //
    // var u = new UUID(); // 00000000-0000-0000-0000-000000000000
    // var u = new UUID([ 0x00, 0x01, 0x02 ... 0x0f ]);
    // var u = new UUID("12345678-1234-1234-1234-123456789abc");
    // u.toString() // UUID string
    // u.toJSON()   // UUID string
    // u.getOctets() // [ 0x00, 0x01, 0x02 ... 0x0f ]
    //
  if (!UUID) {
    UUID = function (val) {
      function hex2 (b) { return ('00' + b.toString(16)).slice(-2) }

      if (typeof val === 'undefined') {
        this.uuid = '00000000-0000-0000-0000-000000000000'
      } else if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(val)) {
        this.uuid = String(val).toLowerCase()
      } else if (typeof val === 'object' && val instanceof Array) {
        if (val.length !== 16) { throw new Error('Invalid UUID array length') }
        var uuid =
                    hex2(val[0]) + hex2(val[1]) + hex2(val[2]) + hex2(val[3]) + '-' +
                    hex2(val[4]) + hex2(val[5]) + '-' +
                    hex2(val[6]) + hex2(val[7]) + '-' +
                    hex2(val[8]) + hex2(val[9]) + '-' +
                    hex2(val[10]) + hex2(val[11]) + hex2(val[12]) + hex2(val[13]) +
                    hex2(val[14]) + hex2(val[15])
        this.uuid = uuid.toLowerCase()
      } else {
        throw new TypeError('Expected string or array')
      }
    }

    UUID.prototype.toString = function () {
      return this.uuid
    }

    UUID.prototype.toJSON = function () {
      return this.uuid
    }

    UUID.prototype.getOctets = function () {
      var string = this.uuid.replace(/-/g, '')
      var octets = []
      var i
      for (i = 0; i < 16; i += 1) {
        octets[i] = parseInt(string.substring(i * 2, i * 2 + 2), 16)
      }
      return octets
    }
  }

    // Browser compatibility shims
  var B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  if (!window.atob) {
    window.atob = function (a) {
            /* jslint plusplus: false, bitwise: false */
      var pos = 0
      var len = a.length
      var octets = []
      var e1
      var e2
      var e3
      var e4
      var o1
      var o2
      var o3

      while (pos < len) {
        e1 = B64_ALPHABET.indexOf(a.charAt(pos++))
        e2 = (pos < len) ? B64_ALPHABET.indexOf(a.charAt(pos++)) : -1 // required
        e3 = (pos < len) ? B64_ALPHABET.indexOf(a.charAt(pos++)) : 64 // optional padding
        e4 = (pos < len) ? B64_ALPHABET.indexOf(a.charAt(pos++)) : 64 // optional padding

        if (e1 === -1 || e2 === -1 || e3 === -1 || e4 === -1) {
          throw new Error('INVALID_CHARACTER_ERR')
        }

                // 11111122 22223333 33444444
        o1 = (e1 << 2) | (e2 >> 4)
        o2 = ((e2 & 0xf) << 4) | (e3 >> 2)
        o3 = ((e3 & 0x3) << 6) | e4

        octets.push(String.fromCharCode(o1))
        if (e3 !== 64) { octets.push(String.fromCharCode(o2)) }
        if (e4 !== 64) { octets.push(String.fromCharCode(o3)) }
      }

      return octets.join('')
    }
  }
  if (!window.btoa) {
    window.btoa = function (b) {
            /* jslint plusplus: false, bitwise: false */
      var pos = 0
      var len = b.length
      var out = []
      var o1
      var o2
      var o3
      var e1
      var e2
      var e3
      var e4
      while (pos < len) {
        o1 = b.charCodeAt(pos++)
        o2 = b.charCodeAt(pos++)
        o3 = b.charCodeAt(pos++)

                // 111111 112222 222233 333333
        e1 = o1 >> 2
        e2 = ((o1 & 0x3) << 4) | (o2 >> 4)
        e3 = ((o2 & 0xf) << 2) | (o3 >> 6)
        e4 = o3 & 0x3f

        if (pos === len + 2) { e3 = 64; e4 = 64 } else if (pos === len + 1) { e4 = 64 }

        out.push(B64_ALPHABET.charAt(e1),
                         B64_ALPHABET.charAt(e2),
                         B64_ALPHABET.charAt(e3),
                         B64_ALPHABET.charAt(e4))
      }

      return out.join('')
    }
  }

    //
    // var b = new Binary(); // length 0
    // var b = new Binary( octets ); // Array of numbers
    // var b = new Binary( binary ); // Clone constructor
    // var b = new Binary( string, encoding );
    //
    // b.toString() // string line "[Binary <length>]"
    // b.toString( encoding ) // encoding of octets
    // b.toJSON()   // base64 encoding of octets
    // b.toArray() // Array of octets (a copy)
    //
    // Supported encodings are "UTF-8", "BASE64", "BASE16", "BINARY"
    // Unsupported encodings or invalid data will throw
    // a RangeError.
    //
    // *TODO: Track updates to CommonJS proposals for Binary data API
    //
  if (!Binary) {
    (function () {
            // Convert binary string (each octet stored as character 0x00-0xff) to array of numbers
      function binstrToArray (s) {
        var a = []
        var len = s.length
        var i
        var c
        for (i = 0; i < len; i += 1) {
          c = s.charCodeAt(i)
          if (c > 0xff) {
            throw new RangeError('Invalid byte value')
          }
          a[i] = c
        }
        return a
      }

            // Convert array of numbers to binary string (each octet stored as character 0x00-0xff)
      function arrayToBinstr (a) {
        var s = []
        var len = a.length
        var i
        var c
        for (i = 0; i < len; i += 1) {
          c = a[i]
          if (c > 0xff) {
            throw new RangeError('Invalid byte value')
          }
          s.push(String.fromCharCode(c))
        }
        return s.join('')
      }

      var encodings = {
        'BINARY': {
          encode: binstrToArray,
          decode: arrayToBinstr
        },

        'UTF-8': {
          encode: function (s) {
                        /* jslint bitwise: false */
            var o = []
            var len
            var i
            var cp
            var cp2

            function utf8 (cp) {
              if (cp >= 0x0000 && cp <= 0x007F) {
                o.push(cp)
              } else if (cp >= 0x0080 && cp <= 0x07FF) {
                o.push(0xC0 | ((cp >> 6) & 0x1F))
                o.push(0x80 | ((cp >> 0) & 0x3F))
              } else if (cp >= 0x0800 && cp <= 0xFFFF) {
                o.push(0xE0 | ((cp >> 12) & 0x0F))
                o.push(0x80 | ((cp >> 6) & 0x3F))
                o.push(0x80 | ((cp >> 0) & 0x3F))
              } else if (cp >= 0x10000 && cp <= 0x10FFFF) {
                o.push(0xF0 | ((cp >> 18) & 0x07))
                o.push(0x80 | ((cp >> 12) & 0x3F))
                o.push(0x80 | ((cp >> 6) & 0x3F))
                o.push(0x80 | ((cp >> 0) & 0x3F))
              }
            }

            len = s.length

            for (i = 0; i < len; i += 1) {
              cp = s.charCodeAt(i)

                            // Look for surrogate pairs
              if (cp >= 0xD800 && cp <= 0xDBFF) {
                i += 1
                if (i >= len) { throw new RangeError('Badly formed UTF-16 surrogate pair') }

                cp2 = s.charCodeAt(i)
                if (cp2 >= 0xDC00 && cp2 <= 0xDFFF) {
                  cp = ((cp & 0x03FF) << 10 | (cp2 & 0x03FF)) + 0x10000
                } else {
                  throw new RangeError('Badly formed UTF-16 surrogate pair')
                }
              } else if (cp >= 0xDC00 && cp <= 0xDFFF) {
                throw new RangeError('Badly formed UTF-16 surrogate pair')
              }
              utf8(cp)
            }

            return o
          },

          decode: function (a) {
                        /* jslint bitwise: false, plusplus: false */
            var s = []
            var offset = 0
            var len = a.length
            var cp

            function cb () {
              if (offset >= len) { throw new RangeError('Truncated UTF-8 sequence') }

              var b = a[offset++]
              if (b < 0x80 || b > 0xBF) { throw new RangeError('Invalid UTF-8 continuation byte') }

              return b & 0x3F
            }

            while (offset < len) {
              cp = a[offset++]
              if (cp >= 0xC2 && cp <= 0xDF) {
                cp = ((cp & 0x1F) << 6) | cb()
              } else if (cp >= 0xE0 && cp <= 0xEF) {
                cp = ((cp & 0x0F) << 12) | (cb() << 6) | cb()
              } else if (cp >= 0xF0 && cp <= 0xF4) {
                cp = ((cp & 0x07) << 18) | (cb() << 12) | (cb() << 6) | cb()
              } else if (!(cp >= 0x00 && cp <= 0x7F)) {
                throw new RangeError('Invalid UTF-8 lead byte')
              }

                            // Surrogate-pair encode
              if (cp >= 0x10000) {
                cp -= 0x10000
                s.push(String.fromCharCode(0xD800 + ((cp >> 10) & 0x3FF)),
                                       String.fromCharCode(0xDC00 + (cp & 0x3FF)))
              } else {
                s.push(String.fromCharCode(cp))
              }
            }

            return s.join('')
          }
        },

        'BASE64': {
                    // NOTE: encode/decode sense is reversed relative to normal usage;
                    // a base64 encoder typically encodes binary to a string.
          encode: function (s) { // string -> binary
            s = s.replace(/\s+/g, '') // remove whitespace

            try {
              return binstrToArray(window.atob(s))
            } catch (e) {
              throw new RangeError('Invalid base64 sequence')
            }
          },

          decode: function (a) { // binary -> string
            return window.btoa(arrayToBinstr(a))
          }
        },

        'BASE16': {
          encode: function (s) {
            s = s.replace(/\s+/g, '') // remove whitespace

            if (!/^([0-9A-Fa-f]{2})*$/.test(s)) {
              throw new RangeError('Invalid base16 sequence')
            }

            var out = []
            var i
            var o
            var len = s.length
            for (i = 0, o = 0; i < len; o += 1, i += 2) {
              out[o] = parseInt(s.substring(i, i + 2), 16)
            }
            return out
          },

          decode: function (a) {
            var s = []
            var len = a.length
            var i
            var c
            for (i = 0; i < len; i += 1) {
              c = a[i]
              s.push(('00' + c.toString(16)).slice(-2).toUpperCase())
            }
            return s.join('')
          }
        }
      }

      function getEncoding (name) {
        name = String(name).toUpperCase()
        if (encodings.hasOwnProperty(name)) {
          return encodings[name]
        }
        throw new RangeError('unknown encoding: ' + name)
      }

      Binary = function () {
                /* jslint bitwise: false */

        var array, binary, string, encoding

                // new Binary()
        if (arguments.length === 0) {
          this.octets = []
        } else if (arguments.length >= 1 && // new Binary( array )
                         arguments[0] instanceof Array) {
          array = arguments[0]
          this.octets = array.map(function (b) { return (b >>> 0) & 0xff })
        } else if (arguments.length >= 1 && // new Binary( binary )
                         arguments[0] instanceof Binary) {
          binary = arguments[0]
          this.octets = binary.octets.slice()
        } else if (arguments.length >= 2 && // new Binary( string, encoding )
                         typeof arguments[0] === 'string' &&
                         typeof arguments[1] === 'string') {
          string = arguments[0]
          encoding = arguments[1]

          this.octets = getEncoding(encoding).encode(string)
        } else {
          throw new TypeError('Unexpected argument type(s)')
        }
      }

            // toString()
            // toString( encoding )
      Binary.prototype.toString = function (encoding) {
        if (arguments.length === 0) {
          return '[Binary ' + this.octets.length + ']'
        } else {
          encoding = String(encoding)
          return getEncoding(encoding).decode(this.octets)
        }
      }

            // toJSON()
      Binary.prototype.toJSON = function () {
                // return this.octets;
                // per mailing list proposal, serialize as base64 instead
                // to take advantage of string<->binary conversions
                // *TODO: Update when Type System draft is updated
                // *TODO: Consider moving this to JSON.stringify() call
        return this.toString('BASE64')
      }

            // toArray()
      Binary.prototype.toArray = function () {
        return this.octets.slice() // Make a copy
      }
    }())
  }

    //
    // LLSD.parse( content_type, string )
    // LLSD.parseBinary( Binary )
    // LLSD.parseXML( string )
    // LLSD.parseJSON( string )
    // LLSD.parseNotation( string ) // (if LL_LEGACY set)
    //
    // LLSD.format( content_type, data )
    // LLSD.formatBinary( data ) // Binary
    // LLSD.formatXML( data ) // string
    // LLSD.formatJSON( data ) // string
    // LLSD.formatNotation( data ) // (if LL_LEGACY set)
    //
    // LLSD.asUndefined( value )
    // LLSD.asBoolean( value )
    // LLSD.asInteger( value )
    // LLSD.asReal( value )
    // LLSD.asString( value )
    // LLSD.asUUID( value )
    // LLSD.asDate( value )
    // LLSD.asURI( value )
    // LLSD.asBinary( value )
    //
    // Helpers:
    //
    // LLSD.parseISODate(str) // returns date or throws if invalid
    // LLSD.MAX_INTEGER // maximum 32-bit two's complement value
    // LLSD.MIN_INTEGER // minimum 32-bit two's complement value
    // LLSD.isNegativeZero(n) // true if n is negative zero
    // LLSD.isInt32(n) // true if n can be represented as an LLSD integer
    // LLSD.type(v) // one of 'undefined', 'string', 'boolean', 'integer',
    //                        'real', 'date', 'uri', 'uuid', 'binary',
    //                        'array', 'map'
    // LLSD.parseFloat(str) // following Appendix A of spec
    // LLSD.formatFloat(val) // following Appendix A of spec
    //

  if (!LLSD) {
    LLSD = {}

        // Parse ISO 8601 dates into ECMAScript Date objects
        //
        // Matches "YY-MM-DDThh:mm:ssZ" or "YY-MM-DDThh:mm:ss.fffZ".
        // Throws an error if the string doesn't match.
    LLSD.parseISODate = function (str) {
      var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(str)
      if (m) {
        return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]))
      } else {
        throw new Error('Invalid UUID string format')
      }
    }

    LLSD.MIN_INTEGER = -2147483648
    LLSD.MAX_INTEGER = 2147483647

    LLSD.isNegativeZero = function (a) {
      return (a === 0) && ((1 / a) === -Infinity)
    }

    LLSD.isInt32 = function (a) {
            /* jslint bitwise: false */
      return (a >> 0) === a
    }

    LLSD.parseFloat = function (str) {
      switch (str) {
        case '-Infinity': return -Infinity
        case '-Zero': return -0.0
        case '0.0': return 0.0
        case '+Zero': return 0.0
        case 'Infinity': // *TODO: not in the spec; should it be?
        case '+Infinity': return Infinity
        case 'NaNS': return NaN
        case 'NaNQ': return NaN
        default:
                    // *TODO: Update when the incorrect ABNF in Appendix A ABNF is corrected
                    // if (/^(([1-9][0-9]*(\.[0-9]*)?)|(0\.0*[1-9][0-9]*))E(0|-?[1-9][0-9]*)$/.test(str)) {
          if (/^[-+]?([0-9]*\.?[0-9]+)([eE][-+]?[0-9]+)?$/.test(str)) {
            return parseFloat(str)
          }
          break
      }

            // otherwise no return value (undefined)
    }

    LLSD.formatFloat = function (f) {
      if (isNaN(f)) {
        return 'NaNS'
      } else if (f === Infinity) {
        return '+Infinity'
      } else if (f === -Infinity) {
        return '-Infinity'
            // else if (f === 0 && 1 / f === Infinity) {
            //    return '+Zero'; // *TODO: Per spec, but is this desired?
            // }
      } else if (LLSD.isNegativeZero(f)) {
        return '-Zero' // return '-0.0'; // *TODO: Per spec, '-Zero', but is this desired?
      } else {
        return String(f)
      }
    }

        // Return the LLSD type for a value; one of:
        //     'undefined', 'string', 'boolean', 'integer', 'real',
        //     'date', 'uri', 'uuid', 'binary', 'array', 'map'
        //
    LLSD.type = function (value) {
      switch (typeof value) {
        case 'boolean':
          return 'boolean'

        case 'number':
          return LLSD.isInt32(value) && !LLSD.isNegativeZero(value) ? 'integer' : 'real'

        case 'string':
          return 'string'

        case 'object':
          if (value === null) { return 'undefined' }
          if (value instanceof UUID) { return 'uuid' }
          if (value instanceof Date) { return 'date' }
          if (value instanceof URI) { return 'uri' }
          if (value instanceof Binary) { return 'binary' }
          if (value instanceof Array) { return 'array' }
          return 'map'

        case 'undefined':
          return 'undefined'

        default:
          return 'undefined'
      }
    }

        /// /////////////////////////////////////////////////////////
        //
        // Parsers/Formatters
        //
        /// /////////////////////////////////////////////////////////

        // Parses an XML serialization of LLSD into the corresponding
        // ECMAScript object data structure.
        //
    LLSD.parseXML = function (xmltext) {
      var xmldoc

      if (window.DOMParser) {
        xmldoc = (new window.DOMParser()).parseFromString(xmltext, 'text/xml')
      } else if (window.ActiveXObject) {
        xmldoc = new window.ActiveXObject('Microsoft.XMLDOM')
        xmldoc.async = 'false'
        xmldoc.loadXML(xmltext)
      } else {
        throw new Error('No XML DOM Parser available')
      }

      if (xmldoc.documentElement.nodeName !== 'llsd') { throw new Error('Expected <llsd> as root element') }
      if (xmldoc.documentElement.childNodes.length !== 1) { throw new Error('Expected one child of root element') }

      function processElement (elem) {
        function nodeText (node) {
          var NODE_TEXT = 3
          var child

          if (!node.hasChildNodes()) { return '' }
          if (node.childNodes.length > 1) { throw new Error('Expected single child of: ' + node.nodeName) }
          child = node.firstChild
          if (child.nodeType !== NODE_TEXT) { throw new Error('Expected text node child of: ' + node.nodeName) }

          return child.data
        }

        var child, map, key, encoding, array

        switch (elem.nodeName) {
          case 'undef': return null
          case 'boolean': return LLSD.asBoolean(nodeText(elem))
          case 'integer': return LLSD.asInteger(nodeText(elem))
          case 'real': return LLSD.asReal(nodeText(elem))
          case 'uuid':
                        // return new UUID(nodeText(elem)); // If invalid should raise error
            return LLSD.asUUID(nodeText(elem)) // If invalid should yield default
          case 'string': return nodeText(elem)
          case 'date':
                        // return LLSD.parseISODate(text); // If invalid should raise error
            return LLSD.asDate(nodeText(elem)) // If invalid should yield default
          case 'uri':
                        // return new URI(nodeText(elem)); // If invalid should raise error
            return LLSD.asURI(nodeText(elem)) // If invalid should yield default
          case 'binary':
            encoding = elem.getAttribute('encoding')
            if (encoding && encoding !== 'base64') { throw new Error('Unexpected encoding on <binary>: ' + encoding) }
                        // return new Binary(nodeText(elem)); // If invalid should raise error
            return LLSD.asBinary(nodeText(elem)) // If invalid should yield default
          case 'map':
            map = {}
            for (child = elem.firstChild; child; child = child.nextSibling) {
              if (child.nodeName !== 'key') { throw new Error('Expected <key> as child of <map>') }
              key = nodeText(child)
              child = child.nextSibling
              if (!child) { throw new Error('Missing sibling of <key> in <map>') }

              map[key] = processElement(child)
            }
            return map

          case 'array':
            array = []
            for (child = elem.firstChild; child; child = child.nextSibling) {
              array.push(processElement(child))
            }
            return array

          default:
            throw new Error('Unexpected element: ' + elem.nodeName)
        }
      }

      return processElement(xmldoc.documentElement.firstChild)
    }

    LLSD.formatXML = function (data) {
            // *TODO: Cross browser XML DOM generation

      var xml = []

      function writeValue (datum) {
        function xmlEscape (string) {
          return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }

        var i, key, keys

        switch (LLSD.type(datum)) {
          case 'undefined':
            xml.push('<undef/>')
            break

          case 'boolean':
            xml.push('<boolean>', LLSD.asString(datum), '</boolean>')
            break

          case 'integer':
            xml.push('<integer>', LLSD.asString(datum), '</integer>')
            break

          case 'real':
            xml.push('<real>', LLSD.asString(datum), '</real>')
            break

          case 'string':
            xml.push('<string>', xmlEscape(datum), '</string>')
            break

          case 'uuid':
            xml.push('<uuid>', LLSD.asString(datum), '</uuid>')
            break

          case 'date':
            xml.push('<date>', LLSD.asString(datum), '</date>')
            break

          case 'uri':
            xml.push('<uri>', LLSD.asString(datum), '</uri>')
            break

          case 'binary':
            xml.push('<binary>', LLSD.asString(datum), '</binary>')
            break

          case 'array':
            xml.push('<array>')
            for (i = 0; i < datum.length; i += 1) {
              writeValue(datum[i])
            }
            xml.push('</array>')
            break

          case 'map':
            xml.push('<map>')
            keys = Object.keys(datum)
            for (i = 0; i < keys.length; i += 1) {
              key = keys[i]
              xml.push('<key>', xmlEscape(key), '</key>')
              writeValue(datum[key])
            }
            xml.push('</map>')
            break
        }
      }

      xml.push('<llsd>')
      writeValue(data)
      xml.push('</llsd>')
      return xml.join('')
    }

    LLSD.OCTET_UNDEFINED = '!'.charCodeAt(0)
    LLSD.OCTET_BOOLEAN_TRUE = '1'.charCodeAt(0)
    LLSD.OCTET_BOOLEAN_FALSE = '0'.charCodeAt(0)
    LLSD.OCTET_INTEGER = 'i'.charCodeAt(0)
    LLSD.OCTET_REAL = 'r'.charCodeAt(0)
    LLSD.OCTET_STRING = 's'.charCodeAt(0)
    LLSD.OCTET_UUID = 'u'.charCodeAt(0)
    LLSD.OCTET_DATE = 'd'.charCodeAt(0)
    LLSD.OCTET_URI = 'l'.charCodeAt(0)
    LLSD.OCTET_BINARY = 'b'.charCodeAt(0)
    LLSD.OCTET_ARRAY = '['.charCodeAt(0)
    LLSD.OCTET_ARRAY_CLOSE = ']'.charCodeAt(0)
    LLSD.OCTET_MAP = '{'.charCodeAt(0)
    LLSD.OCTET_MAP_KEY = 'k'.charCodeAt(0)
    LLSD.OCTET_MAP_CLOSE = '}'.charCodeAt(0)

        // Parses a Binary serialization of LLSD into the corresponding
        // ECMAScript object data structure.
        //
    LLSD.parseBinary = function (binary) {
      if (typeof binary === 'string') {
        binary = new Binary(binary, 'BASE64')
      } else if (binary instanceof Array) {
        binary = new Binary(binary)
      }

      var octets = binary.toArray()
      var offset = 0
      var value

      function eod () {
        return offset >= octets.length
      }
      function read (n) {
        if (offset + n > octets.length) { throw new Error('Unexpected end of data') }
        var result = octets.slice(offset, offset + n)
        offset += n
        return result
      }

      function readOctet () { return read(1)[0] }

      function readU32 () {
        var u8array = new Uint8Array(read(4))
        var dv = new DataView(u8array.buffer)

        return dv.getUint32(0)
      }

      function readS32 () {
        var u8array = new Uint8Array(read(4))
        var dv = new DataView(u8array.buffer)

        return dv.getInt32(0)
      }

      function readF64 () {
        var u8array = new Uint8Array(read(8))
        var dv = new DataView(u8array.buffer)

        return dv.getFloat64(0)
      }

      function readString () {
        var len = readU32()
        return new Binary(read(len)).toString('UTF-8')
      }

      function readUUID () {
        return new UUID(read(16))
      }

      function readValue () {
        if (eod()) { throw new Error('Unexpected end of data') }

        var octet = readOctet()
        var i
        var len
        var array
        var map
        var key
        switch (octet) {
          case LLSD.OCTET_UNDEFINED:
            return null

          case LLSD.OCTET_BOOLEAN_FALSE:
            return false

          case LLSD.OCTET_BOOLEAN_TRUE:
            return true

          case LLSD.OCTET_INTEGER:
            return readS32()

          case LLSD.OCTET_REAL:
            return readF64()

          case LLSD.OCTET_STRING:
            return readString()

          case LLSD.OCTET_UUID:
            return readUUID()

          case LLSD.OCTET_DATE:
            return new Date(readF64() * 1000)

          case LLSD.OCTET_URI:
            return new URI(readString())

          case LLSD.OCTET_BINARY:
            len = readU32()
            return new Binary(read(len))

          case LLSD.OCTET_ARRAY:
            len = readU32()
            array = []
            for (i = 0; i < len; i += 1) {
              array.push(readValue())
            }
            if (readOctet() !== LLSD.OCTET_ARRAY_CLOSE) {
              throw new Error('Expected array close tag')
            }
            return array

          case LLSD.OCTET_MAP:
            len = readU32()

            map = {}
            for (i = 0; i < len; i += 1) {
              if (readOctet() !== LLSD.OCTET_MAP_KEY) {
                throw new Error('Expected map key tag')
              }
              key = readString()
              map[key] = readValue()
            }
            if (readOctet() !== LLSD.OCTET_MAP_CLOSE) {
              throw new Error('Expected map close tag')
            }
            return map

          default:
            throw new Error('Unexpected tag')
        }
      }

      value = readValue()
      if (!eod()) { throw new Error('Unexpected continuation of binary data') }

      return value
    }

    LLSD.formatBinary = function (data) {
      var octets = []

      function write (array) {
        var i
        if (array instanceof DataView) {
          for (i = 0; i < array.byteLength; i += 1) {
            octets.push(array.getUint8(i))
          }
        } else {
          for (i = 0; i < array.length; i += 1) {
            octets.push(array[i])
          }
        }
      }

      function writeOctet (octet) { write([octet]) }

      function writeU32 (u32) {
        var dv = new DataView(new ArrayBuffer(4))
        dv.setUint32(0, u32)
        write(dv)
      }

      function writeS32 (s32) {
        var dv = new DataView(new ArrayBuffer(4))
        dv.setInt32(0, s32)
        write(dv)
      }

      function writeF64 (f64) {
        var dv = new DataView(new ArrayBuffer(8))
        dv.setFloat64(0, f64)
        write(dv)
      }

      function writeString (string) {
        var bytes = new Binary(string, 'UTF-8').toArray()
        writeU32(bytes.length)
        write(bytes)
      }

      function writeValue (datum) {
        var len, i, bytes, keys, key

        switch (LLSD.type(datum)) {
          case 'undefined':
            writeOctet(LLSD.OCTET_UNDEFINED)
            break

          case 'boolean':
            writeOctet(datum ? LLSD.OCTET_BOOLEAN_TRUE : LLSD.OCTET_BOOLEAN_FALSE)
            break

          case 'integer':
            writeOctet(LLSD.OCTET_INTEGER)
            writeS32(datum)
            break

          case 'real':
            writeOctet(LLSD.OCTET_REAL)
            writeF64(datum)
            break

          case 'string':
            writeOctet(LLSD.OCTET_STRING)
            writeString(datum)
            break

          case 'uuid':
            writeOctet(LLSD.OCTET_UUID)
            write(datum.getOctets())
            break

          case 'date':
            writeOctet(LLSD.OCTET_DATE)
            writeF64(Number(datum) / 1000)
            break

          case 'uri':
            writeOctet(LLSD.OCTET_URI)
            writeString(String(datum))
            break

          case 'binary':
            writeOctet(LLSD.OCTET_BINARY)
            bytes = datum.toArray()
            writeU32(bytes.length)
            write(bytes)
            break

          case 'array':
            writeOctet(LLSD.OCTET_ARRAY)
            len = datum.length
            writeU32(len)
            for (i = 0; i < len; i += 1) {
              writeValue(datum[i])
            }
            writeOctet(LLSD.OCTET_ARRAY_CLOSE)
            break

          case 'map':
            keys = Object.keys(datum)

            writeOctet(LLSD.OCTET_MAP)
            len = keys.length
            writeU32(len)
            for (i = 0; i < len; i += 1) {
              key = keys[i]
              writeOctet(LLSD.OCTET_MAP_KEY)
              writeString(key)
              writeValue(datum[key])
            }
            writeOctet(LLSD.OCTET_MAP_CLOSE)
            break
        }
      }

      writeValue(data)

      return new Binary(octets)
    }

    if (LL_LEGACY) {
      LLSD.parseNotation = function (string) {
                // http://wiki.secondlife.com/wiki/LLSD#Notation_Serialization

        function error (errmsg) {
          throw new Error(errmsg)
        }

        function test (regex) {
          if (!(regex instanceof RegExp)) {
            regex = new RegExp('^' + regex)
          }
          var m = regex.exec(string)
          if (m) {
            string = string.substring(m[0].length)
            return m.length > 1 ? m[1] : m[0]
          }
                    // return undefined
        }

        function req (regex, errmsg) {
          var t = test(regex)
          if (t) { return t }
          error(errmsg)
        }

        function ws () {
          test(/^\s+/)
        }

        var reReal = /^([-+]?([0-9]*\.?[0-9]+)([eE][-+]?[0-9]+)?|[-+]?Infinity|NaN)/
        var reUUID = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
        var reDate = /^((\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z)/
        var value

        function parseValue () {
                    /* jslint regexp: false */
          var res, key

          ws()
          if (!string.length) { error('unexpected end-of-string') }
          if (test('!')) { return null }
          if (test('(1|true|TRUE|t|T)')) { return true }
          if (test('(0|false|FALSE|f|F)')) { return false }
          if (test('i')) {
            return parseInt(req('[-+]?[0-9]+', 'expected integer'), 10)
          }
          if (test('r')) {
            return parseFloat(req(reReal, 'expected real'))
          }
          if (test('u')) {
            return new UUID(req(reUUID, 'expected uuid'))
          }
          if (test('b')) {
            res = test('\\(([0-9]+)\\)')
            if (res) {
              res = parseInt(res, 10)
              res = req('"([\\s|\\S]{' + res + '})"', 'expected binary data')
              return new Binary(res, 'BINARY')
            }

            if (test('16')) {
              res = req('"([^"]*)"', 'expected binary data')
              return new Binary(res, 'BASE16')
            }

            if (test('64')) {
              res = req('"([^"]*)"', 'expected binary data')
              return new Binary(res, 'BASE64')
            }
            error('unexpected binary base')
          }
          if (test('s')) {
            res = parseInt(req('\\(([0-9]+)\\)', 'expected length'), 10)
            return req('"([\\s\\S]{' + res + '})"', 'expected string')
          }
          if (test('"')) {
            res = req(/^(([^"\\]|\\[\s\S])*)"/, 'expected string')
            return res.replace(/\\([\s\S])/g, '$1')
          }
          if (test("'")) {
            res = req(/^(([^'\\]|\\[\s\S])*)'/, 'expected string')
            return res.replace(/\\([\s\S])/g, '$1')
          }
          if (test('l')) {
            return new URI(req('"([^"]*)"', 'expected uri'))
          }
          if (test('d')) {
            req('"', 'expected quote')
            res = req(reDate, 'expected date')
            req('"', 'expected quote')
            return LLSD.parseISODate(res)
          }
          if (test('\\[')) {
            res = []
            ws()
            if (test('\\]')) { return res }
            while (true) {
              res.push(parseValue())
              ws()
              if (!test(',')) { break }
              ws()
            }
            req('\\]', 'expected value or close bracket')
            return res
          }
          if (test('{')) {
            res = {}
            ws()
            if (test('}')) { return res }
            while (true) {
              key = parseValue()
              if (typeof key !== 'string') { error('expected string') }
              ws()
              req(':', 'expected colon')
              ws()
              res[key] = parseValue()
              ws()
              if (!test(',')) { break }
              ws()
            }
            req('}', 'expected key or close brace')
            return res
          }
          error('unexpected token: ' + string.charAt(0))
        }

        value = parseValue()
        ws()
        if (string.length) { error('expected end-of-string, saw: ' + string) }
        return value
      }

      LLSD.formatNotation = function (data) {
        var out = []

        function writeString (value) {
          out.push('"', value.replace(/[\\]/g, '\\\\').replace(/["]/g, '\\"'), '"')
        }

        function writeValue (value) {
          var i, key, keys
          switch (LLSD.type(value)) {
            case 'undefined': out.push('!'); break
            case 'boolean': out.push(value ? '1' : '0'); break
            case 'integer': out.push('i', String(value)); break
            case 'real': out.push('r', String(value)); break
            case 'string': writeString(value); break
            case 'uuid': out.push('u', LLSD.asString(value)); break
            case 'date': out.push('d"', LLSD.asString(value), '"'); break
            case 'uri': out.push('l"', LLSD.asString(value), '"'); break
            case 'binary': out.push('b64"', LLSD.asString(value), '"'); break
            case 'array':
              out.push('[')
              for (i = 0; i < value.length; i += 1) {
                if (i !== 0) { out.push(',') }
                writeValue(value[i])
              }
              out.push(']')
              break

            case 'map':
              out.push('{')
              keys = Object.keys(value)
              for (i = 0; i < keys.length; i += 1) {
                if (i !== 0) { out.push(',') }
                key = keys[i]
                writeString(key)
                out.push(':')
                writeValue(value[key])
              }
              out.push('}')
              break
          }
        }

        writeValue(data)
        return out.join('')
      }
    }

    LLSD.parseJSON = function (text) {
      if (JSON && JSON.parse && typeof JSON.parse === 'function') {
        return JSON.parse(text)
      } else {
        throw new Error('Use a local copy of json2.js from json.org for JSON serialization')
      }
    }

    LLSD.formatJSON = function (data) {
      if (JSON && JSON.stringify && typeof JSON.stringify === 'function') {
        return JSON.stringify(data, function (k, v) {
                    // JSON does not support +/-Infinity or NaN or distinguish -0; format as strings
          if (typeof v === 'number' && (!isFinite(v) || LLSD.isNegativeZero(v))) {
            return LLSD.formatFloat(v)
          }
          return v
        })
      } else {
        throw new Error('Use a local copy of json2.js from json.org for JSON serialization')
      }
    }

    LLSD.MIMETYPE_XML = 'application/llsd+xml'
    LLSD.MIMETYPE_JSON = 'application/llsd+json'
    LLSD.MIMETYPE_BINARY = 'application/llsd+binary'

    LLSD.parse = function (contentType, input) {
      switch (contentType) {
        case LLSD.MIMETYPE_XML:
          return LLSD.parseXML(input)

        case LLSD.MIMETYPE_JSON:
          return LLSD.parseJSON(input)

        case LLSD.MIMETYPE_BINARY:
          return LLSD.parseBinary(input)

        default:
          throw new Error('Unsupported content-type: ' + contentType)
      }
    }

    LLSD.format = function (contentType, data) {
      switch (contentType) {
        case LLSD.MIMETYPE_XML:
          return LLSD.formatXML(data)

        case LLSD.MIMETYPE_JSON:
          return LLSD.formatJSON(data)

        case LLSD.MIMETYPE_BINARY:
          return LLSD.formatBinary(data)

        default:
          throw new Error('Unsupported content-type: ' + contentType)
      }
    }

        /// /////////////////////////////////////////////////////////
        //
        // Conversions
        //
        /// /////////////////////////////////////////////////////////

    LLSD.asUndefined = function (value) {
      return null
    }

    LLSD.asBoolean = function (value) {
      switch (LLSD.type(value)) {
        case 'boolean': return value
        case 'integer': return value !== 0
        case 'real': return value !== 0 && !isNaN(value)
        case 'string': return value.length > 0
        default: return false
      }
    }

    LLSD.asInteger = function (value) {
      switch (LLSD.type(value)) {
        case 'boolean': return value ? 1 : 0
        case 'integer': return value
        case 'string':
          value = LLSD.parseFloat(value)
          break

        case 'real':
          break
        default: return 0
      }

      value = isNaN(value) ? 0 : Math.round(value)

      if (value > LLSD.MAX_INTEGER) {
        return LLSD.MAX_INTEGER
      } else if (value < LLSD.MIN_INTEGER) {
        return LLSD.MIN_INTEGER
      } else {
        return value
      }
    }

    LLSD.asReal = function (value) {
      switch (LLSD.type(value)) {
        case 'integer': return value
        case 'real': return value
        case 'string': return LLSD.parseFloat(value)
        case 'boolean': return value ? 1.0 : 0.0
        default: return 0.0
      }
    }

    LLSD.asString = function (value) {
      switch (LLSD.type(value)) {
        case 'string': return value
        case 'boolean': return value ? 'true' : ''
        case 'integer': return String(value)
        case 'real': return LLSD.formatFloat(value)
        case 'uuid': return String(value)
        case 'date': return value.toJSON()
        case 'uri': return String(value)
        case 'binary': return value.toString('BASE64')
        default: return ''
      }
    }

    LLSD.asUUID = function (value) {
      switch (LLSD.type(value)) {
        case 'uuid': return value
        case 'string':
          try {
            return new UUID(value)
          } catch (e) {
          }
          break
      }
      return new UUID()
    }

    LLSD.asDate = function (value) {
      switch (LLSD.type(value)) {
        case 'date': return value
        case 'string':
          try {
            return LLSD.parseISODate(value)
          } catch (e) {
          }
          break
      }
      return new Date(0)
    }

    LLSD.asURI = function (value) {
      switch (LLSD.type(value)) {
        case 'uri': return value
        case 'string':
          try {
            return new URI(value)
          } catch (e) {
          }
          break
      }
      return new URI()
    }

    LLSD.asBinary = function (value) {
      switch (LLSD.type(value)) {
        case 'binary': return value
        case 'string':
          try {
            return new Binary(value, 'BASE64')
          } catch (e) {
          }
          break
      }
      return new Binary()
    }
  }
}())

// Added for Andromeda

export default LLSD
export const data = {
  URI,
  UUID,
  Binary
}
