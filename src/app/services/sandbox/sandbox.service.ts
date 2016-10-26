import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
const jailed = require('jailed');

export interface SandboxResponse {
    output: string,
    error: string
}

export class SandboxService {

    /** Jailed plugin instance */
    private plugin: any;

    /** Result of the expression evaluation */
    private expressionResult: Observable<SandboxResponse>;

    private updateExpressionResult: Subject<SandboxResponse> = new Subject<SandboxResponse>();

    constructor() {
        this.expressionResult = this.updateExpressionResult
            .filter(result => result !== undefined);
    }

    // sends the input to the plugin for evaluation
    public submit(code: string, context?: any): Observable<SandboxResponse> {

        //make sure the code is a string
        let codeToExecute = code;

        //@todo(maya) check should be replaced with CWL-TS expression evaluator
        if (code.charAt(0) === '{') {
            codeToExecute = "(function()" + code + ")()";
        }

        this.plugin = new jailed.DynamicPlugin(this.initializeEngine());

        this.plugin.whenConnected(() => {
            this.plugin.remote.execute(codeToExecute, context, (res) => {
                this.updateExpressionResult.next(res);
                this.disconnect();
            });
            this.waitFoResponse();
        });

        return this.expressionResult;
    }

    private waitFoResponse(): void {
        setTimeout(() => {
            this.disconnect();
        }, 3000);
    }

    private disconnect(): void {
        this.plugin.disconnect();
    }

    private initializeEngine(): string {
        return `var runHidden = ${this.runHidden};

            application.setInterface({
                execute: function (codeString, context, cb) {
                    // populate global self with context
                    self = Object.assign(self, context);
                    
                    try {
                        var res = runHidden(codeString);
                        cb({output: res});
                    } catch(e) {
                        cb({error: e.message});
                    }
                }
            })`;
    }

    // protects even the worker scope from being accessed
    public runHidden(code): any {

        const indexedDB = undefined;
        const location = undefined;
        const navigator = undefined;
        const onerror = undefined;
        const onmessage = undefined;
        const performance = undefined;
        const self = undefined;
        const webkitIndexedDB = undefined;
        const postMessage = undefined;
        const close = undefined;
        const openDatabase = undefined;
        const openDatabaseSync = undefined;
        const webkitRequestFileSystem = undefined;
        const webkitRequestFileSystemSync = undefined;
        const webkitResolveLocalFileSystemSyncURL = undefined;
        const webkitResolveLocalFileSystemURL = undefined;
        const addEventListener = undefined;
        const dispatchEvent = undefined;
        const removeEventListener = undefined;
        const dump = undefined;
        const onoffline = undefined;
        const ononline = undefined;
        const importScripts = undefined;
        const console = undefined;
        const application = undefined;

        return eval(code);
    }

    // converts the output into a string
    public stringify(output: any): string {

        if (typeof output === "undefined") {
            return "undefined";
        } else {
            return output.toString(); // everything except undefined will be a string
        }
    }
}
