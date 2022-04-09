export const trimDoubleSlash = (str: string): string => str.replace(/\/\//g, '/');

export const patchObjectNested = <T extends Record<string, unknown>>(
    obj: T,
    path: string | string[],
    value: unknown,
    splitter = '.'
): T => {
    const pathArr = Array.isArray(path) ? path : path.split(splitter);
    const [key, ...rest] = pathArr;
    if (rest.length) {
        (obj as Record<string, unknown>)[key] = patchObjectNested(obj[key] as T, rest, value);
    } else {
        (obj as Record<string, unknown>)[key] = value;
    }
    return obj;
};
