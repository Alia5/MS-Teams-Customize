/* eslint-disable @typescript-eslint/no-unused-vars */

import { trimDoubleSlash } from '../../util';
import { readFile, writeFile } from 'fs/promises';

const SUB_PATH = 'lib/renderer/experienceRenderer' as const;
const PRELOAD_SCRIPT_NAME = 'preload_webview.js' as const;

const SETUP_REGEX = /[A-z]{1,3}\.setupWeakReference\((.+?)\)/g;

const EXPERIMENTAL_FETCH_INJECT_SCRIPT = (token: string, injectedScript: string) => `

${token}.hackInitialized = false;
${token}.originalFetch = e.fetch;
${token}.fetch = (url, options) => {
    if (!${token}.hackInitialized) {

        const window = ${token};

        ${injectedScript}

        ${token}.hackInitialized = true;
    }
    return ${token}.originalFetch(url, options);
}

` as const;


const patchExperienceRendererPreload = async (unpackedPath: string, script: string) => {
    const filePath = trimDoubleSlash(`${unpackedPath}/${SUB_PATH}/${PRELOAD_SCRIPT_NAME}`);
    let preloadFile = await readFile(filePath, 'utf8');
    preloadFile = preloadFile.replace(SETUP_REGEX, (match, ...groups) =>
        `${EXPERIMENTAL_FETCH_INJECT_SCRIPT(groups[0] as string, script)}${match}`
    );
    await writeFile(filePath, preloadFile);
};

export const injectInExperienceRenderer = async (unpackedPath: string, script: string) => {
    console.info('EXPERIMENTAL: Injecting script into experienceRenderer...');
    await patchExperienceRendererPreload(unpackedPath, script);
};
