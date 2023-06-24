'use strict';

var parse = require('../');
var test = require('tape');

function throwsWhenStrict(args, parseOptions, testOptions) {
	// does not throw by default
	testOptions.t.doesNotThrow(function () {
		parse(args, parseOptions);
	});
	// throws when strict
	var strictOptions = JSON.parse(JSON.stringify(parseOptions));
	strictOptions.strict = true;
	testOptions.t.throws(function () {
		parse(args, strictOptions);
	}, testOptions.expected);
}

var kMissingString = /Missing option value/;
var kBooleanWithValue = /Unexpected option value/;
var kUnknownOption = /Unknown option/;

test('strict missing option value: long string option used alone', function (t) {
	throwsWhenStrict(['--str'], { string: ['str'] }, { t: t, expected: kMissingString });
	t.end();
});

test('strict missing option value: short string option used alone', function (t) {
	throwsWhenStrict(['-s'], { string: ['s'] }, { t: t, expected: kMissingString });
	t.end();
});

test('strict missing option value: string option alias used alone', function (t) {
	throwsWhenStrict(['-s'], { string: ['str'], alias: { str: 's' } }, { t: t, expected: kMissingString });
	t.end();
});

test('strict missing option value: string option followed by option (rather than value)', function (t) {
	throwsWhenStrict(['--str', '-a'], { string: ['str'] }, { t: t, expected: kMissingString });
	t.end();
});

test('strict missing option value: short string option used before end of short option group', function (t) {
	throwsWhenStrict(['-sb'], { string: ['s'], boolean: 'b' }, { t: t, expected: kMissingString });
	t.end();
});

test('strict missing option value: empty string is ok value', function (t) {
	t.doesNotThrow(function () {
		parse(['--str', ''], { string: ['str'] });
	});
	t.end();
});

test('strict missing option value: implied empty string is ok (--str=)', function (t) {
	t.doesNotThrow(function () {
		parse(['--str='], { string: ['str'] });
	});
	t.end();
});

test('strict unexpected option value: long boolean option given value (other than true/false)', function (t) {
	throwsWhenStrict(['--bool=x'], { boolean: ['bool'] }, { t: t, expected: kBooleanWithValue });
	t.end();
});

test('strict unexpected option value: long boolean option given true is ok', function (t) {
	t.doesNotThrow(function () {
		parse(['--bool=true'], { boolean: ['bool'] });
	});
	t.end();
});

test('strict unexpected option value: long boolean option given false is ok', function (t) {
	t.doesNotThrow(function () {
		parse(['--bool=false'], { boolean: ['bool'] });
	});
	t.end();
});

test('strict unexpected option value: short boolean option given value (other than true/false)', function (t) {
	throwsWhenStrict(['--b=x'], { boolean: ['b'] }, { t: t, expected: kBooleanWithValue });
	t.end();
});

test('strict unexpected option value: short boolean option given value', function (t) {
	t.doesNotThrow(function () {
		parse(['--b=true'], { boolean: ['b'] });
	});
	t.end();
});

test('strict unexpected option value: short boolean option given value', function (t) {
	t.doesNotThrow(function () {
		parse(['--b=false'], { boolean: ['b'] });
	});
	t.end();
});

test('strict unknown option: unknown option', function (t) {
	throwsWhenStrict(['-u'], { }, { t: t, expected: kUnknownOption });
	throwsWhenStrict(['--long'], { }, { t: t, expected: kUnknownOption });
	throwsWhenStrict(['-u=x'], { }, { t: t, expected: kUnknownOption });
	throwsWhenStrict(['--long=x'], { }, { t: t, expected: kUnknownOption });
	t.end();
});

test('strict unknown option: opt.boolean is known', function (t) {
	t.doesNotThrow(function () {
		parse(['--bool'], { boolean: ['bool'], strict: true });
		parse(['-b'], { boolean: ['b'], strict: true });
	});
	t.end();
});

test('strict unknown option: opt.string is known', function (t) {
	t.doesNotThrow(function () {
		parse(['--str', 'SSS'], { string: ['str'], strict: true });
		parse(['-s', 'SSS'], { string: ['s'], strict: true });
	});
	t.end();
});

test('strict unknown option: opt.alias is known', function (t) {
	t.doesNotThrow(function () {
		var options = { alias: { aaa: ['a', 'AAA'] }, strict: true };
		parse(['--aaa'], options);
		parse(['-a'], options);
		parse(['--AAA'], options);
	});
	t.end();
});

test('strict unknown option: opt.known is known (of course!)', function (t) {
	t.doesNotThrow(function () {
		// try known as a string and array of strings, with and without option values
		parse(['--aaa'], { known: 'aaa', strict: true });
		parse(['--aaa=value'], { known: 'aaa', strict: true });
		parse(['--aaa', 'value'], { known: 'aaa', strict: true });
		parse(['--bbb'], { known: ['aaa', 'bbb'], strict: true });
		parse(['-s'], { known: ['s'], strict: true });
		parse(['-s=123'], { known: ['s'], strict: true });
		parse(['-abc'], { known: ['a', 'b', 'c'], strict: true });
	});
	t.end();
});

test('strict unknown option: opts.unknown returns false', function (t) {
	// Mirror non-strict and skip argument processing if opts.unknown returns false.
	// Otherwise, throw for unknown option as usual.

	function unknownFn() {
	}
	function unknownFnTrue() {
		return true;
	}
	function unknownFnFalse() {
		return false;
	}

	throwsWhenStrict(['--x=y'], { unknown: unknownFn }, { t: t, expected: kUnknownOption });
	throwsWhenStrict(['--x=y'], { unknown: unknownFnTrue }, { t: t, expected: kUnknownOption });
	t.doesNotThrow(function () {
		parse(['--x=y'], { strict: true, unknown: unknownFnFalse });
	});

	t.end();
});
