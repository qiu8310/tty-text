# tty-text

获取字符串在命令行的真实长度，而不是用简单的 string.length 来得到的长度。


## API

* detech(text, callback)
* detechEach(text, callback)
* size(textOrNumber, [ambsize])
  
  **Not support characters whoes code point in [9, 10, 11, 12, 13].**


**Other bonus**

* isCombiningMarkChar(codePoint)
* isZeroControlChar(codePoint)
* isEastAsianWideChar(codePoint)
* isAmbiguousEastAsianChar(codePoint)
* isSurrogatePairsChar(codePoint)
* codePointSize(codePoint)


## Usage


**注意** 

* 在调用 text 或 words 时，不能并行执行，否则前面的会影响到后面的结果
* 在回调没有执行完成之前，不要用 console.log 或 console.error 来输出任何内容


```js
var tt = require('tty-text');

// 获取字符串在命令行上显示的长度（不支持大量的文字，如超过一整个屏幕）
// 注意：使用前尽量 clear 下屏幕内容，因为如果不 clear，通过命令得到的当前行数总是最后一行
//      这样很容易影响长度的计算
tt.detect('some text', function (err, len) {
  // ...
});


// 计算字符串中每个字符的长度，支持所有 Unicode 字符
// 使用了 punycode 库
tt.detechEach('some text', function (err, chars) {
  // chars is something like this: [{symbol: 's', codePoint: 115, size: 1}, ...]
});


tt.size('some text'); // => 9

tt.size(96); // => 1

```

## Example


```js

var tt = require('../src/detect');

var text = 'en\u0303中💩\u2661';

tt.detect(text, function (err, len) {
  console.log('字符串 " %s " 的长度是 %d\n', text, len);

  tt.detectEach(text, function (err, chars) {
    chars.forEach(function (c) {
      console.log('字符 " %s " 的 CodePoint 是 %d, 长度是 %d', c.symbol, c.codePoint, c.size);
    });
  });

});

```



## 扩展知识

1. 装饰符号 `e.g: n\u0303 => ñ`

  像这种由两个字符组成的字符串的长度只有 1，其中 `\u0303` 只是装饰符号，它的长度是 0。

  在英文里叫它 [Combining Marks](https://mathiasbynens.be/notes/javascript-unicode#accounting-for-other-combining-marks)


2. Astral Symbols `e.g: \uD83D\uDCA9 => 💩`

  JS 表示 x0000 - xFFFF 之前的字符只需要使用一个字节就行，但 Unicode 总共有 x10FFFF 个字符，
  所以要表示超过了 xFFFF 的字符，在 ES5 之前就采用了 [Surrogate Pairs](https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs) 的表示法，
  而它会导致你在用 string.length 时得到 2，而它实际只是一个字符而已。

  所以在 ES6 中可以采用 `\u{1F4A9}` 这种统一的写法

  [更多详细介绍参考这里](https://mathiasbynens.be/notes/javascript-unicode#accounting-for-other-combining-marks)

3. 东亚模糊字体 `\u2661 => ♡ `

  英文里叫它 `East Asian Ambiguous Character Width`

  每个终端上都可以配置 ”是否将此类字体设置成 Double 宽度“，所以此类字体在不同的终端上宽度可能也会不一样。



## 链接

* East Asian Width [文档](http://unicode.org/reports/tr11/) [数据](http://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt)
* [ANSI escape code](https://en.wikipedia.org/wiki/ANSI_escape_code)
* [ASCII 控制字符](https://en.wikipedia.org/wiki/C0_and_C1_control_codes)
* [JavaScript Unicode](https://mathiasbynens.be/notes/javascript-unicode#accounting-for-other-combining-marks)




