'use strict';

function hasKey(obj, keys) {
	var o = obj;
	keys.slice(0, -1).forEach(function (key) {
		o = o[key] || {};
	});

	var key = keys[keys.length - 1];
	return key in o;
}

function isNumber(x) {
	if (typeof x === 'number') { return true; }
	if ((/^0x[0-9a-f]+$/i).test(x)) { return true; }
	return (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/).test(x);
}

function isConstructorOrProto(obj, key) {
	return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
}

module.exports = function (args, opts) {
	if (!opts) { opts = {}; }

	var flags = {
		bools: {},
		// known: {},
		numbers: {},
		strings: {},
		unknownFn: null,
	};

	if (typeof opts.unknown === 'function') {
		flags.unknownFn = opts.unknown;
	}

	if (typeof opts.boolean === 'boolean' && opts.boolean) {
		flags.allBools = true;
	} else {
		[].concat(opts.boolean).filter(Boolean).forEach(function (key) {
			flags.bools[key] = true;
		});
	}

	var aliases = {};

	function isBooleanKey(key) {
		if (flags.bools[key]) {
			return true;
		}
		if (!aliases[key]) {
			return false;
		}
		return aliases[key].some(function (x) {
			return flags.bools[x];
		});
	}

	Object.keys(opts.alias || {}).forEach(function (key) {
		aliases[key] = [].concat(opts.alias[key]);
		aliases[key].forEach(function (x) {
			aliases[x] = [key].concat(aliases[key].filter(function (y) {
				return x !== y;
			}));
		});
	});

	// populating flags.strings with explicit keys and aliases
	[].concat(opts.string).filter(Boolean).forEach(function (key) {
		flags.strings[key] = true;
		if (aliases[key]) {
			[].concat(aliases[key]).forEach(function (k) {
				flags.strings[k] = true;
			});
		}
	});

	// populating flags.numbers with explicit keys and aliases
	[].concat(opts.number).filter(Boolean).forEach(function (key) {
		flags.numbers[key] = true;
		if (aliases[key]) {
			[].concat(aliases[key]).forEach(function (k) {
				flags.numbers[k] = true;
			});
		}
	});

	// [].concat(opts.known).filter(Boolean).forEach(function (key) {
	// 	flags.known[key] = true;
	// });

	var defaults = opts.default || {};

	var argv = { _: [] };

	function keyDefined(key) {
		return flags.strings[key]
			|| flags.numbers[key]
			|| flags.bools[key]
			|| aliases[key];
		// || flags.known[key];
	}

	function argDefined(key, arg) {
		// legacy test for whether to call unknownFn
		return (flags.allBools && (/^--[^=]+$/).test(arg))
			|| keyDefined(key);
	}

	function setKey(obj, keys, value) {
		var o = obj;
		for (var i = 0; i < keys.length - 1; i++) {
			var key = keys[i];
			if (isConstructorOrProto(o, key)) { return; }
			if (o[key] === undefined) { o[key] = {}; }
			if (
				o[key] === Object.prototype
				|| o[key] === Number.prototype
				|| o[key] === String.prototype
			) {
				o[key] = {};
			}
			if (o[key] === Array.prototype) { o[key] = []; }
			o = o[key];
		}

		var lastKey = keys[keys.length - 1];
		if (isConstructorOrProto(o, lastKey)) { return; }
		if (
			o === Object.prototype
			|| o === Number.prototype
			|| o === String.prototype
		) {
			o = {};
		}
		if (o === Array.prototype) { o = []; }
		if (o[lastKey] === undefined || isBooleanKey(lastKey) || typeof o[lastKey] === 'boolean') {
			o[lastKey] = value;
		} else if (Array.isArray(o[lastKey])) {
			o[lastKey].push(value);
		} else {
			o[lastKey] = [o[lastKey], value];
		}
	}

	function checkStrictVal(key, val) {
		// Have a separate routine from setArg to avoid affecting non-strict results,
		// as the strict checks need less processed values.
		if (opts.strict) {
			if (flags.strings[key] && val === true) {
				throw new Error('Missing option value for option "' + key + '"');
			}
			if (flags.numbers[key] && !isNumber(val)) {
				throw new Error('Expecting number value for option "' + key + '"');
			}
			if (isBooleanKey(key) && typeof val === 'string' && !(/^(true|false)$/).test(val)) {
				throw new Error('Unexpected option value for option "' + key + '"');
			}
			if (!keyDefined(key)) {
				throw new Error('Unknown option "' + key + '"');
			}
		}
	}

	function setArg(key, val, arg) {
		if (arg && flags.unknownFn && !argDefined(key, arg)) {
			if (flags.unknownFn(arg) === false) { return; }
		}
		var value = !flags.strings[key] && isNumber(val)
			? Number(val)
			: val;
		setKey(argv, key.split('.'), value);

		(aliases[key] || []).forEach(function (x) {
			setKey(argv, x.split('.'), value);
		});
	}

	// Set booleans to false by default.
	Object.keys(flags.bools).forEach(function (key) {
		setArg(key, false);
	});
	// Set booleans to user defined default if supplied.
	Object.keys(defaults).filter(isBooleanKey).forEach(function (key) {
		setArg(key, defaults[key]);
	});
	var notFlags = [];

	if (args.indexOf('--') !== -1) {
		notFlags = args.slice(args.indexOf('--') + 1);
		args = args.slice(0, args.indexOf('--'));
	}

	for (var i = 0; i < args.length; i++) {
		var arg = args[i];
		var key;
		var next;

		if ((/^--.+=/).test(arg)) {
			// Using [\s\S] instead of . because js doesn't support the
			// 'dotall' regex modifier. See:
			// http://stackoverflow.com/a/1068308/13216
			var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
			key = m[1];
			var value = m[2];
			checkStrictVal(key, value);
			if (isBooleanKey(key)) {
				value = value !== 'false';
			}
			setArg(key, value, arg);
		} else if ((/^--no-.+/).test(arg)) {
			key = arg.match(/^--no-(.+)/)[1];
			checkStrictVal(key, false);
			setArg(key, false, arg);
		} else if ((/^--.+/).test(arg)) {
			key = arg.match(/^--(.+)/)[1];
			next = args[i + 1];
			if (
				next !== undefined
				&& !(/^(-|--)[^-]/).test(next)
				&& !isBooleanKey(key)
				&& !flags.allBools
			) {
				checkStrictVal(key, next);
				setArg(key, next, arg);
				i += 1;
			} else if ((/^(true|false)$/).test(next)) {
				checkStrictVal(key, next);
				setArg(key, next === 'true', arg);
				i += 1;
			} else {
				checkStrictVal(key, true);
				setArg(key, flags.strings[key] ? '' : true, arg);
			}
		} else if ((/^-[^-]+/).test(arg)) {
			var letters = arg.slice(1, -1).split('');

			var broken = false;
			for (var j = 0; j < letters.length; j++) {
				next = arg.slice(j + 2);

				if (next === '-') {
					checkStrictVal(letters[j], next);
					setArg(letters[j], next, arg);
					continue;
				}

				if ((/[A-Za-z]/).test(letters[j]) && next[0] === '=') {
					checkStrictVal(letters[j], next.slice(1));
					setArg(letters[j], next.slice(1), arg);
					broken = true;
					break;
				}

				if (
					(/[A-Za-z]/).test(letters[j])
					&& (/-?\d+(\.\d*)?(e-?\d+)?$/).test(next)
				) {
					checkStrictVal(letters[j], next);
					setArg(letters[j], next, arg);
					broken = true;
					break;
				}

				if (letters[j + 1] && letters[j + 1].match(/\W/)) {
					checkStrictVal(letters[j], arg.slice(j + 2));
					setArg(letters[j], arg.slice(j + 2), arg);
					broken = true;
					break;
				} else {
					checkStrictVal(letters[j], true);
					setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
				}
			}

			key = arg.slice(-1)[0];
			if (!broken && key !== '-') {
				if (
					args[i + 1]
					&& !(/^(-|--)[^-]/).test(args[i + 1])
					&& !isBooleanKey(key)
				) {
					checkStrictVal(key, args[i + 1]);
					setArg(key, args[i + 1], arg);
					i += 1;
				} else if (args[i + 1] && (/^(true|false)$/).test(args[i + 1])) {
					checkStrictVal(key, args[i + 1]);
					setArg(key, args[i + 1] === 'true', arg);
					i += 1;
				} else {
					checkStrictVal(key, true);
					setArg(key, flags.strings[key] ? '' : true, arg);
				}
			}
		} else {
			if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
				argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
			}
			if (opts.stopEarly) {
				argv._.push.apply(argv._, args.slice(i + 1));
				break;
			}
		}
	}

	Object.keys(defaults).forEach(function (k) {
		if (!hasKey(argv, k.split('.'))) {
			setKey(argv, k.split('.'), defaults[k]);

			(aliases[k] || []).forEach(function (x) {
				setKey(argv, x.split('.'), defaults[k]);
			});
		}
	});

	if (opts['--']) {
		argv['--'] = notFlags.slice();
	} else {
		notFlags.forEach(function (k) {
			argv._.push(k);
		});
	}

	return argv;
};
