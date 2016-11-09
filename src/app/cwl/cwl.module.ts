import {NgModule} from "@angular/core";
import {CommandOutputTypePipe} from "./pipes/command-output-type.pipe";
import {CommandOutputGlobPipe} from "./pipes/command-output-glob.pipe";
@NgModule({
    declarations: [
        CommandOutputTypePipe,
        CommandOutputGlobPipe
    ],
    exports: [
        CommandOutputTypePipe,
        CommandOutputGlobPipe
    ]
})
export class CWLModule {

}