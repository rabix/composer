export const DECORATOR_KEY_ASSIGNABLE = "ct:assignable";

export const assignable = (method ?: string) => (target: Object, key: string) => {
    const metakey  = DECORATOR_KEY_ASSIGNABLE;
    const metadata = Reflect.getMetadata(metakey, target) || {};
    const update   = Object.assign(metadata, {[key]: {method}});
    Reflect.defineMetadata(metakey, update, target);
};
