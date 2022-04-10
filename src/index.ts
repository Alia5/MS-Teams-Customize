#!/usr/bin/env node
import { parseCommands } from './cli/index';

const main = () => {
    parseCommands().catch((err) => {
        console.error(err);
        console.info('Teams must be closed to patch/unpatch!');
    });
};

main();
