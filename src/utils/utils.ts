export type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]: U;
};

export function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}