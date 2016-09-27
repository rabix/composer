import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable()
export class DomEventService {

    private registeredShortcuts = new Set();

    constructor() {

    }

    public on(eventName: string, component?: Element, preventDefault = false) {
        return Observable.fromEvent(document, eventName).filter((ev: Event) => {
            if (component === undefined) {
                return true;
            }

            return ev.srcElement === component || component.contains(ev.srcElement);
        }).do(ev => {
            if (preventDefault) {
                ev.preventDefault();
            }
        });
    }

    public onShortcut(shortcut: string, component?: Element) {

        const normalized = shortcut.split("+").sort();
        const reordered  = normalized.join("+");

        if (this.registeredShortcuts.has(reordered)) {
            throw `Shortcut "${shortcut}" is already registered. 
            Registering it twice would produce unexpected behaviour.`;
        }

        this.registeredShortcuts.add(reordered);


        const modifierValues = {
            alt: false,
            meta: false,
            ctrl: false,
            shift: false
        };

        const modifiers = Object.keys(modifierValues);
        const mainKey   = normalized.find(k => modifiers.indexOf(k) === -1);
        normalized.filter(k => modifiers.indexOf(k) !== -1).forEach(mod => modifierValues[mod] = true);


        if (!mainKey) {
            throw `Invalid shortcut "${shortcut}". It can't be made only of control characters.`;
        }

        return this.on("keyup", component).filter((ev: KeyboardEvent) => {
            const isMainKey    = String.fromCharCode(ev.keyCode) === mainKey;
            const modifiersMatch = modifiers.reduce((outcome, mod) => {
                if (outcome === false) {
                    return false;
                }

                return ev[mod + "Key"] === modifierValues[mod];
            }, true);

            return isMainKey && modifiersMatch;
        });
    }

}