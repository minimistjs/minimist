var parse = require('../');
var test = require('tape');

test('proto pollution', function (t) {
    var argv = parse(['--__proto__.x','123']);
    t.equal({}.x, undefined);
    t.equal(argv.__proto__.x, 123);
    t.end();
});
