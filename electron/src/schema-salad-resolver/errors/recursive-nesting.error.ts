export class RecursiveNestingError extends Error {
    constructor(message) {
        super("Recursive nesting detected for " + message);
    }
}
