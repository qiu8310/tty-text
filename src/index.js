var sizeData = require('../data/size.json');
var ambRange = require('../data/amb.json');
var punycode = require('punycode');
var cp = require('./cp');

var cpRange;
var isWin = require('os').platform() === 'win32';
if (isWin) {
  try {
    cpRange = require('../data/cp' + cp() + '.json');
  } catch (e) {};
}

var self = module.exports = require('./detect.js');


function _isCodePointInRanges(codePoint, ranges) {
  return ranges.some(function (range) {
    if (range.length === 1) return codePoint === range;
    return codePoint >= range[0] && codePoint <= range[1];
  });
}

self.isAmbiguousEastAsianChar = function (codePoint) {
  return _isCodePointInRanges(codePoint, ambRange);
};

// https://mathiasbynens.be/notes/javascript-unicode#accounting-for-other-combining-marks
// https://github.com/mathiasbynens/esrever/blob/master/scripts/export-data.js
self.isCombiningMarkChar = function (codePoint) {
  return _isCodePointInRanges(codePoint, [
    [0x300, 0x36F],
    [0x1AB0, 0x1AFF],
    [0x20D0, 0x20FF],
    [0x1DC0, 0x1DFF],
    [0xFE20, 0xFE2F]
  ]);
};

// https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs
self.isSurrogatePairsChar = function (codePoint) {
  return codePoint > 0xFFFF;
};

self.codePointSize = function (codePoint, ambsize) {
  if ([9, 10, 11, 12, 13].indexOf(codePoint) >= 0)
    throw new Error('Code point ' + codePoint+ ' not allowed.');

  if (isWin && cpRange) {
    if (!_isCodePointInRanges(codePoint, cpRange)) return 1; // window 对不支持的字符都使用了默认的占一个位置的字符替代
    else if (_isCodePointInRanges(codePoint, ambRange)) return 2;
  }

  if (ambsize === 2 && _isCodePointInRanges(codePoint, ambRange)) return ambsize;

  for (var size in sizeData) {
    if (sizeData.hasOwnProperty(size) && _isCodePointInRanges(codePoint, sizeData[size])) {
      return parseInt(size, 10);
    }
  }

  return 1;
}

// Refer from `ansi-regex` npm package
var ANSI_REGEXP = /[\u001b\u009b]([[()#;?]*)([0-9]{1,4}(?:;[0-9]{0,4})*)?([0-9A-ORZcf-nqry=><])/g;

// WARN: ignore 9 => \t, 11 => \v, 12 => \f, 10 => \n, 13 => \r
self.size = function (any, ambsize) {
  if (typeof any === 'string') {
    return punycode.ucs2.decode(any.replace(ANSI_REGEXP, ''))
      .map(function (cp) { return self.codePointSize(cp, ambsize); })
      .reduce(function (sum, i) { return sum + i; }, 0);
  } else if (typeof any === 'number') {
    return self.codePointSize(any, ambsize);
  }

  throw new Error('Not support argument.');
};
