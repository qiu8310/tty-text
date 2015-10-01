// 灵感来自于 ansi 模块

var tty = require('tty');
var ts = require('tty-size');
var punycode = require('punycode');

// https://en.wikipedia.org/wiki/ANSI_escape_code
var prefix = '\x1b[';
var dsr = prefix + '6n'; // 会转义成类似于 "\u001b[35;1R" 的字符串，其中 35 是当前光标行号，1 是列号

var size, writer;

function _check(callback) {
  writer = process.stdin;

  if (!writer.isTTY) {
    callback(new Error('process.stdin stream should be tty.'));
    return false;
  }

  try {
    size = ts();
  } catch (e) {
    callback(new Error('process.stdout and process.stderr at lease one should be tty.'));
    return false;
  }

  return true;
}


// 清除 stdin 输出的内容
// 将所有 tty 坐标回退到上次位置
function _clear(pos) {
  [process.stdin, process.stdout, process.stdin].forEach(function (stream) {
    if (stream.isTTY) {
      stream.write(prefix + pos.row + ';' + pos.col + 'H' + prefix + 'J');
    }
  });
}


exports.text = function (text, callback) {
  if (_check(callback)) {
    _write(dsr + text + dsr, function (str) {
      // 匹配首尾的类似此类字符串 
      var matches = str.match(/^\u001b\[\d+;\d+R|\u001b\[\d+;\d+R$/g);

      if (!matches) return callback(new Error('PARSE_ERROR'));
      
      var pos = matches.map(_parseDSR);
      _clear(pos[0]);
      callback(null, _caculateLength(pos[0], pos[1]));
    });
  }
};

exports.words = function (text, callback) {
  if (_check(callback)) {

    var codePoints = punycode.ucs2.decode(text);
    var words = codePoints.map(function (cp) { return punycode.ucs2.encode([cp]); });

    _write(dsr + words.join(dsr) + dsr, function (b) {
      var matches = b.match(/\u001b\[\d+;\d+R/g);

      if (!matches || matches.length !== words.length + 1) return callback(new Error('PARSE_ERROR'));

      matches = matches.map(_parseDSR);
      _clear(matches[0]);
      callback(null, words.map(function (word, i) {
        return {
          word: word,
          codePoint: codePoints[i],
          length: _caculateLength(matches[i], matches[i + 1])
        };
      }));
    });
  }
};




function setRawMode(mode) {
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(mode);
  } else {
    tty.setRawMode(mode);
  }
}

function _parseDSR(dsr) {
  var parts = dsr.slice(2, -1).split(';').map(Number);
  return {row: parts[0], col: parts[1]};
}

function _caculateLength(start, end) {
  // 在同一行上，并且最后一个坐标的横坐标小于开始的，说明换过行，但在 TTY 上如果是最后一行，它只会向上滚动，行号不变
  if (start.row === end.row && start.col > end.col) {
    return size.width - start.col + end.col;
  } else {
    return (end.row - start.row) * size.width + end.col - start.col;
  }
}

function _write(text, callback) {
  setRawMode(true);
  process.stdin.resume();

  process.stdin.once('data', function(chunk) {
    setRawMode(false);
    process.stdin.pause();

    callback(chunk.toString());
  });

  process.stdin.write(text);
}

