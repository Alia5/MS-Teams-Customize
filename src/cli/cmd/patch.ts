import { appAsarOpts } from './../appAsarOpts';
import { ArgumentsCamelCase, CommandBuilder } from 'yargs';
import { unpackApp } from '../../handlers/asar';
import { enableDebuggingFeatures } from '../../handlers/enableDebug';
import { injectInExperienceRenderer } from '../../handlers/experimental/experienceRenderInject';

export const command = 'patch [app-asar]';
export const desc = 'Patch MS-Teams';
export const builder: CommandBuilder = {
    appAsar: appAsarOpts,
    enableDebug: {
        alias: 'd',
        desc: 'Enable Teams debug tools',
        default: true,
        type: 'boolean'
    },
    experimentalStylePatch: {
        desc: 'Inject experimental/demo style patch to chat window',
        default: false,
        type: 'boolean'
    }
};

type CommandArgv = ArgumentsCamelCase & {
    appAsar: string;
    enableDebug: boolean;
    experimentalStylePatch: boolean;
};


export const handler = async (argv: CommandArgv) => {
    const unpackedPath = await unpackApp(argv.appAsar);
    if (argv.enableDebug) {
        await enableDebuggingFeatures(unpackedPath);
    }
    if (argv.experimentalStylePatch) {
        const script = `
const someStyle = \`
    <style>
        .wh {
            background-color: rgb(12, 12, 12) !important;
        }
    </style>
\`;
window.document.head.insertAdjacentHTML('beforeend', someStyle);
        `;
        await injectInExperienceRenderer(unpackedPath, script);
    }
};
