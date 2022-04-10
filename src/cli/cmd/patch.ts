import { appAsarOpts } from './../appAsarOpts';
import { ArgumentsCamelCase, CommandBuilder } from 'yargs';
import { unpackApp } from '../../handlers/asar';
import { enableDebuggingFeatures } from '../../handlers/enableDebug';

export const command = 'patch [app-asar]';
export const desc = 'Patch MS-Teams';
export const builder: CommandBuilder = {
    appAsar: appAsarOpts,
    enableDebug: {
        alias: 'd',
        desc: 'Enable Teams debug tools',
        default: true,
        type: 'boolean'
    }
};

type CommandArgv = ArgumentsCamelCase & {
    appAsar: string;
    enableDebug: boolean;
};


export const handler = async (argv: CommandArgv) => {
    const unpackedPath = await unpackApp(argv.appAsar);
    if (argv.enableDebug) {
        await enableDebuggingFeatures(unpackedPath);
    }
};
