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

                const output: string = self.stringify(data.output);
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

        const $job: string = this.exposedJob ? JSON.stringify(this.exposedJob): undefined;
        const $self: string = this.exposedSelf ? JSON.stringify(this.exposedSelf): undefined;

        //Not using ES6 here, because this code is loaded at runtime, and we can't be sure that the browser supports ES6
        const expressionCode = this.createExpressionCode(codeToExecute, $job, $self);

        this.plugin = new jailed.DynamicPlugin(expressionCode, this.jailedApi);
    }

    private createExpressionCode(codeToExecute, $job, $self) {
        return `var runHidden = ${this.runHidden};
           
            var execute = function(codeString, job, self) {
            
                var result = {
                    output: undefined,
                    error: undefined
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
            + "execute(" + codeToExecute + "," + $job + "," + $self + ")";
    }

    // protects even the worker scope from being accessed
    public runHidden(code, $job?, $self?) {

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
