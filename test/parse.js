var parse = require('../');
var test = require('tape');

test('parse args', function (t) {
    t.deepEqual(
        parse([ '--no-moo' ]),
        { moo : false, _ : [] },
        'no'
    );
    t.deepEqual(
        parse([ '-v', 'a', '-v', 'b', '-v', 'c' ]),
        { v : ['a','b','c'], _ : [] },
        'multi'
    );
    t.end();
});
 
test('comprehensive', function (t) {
    t.deepEqual(
        parse([
            '--name=meowmers', 'bare', '-cats', 'woo',
            '-h', 'awesome', '--multi=quux',
            '--key', 'value',
            '-b', '--bool', '--no-meep', '--multi=baz',
            '--', '--not-a-flag', 'eek'
        ]),
        {
            c : true,
            a : true,
            t : true,
            s : 'woo',
            h : 'awesome',
            b : true,
            bool : true,
            key : 'value',
            multi : [ 'quux', 'baz' ],
            meep : false,
            name : 'meowmers',
            _ : [ 'bare', '--not-a-flag', 'eek' ]
        }
    );
    t.end();
});

test('nums', function (t) {
    var argv = parse([
        '-x', '1234',
        '-y', '5.67',
        '-z', '1e7',
        '-w', '10f',
        '--hex', '0xdeadbeef',
        '789',
    ]);
    t.deepEqual(argv, {
        x : 1234,
        y : 5.67,
        z : 1e7,
        w : '10f',
        hex : 0xdeadbeef,
        _ : [ 789 ]
    });
    t.deepEqual(typeof argv.x, 'number');
    t.deepEqual(typeof argv.y, 'number');
    t.deepEqual(typeof argv.z, 'number');
    t.deepEqual(typeof argv.w, 'string');
    t.deepEqual(typeof argv.hex, 'number');
    t.deepEqual(typeof argv._[0], 'number');
    t.end();
});

test('flag boolean', function (t) {
    var argv = parse([ '-t', 'moo' ], { boolean: 't' });
    t.deepEqual(argv, { t : true, _ : [ 'moo' ] });
    t.deepEqual(typeof argv.t, 'boolean');
    t.end();
});

test('flag boolean value', function (t) {
    var argv = parse(['--verbose', 'false', 'moo', '-t', 'true'], {
        boolean: [ 't', 'verbose' ],
        default: { verbose: true }
    });
    
    t.deepEqual(argv, {
        verbose: false,
        t: true,
        _: ['moo']
    });
    
    t.deepEqual(typeof argv.verbose, 'boolean');
    t.deepEqual(typeof argv.t, 'boolean');
    t.end();
});

return;
 
test('flag boolean default false', function (t) {
    var parse = optimist(['moo'])
        .boolean(['t', 'verbose'])
        .default('verbose', false)
        .default('t', false).argv;
    
    t.same(parse, {
        verbose: false,
        t: false,
        _: ['moo']
    });
    
    t.same(typeof parse.verbose, 'boolean');
    t.same(typeof parse.t, 'boolean');
    t.end();

});

test('boolean groups', function (t) {
    var parse = optimist([ '-x', '-z', 'one', 'two', 'three' ])
        .boolean(['x','y','z']).argv;
    
    t.same(parse, {
        x : true,
        y : false,
        z : true,
        _ : [ 'one', 'two', 'three' ]
    });
    
    t.same(typeof parse.x, 'boolean');
    t.same(typeof parse.y, 'boolean');
    t.same(typeof parse.z, 'boolean');
    t.end();
});

test('newlines in params' , function (t) {
    var args = parse([ '-s', "X\nX" ])
    t.same(args, { _ : [], s : "X\nX" });

    // reproduce in bash:
    // VALUE="new
    // line"
    // node program.js --s="$VALUE"
    args = parse([ "--s=X\nX" ])
    t.same(args, { _ : [], s : "X\nX" });
    t.end();
});

test('strings' , function (t) {
    var s = optimist([ '-s', '0001234' ]).string('s').argv.s;
    t.same(s, '0001234');
    t.same(typeof s, 'string');
    
    var x = optimist([ '-x', '56' ]).string('x').argv.x;
    t.same(x, '56');
    t.same(typeof x, 'string');
    t.end();
});

test('stringArgs', function (t) {
    var s = optimist([ '  ', '  ' ]).string('_').argv._;
    t.same(s.length, 2);
    t.same(typeof s[0], 'string');
    t.same(s[0], '  ');
    t.same(typeof s[1], 'string');
    t.same(s[1], '  ');
    t.end();
});

test('slashBreak', function (t) {
    t.same(
        parse([ '-I/foo/bar/baz' ]),
        { I : '/foo/bar/baz', _ : [] }
    );
    t.same(
        parse([ '-xyz/foo/bar/baz' ]),
        { x : true, y : true, z : '/foo/bar/baz', _ : [] }
    );
    t.end();
});

test('alias', function (t) {
    var argv = optimist([ '-f', '11', '--zoom', '55' ])
        .alias('z', 'zoom')
        .argv
    ;
    t.equal(argv.zoom, 55);
    t.equal(argv.z, argv.zoom);
    t.equal(argv.f, 11);
    t.end();
});

test('multiAlias', function (t) {
    var argv = optimist([ '-f', '11', '--zoom', '55' ])
        .alias('z', [ 'zm', 'zoom' ])
        .argv
    ;
    t.equal(argv.zoom, 55);
    t.equal(argv.z, argv.zoom);
    t.equal(argv.z, argv.zm);
    t.equal(argv.f, 11);
    t.end();
});

test('boolean default true', function (t) {
    var argv = optimist.options({
        sometrue: {
            boolean: true,
            default: true
        }
    }).argv;
  
    t.equal(argv.sometrue, true);
    t.end();
});

test('boolean default false', function (t) {
    var argv = optimist.options({
        somefalse: {
            boolean: true,
            default: false
        }
    }).argv;

    t.equal(argv.somefalse, false);
    t.end();
});

test('nested dotted objects', function (t) {
    var argv = optimist([
        '--foo.bar', '3', '--foo.baz', '4',
        '--foo.quux.quibble', '5', '--foo.quux.o_O',
        '--beep.boop'
    ]).argv;
    
    t.same(argv.foo, {
        bar : 3,
        baz : 4,
        quux : {
            quibble : 5,
            o_O : true
        },
    });
    t.same(argv.beep, { boop : true });
    t.end();
});

test('boolean and alias with chainable api', function (t) {
    var aliased = [ '-h', 'derp' ];
    var regular = [ '--herp',  'derp' ];
    var opts = {
        herp: { alias: 'h', boolean: true }
    };
    var aliasedArgv = optimist(aliased)
        .boolean('herp')
        .alias('h', 'herp')
        .argv;
    var propertyArgv = optimist(regular)
        .boolean('herp')
        .alias('h', 'herp')
        .argv;
    var expected = {
        herp: true,
        h: true,
        '_': [ 'derp' ]
    };

    t.same(aliasedArgv, expected);
    t.same(propertyArgv, expected); 
    t.end();
});

test('boolean and alias with options hash', function (t) {
    var aliased = [ '-h', 'derp' ];
    var regular = [ '--herp', 'derp' ];
    var opts = {
        herp: { alias: 'h', boolean: true }
    };
    var aliasedArgv = optimist(aliased)
      .options(opts)
      .argv;
    var propertyArgv = optimist(regular).options(opts).argv;
    var expected = {
        herp: true,
        h: true,
        '_': [ 'derp' ]
    };

    t.same(aliasedArgv, expected);
    t.same(propertyArgv, expected);

    t.end();
});

test('boolean and alias using explicit true', function (t) {
    var aliased = [ '-h', 'true' ];
    var regular = [ '--herp',  'true' ];
    var opts = {
        herp: { alias: 'h', boolean: true }
    };
    var aliasedArgv = optimist(aliased)
        .boolean('h')
        .alias('h', 'herp')
        .argv;
    var propertyArgv = optimist(regular)
        .boolean('h')
        .alias('h', 'herp')
        .argv;
    var expected = {
        herp: true,
        h: true,
        '_': [ ]
    };

    t.same(aliasedArgv, expected);
    t.same(propertyArgv, expected); 
    t.end();
});

// regression, see https://github.com/substack/node-optimist/issues/71
test('boolean and --x=true', function(t) {
    var parsed = optimist(['--boool', '--other=true']).boolean('boool').argv;

    t.same(parsed.boool, true);
    t.same(parsed.other, 'true');

    parsed = optimist(['--boool', '--other=false']).boolean('boool').argv;

    t.same(parsed.boool, true);
    t.same(parsed.other, 'false');
    t.end();
});
