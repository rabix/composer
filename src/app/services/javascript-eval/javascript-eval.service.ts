import {Observable} from "rxjs/Observable";
import {Injectable, NgZone} from "@angular/core";
import {GuidService} from "../guid.service";
import {ExpressionEvaluator} from "cwlts/models";

@Injectable()
export class JavascriptEvalService {

    private iFrame = null;

    private pendingRequestsForEvaluation = {};

    constructor(private guid: GuidService, private zone: NgZone) {

        this.zone.runOutsideAngular(() => {

            Observable.fromEvent(window, "message").filter((msg: MessageEvent) => msg.data.jsEvaluator)
                .subscribe((msg: MessageEvent) => {

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
        this.iFrame = document.createElement('iframe');

        const perm = ['allow-same-origin', 'allow-scripts'];
        this.iFrame.style.display = "none";
        this.iFrame.sandbox = perm.join(" ");

        this.iFrame.onload = () => {
            this.iFrame.contentWindow.document.open('text/html', 'replace');
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
                var blobCode = \`
                    self.addEventListener("message", function(m) {       
        
                        // Make local variables in order to be able to use context ($job ...)
                        Object.keys(m.data.context).forEach(function (item) {
                                self[item] = m.data.context[item];
                            }
                        );
                        
                        // Eval the expression
                        self.postMessage(runHidden(m.data.script));     
                    });
        
                // Blacklisted properties
                var runHidden = function(code) {
                    var indexedDB = null;
                    var location = null;
                    var navigator = null;
                    var onerror = null;
                    var onmessage = null;
                    var performance = null;
                    var self = null;
                    var webkitIndexedDB = null;
                    var postMessage = null;
                    var close = null;
                    var openDatabase = null;
                    var openDatabaseSync = null;
                    var webkitRequestFileSystem = null;
                    var webkitRequestFileSystemSync = null;
                    var webkitResolveLocalFileSystemSyncURL = null;
                    var webkitResolveLocalFileSystemURL = null;
                    var addEventListener = null;
                    var dispatchEvent = null;
                    var removeEventListener = null;
                    var dump = null;
                    var onoffline = null;
                    var ononline = null;
                    var importScripts = null;
                    var console = null;
                    var application = null;
                    var XMLHttpRequest = null;
                    return eval(code);
                } \`
                
                var blobUrl = window.URL.createObjectURL(
                    new Blob([blobCode])
                );
                
                // Queue of pending requests                
                var pendingRequestsQueue = [];       

                // Worker reference
                var worker = null;
                
                // Flag that determines whether worker is running or not
                var workerIsRunning = false;
                
                // Currently executed request
                var currentlyExecutedRequest = null;
                
                // Timeout that stops worker if running too long
                var timeout = null;
                
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
                        var requestToExecute = pendingRequestsQueue.shift();
                                            
                        if (requestToExecute) {
                            workerIsRunning = true;                          
       
                            if (!worker) {                            
                                worker = new Worker(blobUrl);
                                
                                var messageCallback = function(data, error) {
                                        
                                    window.clearTimeout(timeout);
                                    workerIsRunning = false;                                    
                                    
                                    postMessageToParentWindow(data, currentlyExecutedRequest.id, error);
                                    
                                    currentlyExecutedRequest = null
                                    
                                    processNextRequest();
                                }                                
                               
                                worker.onmessage =  function(m) { 
                                    messageCallback(m.data);                     

                                };
                                
                                worker.onerror =  function (e) {
                                    e.preventDefault();
                                    messageCallback(e.message + " (at line " + e.lineno + ")", true);      
                                }                         
                                                             
                            }
                            
                            currentlyExecutedRequest = requestToExecute;                            
                                                        
                            worker.postMessage(currentlyExecutedRequest);
                            
                               
                            // Set timeout in order to stop the execution if it is taking too long   
                            timeout = window.setTimeout(function() {                                
                                workerIsRunning = false;
                                worker.terminate();
                                worker = null;
            
                                postMessageToParentWindow("Error: Takes too long to execute, loops possible",
                                 currentlyExecutedRequest.id, true)
                                
                                currentlyExecutedRequest = null;                                
                                processNextRequest();
        
                            }, requestToExecute.timeout);                                  
                        }  
                    }                   
                }     
    
            <\/script>
        
        </html>`;
    }

    public evaluateCode(expression?: string, context?: any, timeout: Number = 300) {

        const generatedId = this.guid.generate();

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
