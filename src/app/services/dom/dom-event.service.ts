import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

type ExtendedMouseEvent = MouseEvent & {
    ctName?: string;
    ctData?: any;
};

@Injectable()
export class DomEventService {

    private registeredShortcuts = new Map<string[], Observable<KeyboardEvent>>();

    public on(eventName: string, component?: Element, preventDefault = false) {
        return Observable.fromEvent(document, eventName).filter((ev: Event) => {
            if (component === undefined) {
                return true;
            }

            return ev.srcElement === component || component.contains(ev.srcElement);
        }).do((ev: Event) => {
            if (preventDefault) {
                ev.preventDefault();
            }
        });
    }

    /**
     * Create an observable of keyboard events based on a registered shortcut and a component that listens for them.
     * Examples:
     * - <code>onShortcut("alt+1", document);</code>
     * - <code>onShortcut("cmdOrCtrl+w", document.findElementById("someEl"));</code>
     *
     */
    public onShortcut(shortcut: string, component?: Element): Observable<KeyboardEvent> {

        // Split up the key combination and sort it
        const normalized = shortcut.split("+").sort();

        // Check if we already have this combination registered and prevent the new shortcut in that case
        if (this.registeredShortcuts.has(normalized)) {
            return this.registeredShortcuts.get(normalized);
        }

        // Let's keep the status of all modifier keys here
        const modifierValues = {
            alt: false,
            meta: false,
            ctrl: false,
            shift: false,
        };

        // Take the names of all modifier keys
        const modifierNames = Object.keys(modifierValues);

        // Now we should find the first non-modifier key
        const mainKey = normalized.find(k => modifierNames.indexOf(k) === -1);

        // We won't allow modifier-only shortcuts
        if (!mainKey) {
            throw `Invalid shortcut "${shortcut}". It can't be made only of control characters.`;
        }

        // Switch on modifiers that we should listen for
        normalized.filter(k => modifierNames.indexOf(k) !== -1).forEach(mod => modifierValues[mod] = true);

        // Create a listener for this key combination
        const listener = this.on("keyup", component).filter((ev: KeyboardEvent) => {

            // Check if the main key is what we are listening for
            const isMainKey = String.fromCharCode(ev.keyCode) === mainKey;

            // Check if the modifiers are what we are listening for
            const modifiersMatch = modifierNames.reduce((outcome, mod) => {

                if (outcome === false) {
                    return false;
                }

                return ev[mod + "Key"] === modifierValues[mod];
            }, true);

            return isMainKey && modifiersMatch;
        }).share() as Observable<KeyboardEvent>;

        this.registeredShortcuts.set(normalized, listener);

        return listener;
    }

    /**
     * Observes the dragging of an element.
     */
    public onDrag(element: Element, ctName = "", ctData = {}): Observable<ExtendedMouseEvent> {
        const down = Observable.fromEvent(element, "mousedown");
        const up   = Observable.fromEvent(document, "mouseup");
        const move = Observable.fromEvent(document, "mousemove");
        return down.flatMap(_ => move.takeUntil(up)).map((ev: MouseEvent) => Object.assign(ev, {ctData}, {ctName}));
    }


}