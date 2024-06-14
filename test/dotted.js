'use strict';

var parse = require('../');
var test = require('tape');

test('dotted alias', function (t) {
	var argv = parse(['--a.b', '22'], { default: { 'a.b': 11 }, alias: { 'a.b': 'aa.bb' } });
	t.equal(argv.a.b, 22);
	t.equal(argv.aa.bb, 22);
	t.end();
});

test('dotted default', function (t) {
	var argv = parse('', { default: { 'a.b': 11 }, alias: { 'a.b': 'aa.bb' } });
	t.equal(argv.a.b, 11);
	t.equal(argv.aa.bb, 11);
	t.end();
});

test('dotted default with no alias', function (t) {
	var argv = parse('', { default: { 'a.b': 11 } });
	t.equal(argv.a.b, 11);
	t.end();
});

test('dotted array', function (t) {
	var argv = parse(['--a.1.foo', '11']);

	t.notOk(Array.isArray(argv.a));

	t.notOk(0 in argv.a);

	t.equal(argv.a[1].foo, 11);

	t.end();
});

test('dotted notation with array in square bracket syntax', function (t) {
	var argv = parse(['--a[1][0].foo', 'x', '--a[1][2]', '42']);
	t.ok(Array.isArray(argv.a));
	t.notOk(0 in argv.a);
	t.ok(Array.isArray(argv.a[1]));
	t.equal(argv.a[1][0].foo, 'x');
	t.notOk(1 in argv.a[1]);
	t.equal(argv.a[1][2].foo, 42);
	t.end();
});
