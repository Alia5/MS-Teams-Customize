import { trimDoubleSlash, patchObjectNested } from './../util/index';
import { existsSync } from 'fs';
import { extractAll } from 'asar';
import { readFile, rename, writeFile, rm } from 'fs/promises';

const ASAR_NAME = 'app.asar' as const;

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


const extraxtAsarFile = (asarFilePath: string): string => {
    if (!existsSync(asarFilePath)) {
        throw new Error('"app.asar" could not be found');
    }
    const unpackedAppDir = asarFilePath.replace('.asar', '');
    extractAll(asarFilePath, unpackedAppDir);
    if (!existsSync(unpackedAppDir)) {
        throw new Error('Couldn\'t extract app.asar');
    }
    return unpackedAppDir;
};

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

const renameAsarFile = async (asarFilePath: string, restore = false) => {
    if (restore) {
        await rename(`${asarFilePath}.bak`, asarFilePath);
    } else {
        await rename(asarFilePath, `${asarFilePath}.bak`);
    }
};

export const enableDebuggingFeatures = async (argv: string[]) => {
    const asarFilePath = argv.find((arg) => arg.endsWith(ASAR_NAME));
    if (!asarFilePath) {
        console.error('Please provide path to msteams "app.asar"');
        return;
    }
    if (!existsSync(asarFilePath) && existsSync(`${asarFilePath}.bak`)) {
        console.log('Found patched installation; Restoring before patching again');
        console.log('Restoring original "app.asar"');
        await renameAsarFile(asarFilePath, true);
        const unpackedPath = asarFilePath.replace('.asar', '');
        if (existsSync(unpackedPath)) {
            await rm(unpackedPath, { recursive: true });
        }
    } else {
        const unpackedPath = asarFilePath.replace('.asar', '');
        if (existsSync(unpackedPath)) {
            await rm(unpackedPath, { recursive: true });
        }
    }
    try {
        console.log(`Unpacking ${ASAR_NAME}...`);
        const unpackedPath = extraxtAsarFile(asarFilePath);
        console.log('Unpacked asar file');
        console.log(`Patching ${BUNDLE_PATH}...`);
        await patchMainBundle(unpackedPath);
        console.log(`Patching ${CONFIG_PATH}...`);
        await patchConfig(unpackedPath);
        console.log(`renaming ${ASAR_NAME}...`);
        await renameAsarFile(asarFilePath);

    } catch (e) {
        console.error(`ERROR: ${(e as Error)?.message}`);
    }
};
