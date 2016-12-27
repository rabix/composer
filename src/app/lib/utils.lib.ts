/**
 * Function that accepts anything does nothing
 * @param args
 */
export const noop = (...args: any[]): void => {
};


/**
 * Function that console.logs its arguments
 */
export const logop = function () {
    console.log(arguments);
};

/**
 * Function that console.warns about it's arguments
 */
export const warnop = function () {
    console.warn(arguments);
};

/**
 * Returns a function that shows its inputs with a stack trace
 * @param title Title of the stack trace entry
 * @returns {()=>void}
 */
export function traceop(title) {
    return function () {
        console.trace(title);
    }
};
