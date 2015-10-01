# tty-text

获取字符串在命令行的真实长度，而不是用简单的 string.length 来得到的长度。


## Usage


**注意** 

* 在调用 text 或 words 时，不能并行执行，否则前面的会影响到后面的结果
* 在回调没有执行完成之前，不要用 console.log 或 console.error 来输出任何内容


```js
var tt = require('tty-text');

// 获取字符串在命令行上显示的长度（不支持大量的文字，如超过一整个屏幕）
// 注意：使用前尽量 clear 下屏幕内容，因为如果不 clear，通过命令得到的当前行数总是最后一行
//      这样很容易影响长度的计算
tt.text('some text', function (err, textLength) {
  // ...
});


// 计算字符串中每个字符的长度，支持所有 Unicode 字符
// 使用了 punycode 库
tt.words('some text', function (err, words) {
  // words is something like this: [{word: 's', codePoint: 115, length: 1}, ...]
});

```

## Example


```js

var tt = require('tty-text');

var text = 'e中💩';

tt.text(text, function (err, len) {
  console.log('字符串 "%s" 的长度是 %d\n', text, len);

  tt.words(text, function (err, words) {
    words.forEach(function (w) {
      console.log('字符 "%s" 的 CodePoint 是 %d, 长度是 %d', w.word, w.codePoint, w.length);
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








