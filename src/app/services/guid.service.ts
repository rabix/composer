/**
 * GUID v4 Generator
 */
export class Guid {
    static generate() {
        const mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        return mask.replace(/[xy]/g, (replacer) => {
            const x = Math.random() * 16 | 0,
                y = x & 0x3 | 0x8;

            const guid = replacer === "x" ? x : y;

            return guid.toString(16);
        });
    }
}
