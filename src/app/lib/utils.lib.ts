export const noop = (...args: any[]) => {
};

export const logop = () => {
    console.log(...arguments);
};

export const warnop = () => {
    console.warn(...arguments);
};
export function traceop(title) {
    return () => console.trace(title, ...arguments);
};