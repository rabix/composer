import {NgModule} from "@angular/core";
import {CommandParameterTypePipe} from "./pipes/command-parameter-type.pipe";
import {CommandOutputGlobPipe} from "./pipes/command-output-glob.pipe";
import {CommandInputBindingPipe} from "./pipes/command-input-binding.pipe";
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
