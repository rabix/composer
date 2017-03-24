import {Injectable} from "@angular/core";
import {WebWorker} from "./web-worker";

@Injectable()
export class WebWorkerBuilderService {

    create<T>(workerFunction: ((input: any) => T), scripts: string[] = [], context = {}): WebWorker<T> {

        const url    = this.compile(workerFunction, scripts, context);
        const worker = new Worker(url);
        return new WebWorker<T>(worker);

    }

    private compile(fn: Function, scripts = [], context = {}) {
        let [origin] = document.location.href.replace("/index.html", "").split("#");

        [origin] = origin.split("?");

        if (origin.endsWith("/")) {
            origin = origin.slice(0, -1);
        }

        const paths = scripts.map(s => s.startsWith("/") ? s.slice(1) : s)
            .map(s => "'" + [origin, s].join("/") + "'");

        const template = `
        importScripts( ${paths.join(", ")} );
    
        self.addEventListener("message", function(message) {
            postMessage({
                id: message.data.id,
                data: (${fn.toString()}).call(${JSON.stringify(context)}, message.data.data)
            });
        });
    `;

        const blob = new Blob([template], {type: "text/javascript"});
        return URL.createObjectURL(blob);
    }

}
