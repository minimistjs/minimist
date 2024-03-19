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
var kMissingNumber = /Expecting number value/;
var kBooleanWithValue = /Unexpected option value/;
var kUnknownOption = /Unknown option/;

// missing option value

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

// missing number value

test('strict missing number value: long number option used alone', function (t) {
	throwsWhenStrict(['--num'], { number: ['num'] }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: short number option used alone', function (t) {
	throwsWhenStrict(['-n'], { number: ['n'] }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: number option alias used alone', function (t) {
	throwsWhenStrict(['-n'], { number: ['num'], alias: { num: 'n' } }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: long number option followed by non-number', function (t) {
	throwsWhenStrict(['--num', 'xyz'], { number: ['num'] }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: short number option followed by non-number', function (t) {
	throwsWhenStrict(['-n', 'xyz'], { number: ['n'] }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: long number option = non-number', function (t) {
	throwsWhenStrict(['--num=xyz'], { number: ['num'] }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: short number option = non-number', function (t) {
	throwsWhenStrict(['-n=xyz'], { number: ['n'] }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: number option followed by option (rather than value)', function (t) {
	throwsWhenStrict(['--num', '-a'], { number: ['num'] }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: short number option used before end of short option group', function (t) {
	throwsWhenStrict(['-nb'], { number: ['n'], boolean: 'b' }, { t: t, expected: kMissingNumber });
	t.end();
});

test('strict missing number value: number does not throw', function (t) {
	t.doesNotThrow(function () {
		parse(['--num', '123'], { number: ['num'] });
	});
	t.end();
});

// unexpected option value

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

test('strict unknown option: opt.number is known', function (t) {
	t.doesNotThrow(function () {
		parse(['--num', '123'], { number: ['num'], strict: true });
		parse(['-n', '123'], { number: ['n'], strict: true });
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
