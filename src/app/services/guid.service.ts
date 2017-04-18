import {Injectable} from "@angular/core";

/**
 * GUID v4 Generator
 */
@Injectable()
export class GuidService {
    public generate() {
        const mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        return mask.replace(/[xy]/g, (replacer) => {
            const x = Math.random() * 16 | 0,
                y = x & 0x3 | 0x8;

            const guid = replacer === "x" ? x : y;

            return guid.toString(16);
        });
    }
}
