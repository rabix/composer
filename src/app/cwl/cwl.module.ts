import {NgModule} from "@angular/core";
import {CommandInputBindingPipe} from "./pipes/command-input-binding.pipe";
import {CommandOutputGlobPipe} from "./pipes/command-output-glob.pipe";
import {CommandParameterTypePipe} from "./pipes/command-parameter-type.pipe";

@NgModule({
    declarations: [
        CommandParameterTypePipe,
        CommandOutputGlobPipe,
        CommandInputBindingPipe
    ],
    exports: [
        CommandParameterTypePipe,
        CommandOutputGlobPipe,
        CommandInputBindingPipe
    ]
})
export class CWLModule {

}
