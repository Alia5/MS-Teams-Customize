import { ArgumentsCamelCase, CommandBuilder } from 'yargs';
import { restoreApp } from '../../handlers/asar';
import { appAsarOpts } from '../appAsarOpts';

export const command = 'restore [app-asar]';
export const desc = 'Restore MS-Teams';
export const builder: CommandBuilder = {
    appAsar: appAsarOpts
};

type CommandArgv = ArgumentsCamelCase & {
    appAsar: string;
};

export const handler = async (argv: CommandArgv) => {
    await restoreApp(argv.appAsar);
};
