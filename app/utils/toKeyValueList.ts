export const toKeyValueList = (obj: Record<string, any>): { key: string; value: any }[] => {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
};
