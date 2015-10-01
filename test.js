var tt = require('./');

var text = 'en\u0303中💩\u2661';

tt.text(text, function (err, len) {
  console.log('字符串 " %s " 的长度是 %d\n', text, len);

  tt.words(text, function (err, words) {
    words.forEach(function (w) {
      console.log('字符 " %s " 的 CodePoint 是 %d, 长度是 %d', w.word, w.codePoint, w.length);
    });
  });

});