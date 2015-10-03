#!/usr/bin/env node
var punycode = require('punycode');
let tt = require('.');

let req = {};
let args = [];
let alias = {e: 'each', d: 'detect', r: 'range', h: 'help', v: 'version'};

process.argv.slice(2).forEach(function (arg) {
  if (arg.indexOf('--') === 0) {
    req[arg.slice(2)] = true;
  } else if (arg.indexOf('-') === 0) {
    arg.slice(1).split('').forEach(t => req[alias[t] || t] = true);
  } else {
    args.push(arg);
  }
});

function help() {
  console.log(`
  Usage:
    -e    each
    -d    detect
    -r    range

    u03FD, \\u03FD, u{533FD} ... will all take as Unicode code point.

    tty-text text           # get text size
    tty-text -e text        # get each text's char's size
    tty-text -d text        # detect the text size
    tty-text -d -e text     # detect each text's char's size
    tty-text -r from-to     # get code point range's size
  `);
}

if (req.version) {
  console.log(require('./package').version);
} else if (req.help) {
  help();
} else {
  let text = '';
  if (req.range) {
    args.forEach(arg => {
      let parts = arg.split('-').map(it => parseInt(it));
      if (!parts.some(isNaN)) {
        if (parts.length === 1) text += String.fromCodePoint(parts[0]);
        if (parts.length === 2) for (let i = parts[0]; i <= parts[1]; i++) text += String.fromCodePoint(i);
      }
    });
  } else {
    text = args.join('')
      .replace(/[\\]*u(\{?[\dA-Fa-f]{4,5})\}?/g, (r, hex) => String.fromCodePoint(parseInt('0x' + hex)));
  }

  if (req.detect) {

    if (req.each) {
      tt.detectEach(text, function (err, chars) {
        if (err) throw err;
        chars.forEach(c => {
          console.log('Code Point: %d, Hex: 0x%s, Size: %d, Ambiguous: %s, Symbol: %s',
            c.codePoint, c.codePoint.toString(16), c.size, tt.isAmbiguousEastAsianChar(c.codePoint) ? 'yes' : 'no', c.symbol);
        });
      });
    } else {
      tt.detect(text, function (err, len) {
        if (err) throw err;
        console.log('Size %d for %s', len, JSON.stringify(text));
      });
    }

  } else {

    if (req.each) {
      punycode.ucs2.decode(text).forEach(cp => {
        console.log('Code Point: %d, Hex: 0x%s, Size: %d, Ambiguous: %s, Symbol: %s',
          cp, cp.toString(16), tt.size(cp), tt.isAmbiguousEastAsianChar(cp) ? 'yes' : 'no', punycode.ucs2.encode([cp]));
      });
    } else {
      console.log('Size %d for %s', tt.size(text), JSON.stringify(text));
    }

  }
}

