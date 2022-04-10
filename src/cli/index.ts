import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';


export const parseCommands = async () => {
    await yargs(hideBin(process.argv))
        .commandDir('./cmd')
        .demandCommand()
        .help()
        .argv;
};
