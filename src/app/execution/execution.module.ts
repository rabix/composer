import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {StoreModule} from "@ngrx/store";
import {reducers} from "./reducers";
import {ExecutionStatusComponent} from "./components/execution-status/execution-status.component";
import {UIModule} from "../ui/ui.module";
import {ExecutorService2} from "./services/executor/executor.service";
import {MomentModule} from "angular2-moment";

@NgModule({
    imports: [
        CommonModule,
        UIModule,
        MomentModule,
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
