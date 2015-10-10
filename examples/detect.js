var tt = require('../src/detect');

var text = 'en\u0303中💩\u2661';

tt.detectShortText(text, function (err, len) {
  console.log('字符串 " %s " 的长度是 %d\n', text, len);

  tt.detectEach(text, function (err, chars) {
    chars.forEach(function (c) {
      console.log('字符 " %s " 的 CodePoint 是 %d, 长度是 %d', c.symbol, c.number, c.size);
    });
  });

});
