import {Subject} from "rxjs/Subject";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/take";

export class WebWorker<T> {

    private static tick = 0;

    private messages = new Subject<{ id: number, data: T }>();

    constructor(private webWorker: Worker) {
        webWorker.addEventListener("error", (event) => {
            console.error("Error in webworker:", event);
        });

        webWorker.addEventListener("message", (event) => {
            this.messages.next(event.data);
        });
    }

    terminate() {
        this.webWorker.terminate();
    }

    request(data: any): Promise<T> {

        const message = {
            id: WebWorker.tick++,
            data,
        };

        this.webWorker.postMessage(message);
        return new Promise((resolve, reject) => {
            this.messages
                .filter(m => m.id === message.id)
                .take(1)
                .map(m => m.data)
                .subscribe(response => {
                    resolve(response);
                }, err => {
                    reject(err);
                });
        });
    }
}
