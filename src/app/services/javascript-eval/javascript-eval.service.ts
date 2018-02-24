import {Injectable, NgZone} from "@angular/core";
import {ExpressionEvaluator} from "cwlts/models";
import {Guid} from "../guid.service";
import {fromEvent} from "rxjs/observable/fromEvent";
import {filter} from "rxjs/operators";

@Injectable()
export class JavascriptEvalService {

    private iFrame = null;

    private pendingRequestsForEvaluation = {};

    constructor(private zone: NgZone) {

        this.zone.runOutsideAngular(() => {

            fromEvent(window, "message").pipe(
                filter((msg: MessageEvent) => msg.data.jsEvaluator)
            ).subscribe((msg: MessageEvent) => {

                const promise = this.pendingRequestsForEvaluation[msg.data.id];

                if (promise) {

                    if (msg.data.error) {
                        promise.rej(new Error(msg.data.data));
                    } else {
                        promise.res(msg.data.data);
                    }

                    delete this.pendingRequestsForEvaluation[msg.data.id]
                }
            });

        });


        // FIXME Maybe there is a better way to include iframe
        this.iFrame = document.createElement("iframe");

        const perm                = ["allow-same-origin", "allow-scripts"];
        this.iFrame.style.display = "none";
        this.iFrame.sandbox       = perm.join(" ");

        this.iFrame.onload = () => {
            this.iFrame.contentWindow.document.open("text/html", "replace");
            this.iFrame.contentWindow.document.write(this.iframeContent());
            this.iFrame.contentWindow.document.close();
        };

        document.body.appendChild(this.iFrame);

        // FIXME We have to improve this
        ExpressionEvaluator.evaluateExpression = this.evaluateCode.bind(this);
    }

    private iframeContent() {
        return `
            <!DOCTYPE html>

            <script type="text/javascript">

                // Blob code for worker
                const blobCode = \`
                    self.addEventListener("message", function(m) {       
                        self.postMessage(runHidden(m.data.script, m.data.context));     
                    });
        
                // Blacklisted properties
                var runHidden = function(code, context) {
                    var self = null;
                    this.indexedDB = null;
                    this.location = null;
                    this.navigator = null;
                    this.onerror = null;
                    this.onmessage = null;
                    this.performance = null;
                    this.webkitIndexedDB = null;
                    this.close = null;
                    this.openDatabase = null;
                    this.openDatabaseSync = null;
                    this.webkitRequestFileSystem = null;
                    this.webkitRequestFileSystemSync = null;
                    this.webkitResolveLocalFileSystemSyncURL = null;
                    this.webkitResolveLocalFileSystemURL = null;
                    this.addEventListener = null;
                    this.dispatchEvent = null;
                    this.removeEventListener = null;
                    this.dump = null;
                    this.onoffline = null;
                    this.ononline = null;
                    this.importScripts = null;
                    this.console = null;
                    this.application = null;
                    this.XMLHttpRequest = null;                    
                    
                    // Make local variables in order to be able to use context ($job, self...)
                    for(var item in context) {
                    
                        // Using eval and not this[item] because of keywords (for an example if we use "self" and its
                        // readonly, we would not be able to use "self" when executing)
                        eval("var " + item + " = " + JSON.stringify(context[item]));  
                    }                
                    
                    return eval(code);
                } \`;

                const blobUrl = window.URL.createObjectURL(
                    new Blob([blobCode])
                );

                // Queue of pending requests                
                const pendingRequestsQueue = [];

                // Worker reference
                let worker = null;

                // Flag that determines whether worker is running or not
                let workerIsRunning = false;

                // Currently executed request
                let currentlyExecutedRequest = null;

                // Timeout that stops worker if running too long
                let timeout = null;

                // Post message to a parent window
                function postMessageToParentWindow(data, id, error) {
                    window.parent.postMessage({
                        jsEvaluator: true,
                        data: data,
                        id: id,
                        error
                    }, '*');
                }

                // Put request in a queue and try to process the request (if its possible)
                function putRequestInQueue(e) {

                    pendingRequestsQueue.push(e.data);

                    // Try to process next pending request
                    // This line here is because of scenario when requests comes and queue is empty                      
                    processNextRequest();
                }

                // Listening to the messages (requests for js evaluation) that will come from a parent window
                window.addEventListener("message", putRequestInQueue, false);

                // Process next pending request if possible (if worker is not running)
                function processNextRequest() {

                    if (!workerIsRunning) {

                        // Take next pending request from the queue
                        const requestToExecute = pendingRequestsQueue.shift();

                        if (requestToExecute) {
                            workerIsRunning = true;

                            if (!worker) {
                                worker = new Worker(blobUrl);

                                const messageCallback = function (data, error) {

                                    window.clearTimeout(timeout);
                                    workerIsRunning = false;

                                    postMessageToParentWindow(data, currentlyExecutedRequest.id, error);

                                    currentlyExecutedRequest = null;

                                    processNextRequest();
                                };

                                worker.onmessage = function (m) {
                                    messageCallback(m.data);

                                };

                                worker.onerror = function (e) {
                                    e.preventDefault();
                                    messageCallback(e.message + " (at line " + e.lineno + ")", true);
                                }

                            }

                            currentlyExecutedRequest = requestToExecute;

                            worker.postMessage(currentlyExecutedRequest);


                            // Set timeout in order to stop the execution if it is taking too long   
                            timeout = window.setTimeout(function () {
                                workerIsRunning = false;
                                worker.terminate();
                                worker = null;

                                postMessageToParentWindow("Error: Takes too long to execute, loops possible", currentlyExecutedRequest.id, true);

                                currentlyExecutedRequest = null;
                                processNextRequest();

                            }, requestToExecute.timeout);
                        }
                    }
                }

            <\/script>

            </html>`;
    }

    evaluateCode(expression?: string, context?: any, timeout: Number = 300) {

        const generatedId = Guid.generate();

        this.zone.runOutsideAngular(() => {
            this.iFrame.contentWindow.postMessage({
                script: expression,
                context: context,
                id: generatedId,
                timeout: timeout
            }, "*");
        });

        return new Promise((res, rej) => {
            this.pendingRequestsForEvaluation[generatedId] = {
                res: res, rej: rej
            };
        });
    }
}
