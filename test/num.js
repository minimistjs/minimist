'use strict';

var parse = require('../');
var test = require('tape');

test('implicit nums', function (t) {
	var argv = parse([
		'-x', '1234',
		'-y', '5.67',
		'-z', '1e7',
		'-w', '10f',
		'--hex', '0xdeadbeef',
		'789',
	]);
	t.deepEqual(argv, {
		x: 1234,
		y: 5.67,
		z: 1e7,
		w: '10f',
		hex: 0xdeadbeef,
		_: [789],
	});
	t.deepEqual(typeof argv.x, 'number');
	t.deepEqual(typeof argv.y, 'number');
	t.deepEqual(typeof argv.z, 'number');
	t.deepEqual(typeof argv.w, 'string');
	t.deepEqual(typeof argv.hex, 'number');
	t.deepEqual(typeof argv._[0], 'number');
	t.end();
});

test('already a number', function (t) {
	var argv = parse(['-x', 1234, 789]);
	t.deepEqual(argv, { x: 1234, _: [789] });
	t.deepEqual(typeof argv.x, 'number');
	t.deepEqual(typeof argv._[0], 'number');
	t.end();
});

test('number type: short option', function (t) {
	var options = { number: 'n' };
	var argv = parse(['-n', '123'], options);
	t.deepEqual(argv, { n: 123, _: [] });

	argv = parse(['-n', '-123'], options);
	t.deepEqual(argv, { n: -123, _: [] });

	argv = parse(['-n=123'], options);
	t.deepEqual(argv, { n: 123, _: [] });

	argv = parse(['-n', 'xyz'], options);
	t.deepEqual(argv, { n: NaN, _: [] });

	argv = parse(['-n=xyz'], options);
	t.deepEqual(argv, { n: NaN, _: [] });

	// Special case of missing argument value
	argv = parse(['-n'], options);
	t.deepEqual(argv, { n: NaN, _: [] });

	t.end();
});

test('number type: long option', function (t) {
	var options = { number: 'num' };
	var argv = parse(['--num', '123'], options);
	t.deepEqual(argv, { num: 123, _: [] });

	argv = parse(['--num', '-123'], options);
	t.deepEqual(argv, { num: -123, _: [] });

	argv = parse(['--num=123'], options);
	t.deepEqual(argv, { num: 123, _: [] });

	argv = parse(['--num', 'xyz'], options);
	t.deepEqual(argv, { num: NaN, _: [] });

	argv = parse(['--num=xyz'], options);
	t.deepEqual(argv, { num: NaN, _: [] });

	// Special case of missing argument value
	argv = parse(['--num'], options);
	t.deepEqual(argv, { num: NaN, _: [] });

	// Special case of negated
	argv = parse(['--no-num'], options);
	t.deepEqual(argv, { num: false, _: [] });

	t.end();
});

test('number: alias', function (t) {
	var options = { number: 'num', alias: { num: 'n' } };
	var argv = parse(['-n', '123'], options);
	t.deepEqual(argv, { n: 123, num: 123, _: [] });

	// argv = parse(['-n', '-123'], options);
	// t.deepEqual(argv, { n: -123, num: 123, _: [] });

	argv = parse(['-n=123'], options);
	t.deepEqual(argv, { n: 123, num: 123, _: [] });

	argv = parse(['-n', 'xyz'], options);
	t.deepEqual(argv, { n: NaN, num: NaN, _: [] });

	argv = parse(['-n=xyz'], options);
	t.deepEqual(argv, { n: NaN, num: NaN, _: [] });

	// Special case of missing argument value
	argv = parse(['-n'], options);
	t.deepEqual(argv, { n: NaN, num: NaN, _: [] });

	t.end();
});
