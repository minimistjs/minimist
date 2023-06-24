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
