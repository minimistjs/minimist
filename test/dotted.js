'use strict';

var parse = require('../');
var test = require('tape');

test('dotted values', function (t) {
	t.deepEqual(parse(['--foo.bar=3']), { _: [], foo: { bar: 3 } });
	t.deepEqual(parse(['--foo.bar', '3']), { _: [], foo: { bar: 3 } });
	t.deepEqual(parse(['--foo.bar=3', '--foo.baz.qux=4']), {
		_: [], foo: { bar: 3, baz: { qux: 4 } },
	});
	t.end();
});

test('repeated dotted values', function (t) {
	t.deepEqual(parse(['--foo.bar=3', '--foo.bar=4', '--foo.bar=5']), {
		_: [], foo: { bar: [3, 4, 5] },
	});
	t.end();
});

test('dotted strings', function (t) {
	t.deepEqual(parse(['--foo.bar=3'], { string: ['foo.bar'] }), {
		_: [], foo: { bar: '3' },
	});
	t.deepEqual(parse(['--foo.bar'], { string: ['foo.bar'] }), {
		_: [], foo: { bar: '' },
	});
	t.end();
});

test('dotted booleans', function (t) {
	var opts = { boolean: ['foo.bar'] };
	t.deepEqual(parse([], opts), { _: [], foo: { bar: false } });
	t.deepEqual(parse(['--foo.bar', 'value'], opts), { _: ['value'], foo: { bar: true } });
	t.deepEqual(parse(['--foo.bar=false'], opts), { _: [], foo: { bar: false } });
	t.deepEqual(parse(['--no-foo.bar']), { _: [], foo: { bar: false } });
	t.end();
});

test('dotted options example', function (t) {
	t.deepEqual(parse(['--server.port=8080'], {
		string: ['server.port'],
		boolean: ['server.verbose'],
		alias: { 'server.port': 'p' },
		default: { 'server.host': 'localhost' },
	}), {
		_: [], server: { verbose: false, port: '8080', host: 'localhost' }, p: '8080',
	});
	t.end();
});

test('short alias for dotted string', function (t) {
	t.deepEqual(parse(['-p', '8080'], {
		string: ['server.port'], alias: { 'server.port': 'p' },
	}), { _: [], p: '8080', server: { port: '8080' } });
	t.end();
});

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
