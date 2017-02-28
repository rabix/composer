export class WorkerTest implements Worker {
    onmessage: (ev: MessageEvent) => any;
    onerror: (ev: ErrorEvent) => any;

    postMessage(message: any, ports?: any): void {
    }

    terminate(): void {
    }

    addEventListener<K extends any>(type: K, listener: (ev: any) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    addEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void;
    addEventListener(type, listener?, useCapture?): void {
    }

    dispatchEvent(evt: Event): boolean {
        return undefined;
    }

    removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void {
    }

}
