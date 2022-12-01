import { expectType } from 'tsd';
import minimist from '..';
import { Opts, ParsedArgs } from '..';

interface CustomArgs {
    foo: boolean;
}

interface CustomArgs2 extends ParsedArgs {
    foo: boolean;
}

const opts: Opts = {};
expectType<string | string[] | undefined>(opts.string)
opts.string = 'str';
opts.string = ['strArr'];
expectType<string | string[] | boolean | undefined>(opts.boolean)
opts.boolean = true;
opts.boolean = 'str';
opts.boolean = ['strArr'];
expectType<{ [key: string]: string | string[]; } | undefined>(opts.alias)
opts.alias = {
    foo: ['strArr'],
};
opts.alias = {
    foo: 'str',
};
opts.default = {
    foo: 'str',
};
opts.default = {
    foo: 0,
};
opts.unknown = (arg: string) => {
    if (/xyz/.test(arg)) {
        return true;
    }

    return false;
};
expectType<boolean | undefined>(opts.stopEarly)
opts.stopEarly = true;
expectType<boolean | undefined>(opts['--'])
opts['--'] = true;

minimist(); // $ExpectType ParsedArgs
minimist(['--a.b', '22']); // $ExpectType ParsedArgs
minimist(['--a.b', '22'], { default: { 'a.b': 11 }, alias: { 'a.b': 'aa.bb' } }); // $ExpectType ParsedArgs
minimist<CustomArgs>(); // $ExpectType CustomArgs & ParsedArgs
minimist<CustomArgs>(['--a.b', '22']); // $ExpectType CustomArgs & ParsedArgs
minimist<CustomArgs>(['--a.b', '22'], { default: { 'a.b': 11 }, alias: { 'a.b': 'aa.bb' } }); // $ExpectType CustomArgs & ParsedArgs
minimist<CustomArgs2>(); // $ExpectType CustomArgs2 & ParsedArgs
minimist<CustomArgs2>(['--a.b', '22']); // $ExpectType CustomArgs2 & ParsedArgs
minimist<CustomArgs2>(['--a.b', '22'], { default: { 'a.b': 11 }, alias: { 'a.b': 'aa.bb' } }); // $ExpectType CustomArgs2 & ParsedArgs

const obj = minimist<CustomArgs>(['--a.b', '22'], opts);
expectType<CustomArgs & ParsedArgs>(obj)
expectType<string[]>(obj._)
expectType<number>(obj._.length)
expectType<boolean>(obj.foo)
