import { trimDoubleSlash } from './../util/index';
import { existsSync, lstatSync } from 'fs';
import { extractAll } from 'asar';
import { rename, rm } from 'fs/promises';
import path from 'path';

const ASAR_NAME = 'app.asar' as const;
const BACKUP_EXTENSION = '.bak' as const;


const renameAsarFile = async (asarFilePath: string, restore = false) => {
    if (restore) {
        await rename(`${asarFilePath}.bak`, asarFilePath);
    } else {
        await rename(asarFilePath, `${asarFilePath}.bak`);
    }
};


const restoreAsar = async (asarPath: string): Promise<void> => {
    if (!existsSync(`${asarPath}${BACKUP_EXTENSION}`)) {
        throw new Error('app.asar.bak not existent. Cannot restore!');
    }
    if (existsSync(asarPath)) {
        await rm(asarPath, { recursive: true });
    }
    const unpackedPath = asarPath.replace('.asar', '');
    if (existsSync(unpackedPath)) {
        await rm(unpackedPath, { recursive: true });
    }
    await renameAsarFile(asarPath, true);
};

const extraxtAsar = (asarPath: string): string => {
    const unpackedAppDir = asarPath.replace('.asar', '');
    extractAll(asarPath, unpackedAppDir);
    if (!existsSync(unpackedAppDir)) {
        throw new Error('Couldn\'t extract app.asar');
    }
    return unpackedAppDir;
};

const validateAndFixPath = (asarPath: string): string => {
    // TODO: clean this mess up!
    if (!asarPath.endsWith(ASAR_NAME) && !asarPath.endsWith(BACKUP_EXTENSION)) {
        const potentialAsarPath = trimDoubleSlash(`${asarPath}/${ASAR_NAME}`);
        if (
            existsSync(asarPath)
            && lstatSync(asarPath).isDirectory()
            && (
                existsSync(potentialAsarPath)
                || existsSync(`${potentialAsarPath}${BACKUP_EXTENSION}`)
            )
        ) {
            return path.resolve(potentialAsarPath);
        } else {
            throw new Error(`Path to ${ASAR_NAME} is not valid!`);
        }
    }
    if (asarPath.endsWith(BACKUP_EXTENSION)) {
        if (!existsSync(asarPath)) {
            throw new Error(`Path to ${ASAR_NAME}${BACKUP_EXTENSION} is not existent!`);
        }
        return asarPath.replace(BACKUP_EXTENSION, '');
    }
    if (!existsSync(asarPath)) {
        throw new Error(`Path to ${ASAR_NAME} is not existent!`);
    }
    return asarPath;
};

export const unpackApp = async (asarPath: string): Promise<string> => {
    const asarFilePath = validateAndFixPath(asarPath);
    if (!existsSync(asarFilePath) && existsSync(`${asarFilePath}.bak`)) {
        console.info('App was already unpacked. Restoring before applying patches...');
        await restoreAsar(asarFilePath);
        console.info('');
    }
    console.info(`Unpacking ${ASAR_NAME}...`);
    const unpackedPath = extraxtAsar(asarFilePath);
    console.info(`Backing up ${ASAR_NAME}...`);
    await renameAsarFile(asarFilePath);
    return unpackedPath;
};

export const restoreApp = async (asarPath: string): Promise<void> => {
    const asarFilePath = validateAndFixPath(asarPath);
    await restoreAsar(asarFilePath);
};
