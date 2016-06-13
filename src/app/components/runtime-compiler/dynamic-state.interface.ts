export interface DynamicState {
    setState(any);
}

export function hasDynamicState(obj: Object): obj is DynamicState {
    return typeof obj["setState"] === "function";
}
