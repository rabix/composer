import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
const jailed = require('jailed');

export interface SandboxResponse {
    output: string,
    error: string
}

export class SandboxService {

    /** External Job exposed to the jailedApi */
    public exposedJob: Object;

    public exposedSelf: Object;

    /** Object exposed to Jailed */
    private jailedApi: Object;

    /** Jailed plugin instance */
    private plugin: any;

    /** Result of the expression evaluation */
    public expressionResult: Observable<SandboxResponse>;

    private updateExpressionResult: BehaviorSubject<SandboxResponse> = new BehaviorSubject<SandboxResponse>(undefined);

    constructor() {
        const self = this;

        this.expressionResult = this.updateExpressionResult
            .publishReplay(1)
            .refCount();

        this.jailedApi = {
            output: function(data) {
                const output: string = self.escape(self.stringify(data.output));
                const error: string = data.error;

                self.updateExpressionResult.next({
                    output: output,
                    error: error
                });
            }
        };
    }

    // sends the input to the plugin for evaluation
    public submit(code): void {

        //make sure the code is a string
        const codeToExecute: string = JSON.stringify(code);

        const job: string = this.exposedJob ? JSON.stringify(this.exposedJob): undefined;
        const self: string = this.exposedSelf ? JSON.stringify(this.exposedSelf): undefined;

        // protects even the worker scope from being accessed
        const expressionCode = `
            function runHidden(code, $job, $self) {
            
                const indexedDB = null;
                const location = null;
                const navigator = null;
                const onerror = null;
                const onmessage = null;
                const performance = null;
                const self = null;
                const webkitIndexedDB = null;
                const postMessage = null;
                const close = null;
                const openDatabase = null;
                const openDatabaseSync = null;
                const webkitRequestFileSystem = null;
                const webkitRequestFileSystemSync = null;
                const webkitResolveLocalFileSystemSyncURL = null;
                const webkitResolveLocalFileSystemURL = null;
                const addEventListener = null;
                const dispatchEvent = null;
                const removeEventListener = null;
                const dump = null;
                const onoffline = null;
                const ononline = null;
                const importScripts = null;
                const console = null;
                const application = null;
            
                return eval(code);
            }
            
            function execute(codeString, job, self) {
            
                var result = {
                    output: null,
                    error: null
                };   
                
                try {
                    result.output = runHidden(codeString, job, self);
                } catch(e) {
                    result.error = e.message;
                }
                
                application.remote.output(result);
            }
            `
            // We don't use a template literal for the code,
            // because we want to evaluate it inside the worker.
            + "execute(" + codeToExecute + "," + job + "," + self + ")";

        this.plugin = new jailed.DynamicPlugin(expressionCode, this.jailedApi);
    }

    // prepares the string to be printed on the terminal
    private escape(msg: string): string {
        return msg.
        replace(/&/g,'&amp;').
        replace(/</g,'&lt;').
        replace(/>/g,'&gt;').
        replace(/\n/g, '<br/>').
        replace(/ /g, '&nbsp;');
    }

    // converts the output into a string
    private stringify(output: any): string {
        let result: any;

        if (typeof output === "string") {
            return output
        }

        if (typeof output === "undefined") {
            result = "undefined";
        } else if (output === null) {
            result = "null";
        } else {
            result = JSON.stringify(output) || output.toString();
        }

        return result;
    }
}
