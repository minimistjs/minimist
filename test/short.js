var parse = require('../');
var test = require('tape');

test('numeric short args', function (t) {
    t.plan(2);
    t.deepEqual(parse([ '-n123' ]), { n: 123, _: [] });
    t.deepEqual(
        parse([ '-123', '456' ]),
        { 1: true, 2: true, 3: 456, _: [] }
    );
});
