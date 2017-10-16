export class RecursiveNestingError extends Error {
    constructor(message) {
        super("Recursive nesting detected for " + message);

        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, RecursiveNestingError.prototype);
    }
}
