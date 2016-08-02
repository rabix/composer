export const DECORATOR_KEY_ASSIGNABLE = "ct:assignable";

/**
 * Property decorator that makes a class property assignable by using the Chap.Component.assign function.
 *
 * @param method Method to invoke on the target[key] property in order to set the assignable property
 */
export const assignable = (method?: string) => (target: Object, key: string) => {
    const metakey  = DECORATOR_KEY_ASSIGNABLE;
    const metadata = Reflect.getMetadata(metakey, target) || {};
    const update   = Object.assign(metadata, {[key]: {method}});
    Reflect.defineMetadata(metakey, update, target);
};
