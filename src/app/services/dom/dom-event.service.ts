import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";

type ExtendedMouseEvent = MouseEvent & {
    ctName?: string;
    ctData?: any;
};

@Injectable()
export class DomEventService {

    public readonly ON_DRAG_ENTER_ZONE_EVENT = "onDragEnterZone";
    public readonly ON_DRAG_LEAVE_ZONE_EVENT = "onDragLeaveZone";

    public readonly ON_DRAG_ENTER_EVENT = "onDragEnter";
    public readonly ON_DRAG_LEAVE_EVENT = "onDragLeave";
    public readonly ON_DRAG_OVER_EVENT  = "onDragOver";

    public readonly ON_DROP_SUCCESS_EVENT = "onDropSuccess";

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
            throw new Error(`Invalid shortcut "${shortcut}". It can't be made only of control characters.`);
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
    public onMove(element: Element, ctName = "", ctData = {}): Observable<ExtendedMouseEvent> {
        const down = Observable.fromEvent(element, "mousedown");
        const up   = Observable.fromEvent(document, "mouseup");
        const move = Observable.fromEvent(document, "mousemove");
        return down.flatMap(_ => move.takeUntil(up)).map((ev: MouseEvent) => Object.assign(ev, {ctData}, {ctName}));
    }

    public onDrag(element: Element, ctName = "", ctData = {}): Observable<Observable<MouseEvent>> {

        const down = Observable.fromEvent(element, "mousedown").filter((ev: MouseEvent) => ev.button === 0).do((ev: MouseEvent) => {
            if (ev.stopPropagation) {
                ev.stopPropagation();
            }
            if (ev.preventDefault) {
                ev.preventDefault();
            }
        });
        const up   = Observable.fromEvent(document, "mouseup");
        const move = Observable.fromEvent(document, "mousemove");

        return down.map(ev => new Observable(obs => {

            const decorate = event => Object.assign(event, {ctData}, {ctName});

            obs.next(decorate(ev));

            const moveSub = move.subscribe(moveEv => obs.next(decorate(moveEv)));

            const upSub = up.first().subscribe(upEvent => {
                obs.next(decorate(upEvent));
                obs.complete();
            });

            return () => {
                moveSub.unsubscribe();
                upSub.unsubscribe();
            };
        }));
    }

    /**
     * Some browsers do not fire click events for mouse clicks other than a mouse left button click
     */
    public onMouseClick(element: Element) {

        const down = Observable.fromEvent(element, "mousedown");
        const up = Observable.fromEvent(document, "mouseup");

        return down.flatMap(() => up.first().filter((e: MouseEvent) => element.contains(e.target as Node)));
    }

    public triggerCustomEventOnElements(elements: Element [], eventName: string, data?: any) {
        // FIXME: Should be added support for IE
        elements.forEach(element => {
            const event = new CustomEvent(eventName, {
                detail: {
                    data
                }
            });
            element.dispatchEvent(event);
        });
    }
}
