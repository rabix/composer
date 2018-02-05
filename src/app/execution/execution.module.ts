import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {StoreModule, ActionReducer, MetaReducer} from "@ngrx/store";
import {reducers} from "./reducers";
import {ExecutionStatusComponent} from "./components/execution-status/execution-status.component";
import {UIModule} from "../ui/ui.module";
import {ExecutorService2} from "./services/executor/executor.service";
import {MomentModule} from "angular2-moment";
import {EffectsModule} from "@ngrx/effects";
import {ExecutorOutputParser} from "./services/executor-output-parser/executor-output-parser.service";
import {ExecutionDurationPipe} from "./pipes/execution-duration.pipe";

export function debug(reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state, action) {
        console.log("Action", action);
        console.log("State", state);

        return reducer(state, action);
    };
}

export const metaReducers: MetaReducer<any>[] = [
    // debug
];

@NgModule({
    imports: [
        CommonModule,
        UIModule,
        MomentModule,
        StoreModule.forFeature("execution", reducers, {
            metaReducers
        }),
        EffectsModule.forFeature([ExecutorOutputParser])
    ],
    declarations: [
        ExecutionStatusComponent,
        ExecutionDurationPipe
    ],
    exports: [
        ExecutionStatusComponent
    ],
    providers: [
        ExecutorService2,
    ]
})
export class ExecutionModule {
}
