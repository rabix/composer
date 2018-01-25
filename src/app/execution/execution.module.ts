import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {StoreModule} from "@ngrx/store";
import {reducers} from "./reducers";
import {ExecutionStatusComponent} from "./components/execution-status/execution-status.component";
import {UIModule} from "../ui/ui.module";
import {ExecutorService2} from "./services/executor/executor.service";

@NgModule({
    imports: [
        CommonModule,
        UIModule,
        StoreModule.forFeature("execution", reducers)
    ],
    declarations: [
        ExecutionStatusComponent
    ],
    exports: [
        ExecutionStatusComponent
    ],
    providers:[
        ExecutorService2
    ]
})
export class ExecutionModule {
}
