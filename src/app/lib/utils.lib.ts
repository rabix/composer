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

