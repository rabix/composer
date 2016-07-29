export const DECORATOR_KEY_ASSIGNABLE = "ct:assignable";

export const assignable = (method ?: string) => (target: Object, key: string) => {
    const key      = DECORATOR_KEY_ASSIGNABLE;
    const metadata = Reflect.getMetadata(key, target) || {};
    const update   = Object.assign(metadata, {[key]: {method}});
    Reflect.defineMetadata(key, update, target);
};
