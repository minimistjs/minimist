# minimist <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Security][security-image]][security-url]

[![npm badge][npm-badge-png]][package-url]

parse argument options

This module is the guts of optimist's argument parser without all the
fanciful decoration.

# example

Example files: [example/parse.js](./example/parse.js) (CJS) / [example/parse.mjs](./example/parse.mjs) (ESM)

``` js
// for CJS
const argv = require('minimist')(process.argv.slice(2));

// for ESM
// import minimist from 'minimist';
// const argv = minimist(process.argv.slice(2));
console.log(argv);
```

```
$ node example/parse.js -a beep -b boop
{ _: [], a: 'beep', b: 'boop' }
```

```
$ node example/parse.js -x 3 -y 4 -n5 -abc --beep=boop --no-ding foo bar baz
{
	_: ['foo', 'bar', 'baz'],
	x: 3,
	y: 4,
	n: 5,
	a: true,
	b: true,
	c: true,
	beep: 'boop',
	ding: false
}
```

# methods

``` js
const parseArgs = require('minimist');
```

<a name="var-argv--parseargsargs-opts"></a>
## const argv = parseArgs(args, opts={})

Return an argument object `argv` populated with the array arguments from `args`.

`argv._` contains all the arguments that didn't have an option associated with
them.

Numeric-looking arguments will be returned as numbers unless `opts.string` or
`opts.boolean` contains that argument name. To disable numeric conversion
for non-option arguments, add `'_'` to `opts.string`.

A negated argument of the form `--no-foo` returns `false` for option `foo`.

Any arguments after `'--'` will not be parsed and will end up in `argv._`.

options can be:

* `opts.string` - a string or array of strings argument names to always treat as
strings
* `opts.boolean` - A boolean, string, or array of strings to always treat as
booleans. If `true` will treat all double-hyphenated arguments without equal signs
as boolean (e.g. affects `--foo`, not `-f` or `--foo=bar`) A boolean option will
consume the following argument if it is the string `true` or `false`. (e.g. `--foo false`)
* `opts.alias` - an object mapping string names to strings or arrays of string
argument names to use as aliases
* `opts.default` - an object mapping string argument names to default values
* `opts.stopEarly` - when true, populate `argv._` with everything after the
first non-option
* `opts['--']` - when true, populate `argv._` with everything before the `--`
and `argv['--']` with everything after the `--`. Here's an example:

  ```
  > require('./')('one two three -- four five --six'.split(' '), { '--': true })
  {
    _: ['one', 'two', 'three'],
    '--': ['four', 'five', '--six']
  }
  ```

  Note that with `opts['--']` set, parsing for arguments still stops after the
  `--`.

* `opts.unknown` - a function which is invoked with a command line parameter not
defined in the `opts` configuration object. If the function returns `false`, the
unknown option is not added to `argv`.

# install

With [npm](https://npmjs.org) do:

```
npm install minimist
```

# license

MIT

[package-url]: https://npmjs.org/package/minimist
[npm-version-svg]: https://versionbadg.es/minimistjs/minimist.svg
[npm-badge-png]: https://nodei.co/npm/minimist.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/minimist.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/minimist.svg
[downloads-url]: https://npm-stat.com/charts.html?package=minimist
[codecov-image]: https://codecov.io/gh/minimistjs/minimist/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/minimistjs/minimist/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/minimistjs/minimist
[actions-url]: https://github.com/minimistjs/minimist/actions
[security-image]: https://secure.software/npm/badge/minimist
[security-url]: https://secure.software/npm/packages/minimist
