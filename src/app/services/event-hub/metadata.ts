const METADATA_KEY = 'cottontail/eventhub';

export function ChainedEvent() {
    return function (target, propertyName) {
        if (!Reflect.hasOwnMetadata(METADATA_KEY, target)) {
            Reflect.defineMetadata(METADATA_KEY, [], target);
        }
        console.log("Examining metadata", target, propertyName);
        const effects = Reflect.getOwnMetadata(METADATA_KEY, target);
        Reflect.defineMetadata(METADATA_KEY, effects.concat([propertyName]), target);
    };
}
