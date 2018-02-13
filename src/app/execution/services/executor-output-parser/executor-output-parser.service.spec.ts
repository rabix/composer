import {ExecutorOutputParser} from "./executor-output-parser.service";
import {provideMockActions} from "@ngrx/effects/testing";
import {Action} from "@ngrx/store";
import {TestBed} from "@angular/core/testing";
import {
    ExecutorOutputAction,
    ExecutionStepStartedAction,
    ExecutionStepCompletedAction,
    ExecutionStepFailedAction
} from "../../actions/execution.actions";
import {ReplaySubject} from "rxjs/ReplaySubject";
import objectContaining = jasmine.objectContaining;

describe("ExecutorOutputParserService", () => {

    let service: ExecutorOutputParser;
    let dispatch: (action: Action) => void;
    const missingStreamValueTimeout = 20;

    beforeEach(() => {

        const actionSource = new ReplaySubject();

        dispatch = (action: Action) => actionSource.next(action);

        TestBed.configureTestingModule({
            imports: [],
            providers: [
                provideMockActions(actionSource),
                ExecutorOutputParser
            ]
        });

        service = TestBed.get(ExecutorOutputParser);
    });

    it("produces an ExecutionStepStartedAction", done => {

        dispatch(new ExecutorOutputAction("my_app_id", "Job root.my_step_id has started"));

        service.stepStates.subscribe((result: ExecutionStepStartedAction) => {
            expect(result instanceof ExecutionStepStartedAction).toBeTruthy();
            expect(result.appID).toBe("my_app_id");
            expect(result.stepID).toBe("my_step_id");
            done();
        }, err => done.fail(err));

    }, missingStreamValueTimeout);

    it("produces an ExecutionStepCompletedAction", done => {
        dispatch(new ExecutorOutputAction("my_app_id", "Job root.my_step_id has completed"));

        service.stepStates.subscribe((result: ExecutionStepCompletedAction) => {
            expect(result instanceof ExecutionStepCompletedAction).toBeTruthy();
            expect(result).toEqual(objectContaining<ExecutionStepCompletedAction>({
                appID: "my_app_id",
                stepID: "my_step_id"
            }));

            done();
        }, err => done.fail(err));

    }, missingStreamValueTimeout);

    it("produces an ExecutionStepFailedAction", done => {
        const msg = "Job root.my_step_id failed with exit code 1. with message: \nError: no FASTA files specified\n";

        dispatch(new ExecutorOutputAction("my_app_id", msg));

        service.stepStates.subscribe((result: ExecutionStepFailedAction) => {

            expect(result instanceof ExecutionStepFailedAction).toBeTruthy();
            expect(result).toEqual(objectContaining<ExecutionStepFailedAction>({
                appID: "my_app_id",
                stepID: "my_step_id"
            }));

            done();

        }, err => done.fail(err));

    }, missingStreamValueTimeout);

});
