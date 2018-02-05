import {Injectable} from "@angular/core";
import {AppEvent} from "./app-event";

export type EventDisposeFunction = () => void;
export type EventHandlerFunction<T> = (T) => void;
export type EventConstructor<T> = { new(): T };

@Injectable()
export class EventHubService {

    private listeners = new WeakMap<EventConstructor<AppEvent>, EventHandlerFunction<AppEvent>[]>();

    on<T extends AppEvent>(eventType: EventConstructor<T>, handler: EventHandlerFunction<T>): EventDisposeFunction {

        const handlers = this.listeners.get(eventType);

        if (!handlers) {
            this.listeners.set(eventType, []);
        }

        const length = handlers.push(handler);

        return () => handlers.splice(length - 1, 1);

    }

    once<T extends AppEvent>(eventType: EventConstructor<T>, handler: EventHandlerFunction<T>): EventDisposeFunction {

        const disposeMainEvent = this.on(eventType, handler);
        const disposeOffEvent  = this.on(eventType, () => this.off(eventType, handler));

        return () => {
            disposeMainEvent();
            disposeOffEvent();
        }

    }

    off<T extends AppEvent>(type: EventConstructor<T>, handler: EventHandlerFunction<T>): void {

        const handlers = this.listeners.get(type);

        if (!handlers) {
            return;
        }

        for (let i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
            }
        }
    }

    emit<T extends AppEvent>(event: T): void {
        const eventListeners = this.listeners.get(event.constructor as EventConstructor<T>);

        if (eventListeners) {
            eventListeners.forEach(listener => listener(event));
        }
    }

}
