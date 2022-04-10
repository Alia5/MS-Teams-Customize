import { trimDoubleSlash, patchObjectNested } from '../util';
import { readFile, writeFile } from 'fs/promises';

// main bundle
const BUNDLE_PATH = 'main.bundle.js' as const;
const MAIN_BUNDLE_ALTER_FUNCS = [
    'isDebugModeEnabled',
    'isDevMenuExtensionsEnabled',
    'isDeveloperMode'
] as const;
const FUNC_PATCH_CONTENT = ' return true; ' as const;
const GET_FUNC_PATH_REGEX_REPLACER = (funcName: string) => [
    new RegExp(`${funcName}\\s*\\(\\s*\\)\\s*\\{`, 'g'),
    (match: string) => `${match}${FUNC_PATCH_CONTENT}`
] as const;

// config
const CONFIG_PATH = 'env_config.json' as const;
/* eslint-disable @typescript-eslint/naming-convention */
const CONFIG_PATCH_KEY_VALUES = {
    'settings.improvedSettingsDebugMenu': true,
    'settings.debugMenuDisabledV2': false
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

const patchMainBundle = async (unpackedPath: string) => {
    const mainPath = trimDoubleSlash(`${unpackedPath}/${BUNDLE_PATH}`);
    let mainFile = await readFile(mainPath, 'utf8');
    MAIN_BUNDLE_ALTER_FUNCS.forEach((funcName) =>
        mainFile = mainFile.replace(
            ...GET_FUNC_PATH_REGEX_REPLACER(funcName)
        )
    );
    await writeFile(mainPath, mainFile);
};

const patchConfig = async (unpackedPath: string) => {
    const configPath = trimDoubleSlash(`${unpackedPath}/${CONFIG_PATH}`);
    const configFile = await readFile(configPath, 'utf8');
    const configJson = JSON.parse(configFile) as Record<string, unknown>;
    Object.entries(CONFIG_PATCH_KEY_VALUES).forEach(([key, value]) => {
        patchObjectNested(configJson, key, value);
    });
    await writeFile(configPath, JSON.stringify(configJson, undefined, 4));
};

export const enableDebuggingFeatures = async (unpackedPath: string) => {
    console.info('Enabling debug features...');
    console.info(`Patching ${BUNDLE_PATH}...`);
    await patchMainBundle(unpackedPath);
    console.info(`Patching ${CONFIG_PATH}...`);
    await patchConfig(unpackedPath);
};
