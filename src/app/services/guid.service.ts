import {Injectable} from "@angular/core";

/**
 * GUID v4 Generator
 */
@Injectable()
export class GuidService {
    public generate() {
        let mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        mask.replace(/[xy]/g, (replacer) => {
            let x = Math.random() * 16 | 0,
                y = x & 0x3 | 0x8;

            let guid = replacer === "x" ? x : y;

            return guid.toString(16);
        });
    }
}
