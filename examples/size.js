var tt = require('../');


var tests = ['e', '\u0303', '中', '💩', '\u2661']

for (var i = 0; i < tests.length; i++) {
  console.log(tests[i], 'size is', tt.size(tests[i]));
}

console.log(tt.size(''));
