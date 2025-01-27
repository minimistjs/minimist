"use strict";

var parse = require("../");
var test = require("tape");

// bool
// node file.js --arg0 file0 --arg1=key0
test("booleanPath: true, default all --args to true, except --args=", function (t) {
	var argv = parse(
		[
			"/bin/node",
			"/home/user/file.js",
			"--arg0",
			"file0",
			"--arg1=key0",
		],
		{ booleanBoth: true }
	);

	t.deepEqual(argv, {
		_: ["/bin/node", "/home/user/file.js", "file0"],
		arg0: true,
		arg1: "key0",
	});

	t.end();
});

// node file.js -a file0 -b=key0 -cd file1
test("booleanPath: true, default all -<letter> to true except -<letter>=", function (t) {
	var argv = parse(
		[
			"/bin/node",
			"/home/user/file.js",
			"-a",
			"file0",
			"-b=key0",
			"-cd",
			"file1",
		],
		{ booleanBoth: true }
	);

	t.deepEqual(argv, {
		_: ["/bin/node", "/home/user/file.js", "file0", "file1"],
		a: true,
		b: "key0",
		c: true,
		d: true,
	});

	t.end();
});

// string
// node file.js --arg0 file0 --arg0=fail0 --arg1 key0 --arg2=key1
test("booleanBoth: 'arg0', default --arg0 and --arg0= to true, except --args and --args=", function (t) {
	var argv = parse(
		[
			"bin/node",
			"/home/user/file.js",
			"--arg0",
			"file0",
			"--arg0=fail0",
			"--arg1",
			"key0",
			"--arg2=key1",
		],
		{ booleanBoth: "arg0" }
	);

	t.deepEqual(argv, {
		_: ["bin/node", "/home/user/file.js", "file0"],
		arg0: true,
		arg1: "key0",
		arg2: "key1",
	});

	t.end();
});

// node file.js -a file0 -a=fail0 -ba file1 -c key0 -d=key1
test("booleanBoth: 'a', default -a and -a= to true, except -<letter> and -<letter>=", function (t) {
	var argv = parse(
		[
			"/bin/node",
			"/home/user/file.js",
			"-a",
			"file0",
			"-a=fail0",
			"-ba",
			"file1",
			"-c",
			"key0",
			"-d=key1",
		],
		{ booleanBoth: "a" }
	);

	t.deepEqual(argv, {
		_: ["/bin/node", "/home/user/file.js", "file0", "file1"],
		a: true,
		b: true,
		c: "key0",
		d: "key1",
	});

	t.end();
});

// array
// node file.js --arg0 file0 --arg1 file1 --arg0=fail0 --arg1=fail1 --arg2 key0 --arg3=key1
test("boolean: ['arg0', 'arg1'], default --arg0 and --arg1 to true, except --arg2 and --arg3=", function (t) {
	var argv = parse(
		[
			"/bin/node",
			"/home/user/file.js",
			"--arg0",
			"file0",
			"--arg1",
			"file1",
			"--arg0=fail0",
			"--arg1=fail1",
			"--arg2",
			"key0",
			"--arg3=key1",
		],
		{ booleanBoth: ["arg0", "arg1"] }
	);

	t.deepEqual(argv, {
		_: ["/bin/node", "/home/user/file.js", "file0", "file1"],
		arg0: true,
		arg1: true,
		arg2: "key0",
		arg3: "key1",
	});

	t.end();
});

// node file.js -a file0 -b file1 -a=fail0 -b=fail1 -ab file2 -ba file3 -c key0 -d=key1
test("booleanBoth: ['a', 'b'], default -a and -b to true, except -<letter> and -<letter>=", function (t) {
	var argv = parse(
		[
			"/bin/node",
			"/home/user/file.js",
			"-a",
			"file0",
			"-b",
			"file1",
			"-a=fail0",
			"-b=fail1",
			"-ab",
			"file2",
			"-ba",
			"file3",
			"-c",
			"key0",
			"-d=key1",
		],
		{ booleanBoth: ["a", "b"] }
	);

	t.deepEqual(argv, {
		_: ["/bin/node", "/home/user/file.js", "file0", "file1", "file2", "file3"],
		a: true,
		b: true,
		c: "key0",
		d: "key1",
	});

	t.end();
});
