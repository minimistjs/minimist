'use strict';

var parse = require('../');
var test = require('tape');

test('repeated auto strings accumulate in array', function (t) {
	var argv = parse(['-s', 'foo', '-s', 'bar']);

	t.deepEqual(argv, {
		s: ['foo', 'bar'],
		_: [],
	});

	t.end();
});

test('repeated declared strings accumulate in array', function (t) {
	var argv = parse(['-s', 'foo', '-s', 'bar', '-s'], { string: ['s'] });

	t.deepEqual(argv, {
		s: ['foo', 'bar', ''],
		_: [],
	});

	t.end();
});

test('repeated auto booleans overwrite', function (t) {
	var argv = parse(['--bool', '--bool']);

	t.deepEqual(argv, {
		bool: true,
		_: [],
	});

	t.end();
});

test('repeated declared booleans overwrite', function (t) {
	var argv = parse(['--bool', 'moo', '--bool'], { boolean: ['bool'] });

	t.deepEqual(argv, {
		bool: true,
		_: ['moo'],
	});

	t.end();
});

test('auto string overwrites auto bool', function (t) {
	// Testing for coverage of existing behaviour rather than because this is by design.
	var argv = parse(['--mixed', '--mixed', 'str']);

	t.deepEqual(argv, {
		mixed: 'str',
		_: [],
	});

	t.end();
});

test('auto bool accumulates with auto string', function (t) {
	// Testing for coverage of existing behaviour rather than because this is by design.
	var argv = parse(['--mixed', 'str', '--mixed']);

	t.deepEqual(argv, {
		mixed: ['str', true],
		_: [],
	});

	t.end();
});

/* No longer possible to get string into boolean option so not longer relevant

test('declared boolean overwrites string', function (t) {
	var options = {
		boolean: ['b'],
	};

	// Verify the setup, that can get a string into the option. (Can't do this for long options.)
	var argv1 = parse(['-b=xyz'], options);
	t.deepEqual(argv1, {
		b: 'xyz',
		_: [],
	});

	// Check that declared boolean overwrites string, and does not accumulate into array.
	var argv2 = parse(['-b=xyz', '-b'], options);

	t.deepEqual(argv2, {
		b: true,
		_: [],
	});

	t.end();
});

test('declared boolean alias overwrites string', function (t) {
	// https://github.com/minimistjs/minimist/issues/31
	var options = {
		boolean: ['b'],
		alias: { b: 'B' },
	};

	// Verify the setup, that can get a string into the option. (Can't do this for long options.)
	var argv1 = parse(['-B=xyz'], options);
	t.deepEqual(argv1, {
		b: 'xyz',
		B: 'xyz',
		_: [],
	});

	// Check that declared boolean overwrites string, and does not accumulate into array.
	var argv2 = parse(['-B=xyz', '-B'], options);

	t.deepEqual(argv2, {
		b: true,
		B: true,
		_: [],
	});

	t.end();
});
*/
