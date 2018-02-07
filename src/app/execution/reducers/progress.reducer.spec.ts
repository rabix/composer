import {reducer} from "./progress.reducer";
import {TabCloseAction} from "../../core/actions/core.actions";
import {
    ExecutionPreparedAction,
    ExecutionCompletedAction,
    ExecutionStartedAction,
    ExecutionErrorAction,
    ExecutionStoppedAction,
    ExecutionStepStartedAction,
    ExecutionStepCompletedAction,
    ExecutionStepFailedAction
} from "../actions/execution.actions";
import {AppExecution, StepExecution} from "../models";
import objectContaining = jasmine.objectContaining;

describe("Execution module", () => {

    describe("progress", () => {

        describe("reducer", () => {

            /**
             * @name progress.reducer.tabCloseTest
             * @see progress.reducer.tabClose
             */
            it("should remove app progress when the app tab is closed", () => {
                const initialState = {foo: {}, bar: {}};
                const update       = reducer(initialState as any, new TabCloseAction("foo"));

                expect(update.foo).toBeUndefined();
                expect(update.bar).toBeTruthy();

            });

            it("should create an execution state object upon receiving a preparation event", () => {

                const action = new ExecutionPreparedAction("myApp", "Workflow", [
                    {id: "step_a", label: "Step A"},
                    {id: "step_b", label: "Step B"}
                ], "/my/outdir");

                const state = reducer({}, action);

                const app: AppExecution = state["myApp"] as any;


                expect(app).toBeTruthy();
                expect(app.stepExecution.length).toBe(2);
                expect(app).toEqual(objectContaining<AppExecution>({
                    outdir: action.outDirPath,
                    error: undefined,
                    state: "pending",
                }));


                const [stepA, stepB] = app.stepExecution;
                expect(stepA).toEqual(objectContaining<StepExecution>({
                    id: "step_a",
                    label: "Step A",
                    state: "pending",
                    endTime: undefined,
                    startTime: undefined,
                }));

                expect(stepB).toEqual(objectContaining<StepExecution>({
                    id: "step_b",
                    label: "Step B",
                    state: "pending",
                    endTime: undefined,
                    startTime: undefined,
                }));

            });

            it("should not react to post-prepare events when execution is not running", () => {
                const appID  = "test-app-id";
                const stepID = "test-step-id";

                const state = [
                    new ExecutionStartedAction(appID),
                    new ExecutionStepStartedAction(appID, stepID),
                    new ExecutionStepCompletedAction(appID, stepID),
                    new ExecutionStepFailedAction(appID, stepID),
                    new ExecutionCompletedAction(appID),
                    new ExecutionErrorAction(appID, 1),
                    new ExecutionStoppedAction(appID)
                ].reduce(reducer, {});

                expect(Object.getOwnPropertyNames(state).length).toBe(0);

            });

            it("should transition steps to pending state when starting a Workflow", () => {
                const appID = "/root/app-id";
                const state = reducer({
                    [appID]: new AppExecution("Workflow", "app-outdir", [new StepExecution("app-id", "App Step")])
                }, new ExecutionStartedAction(appID));

                expect(state[appID].stepExecution[0].state).toBe("pending");
            });

            describe("CommandLineTool transitions", () => {

                it("should move steps to started when starting app execution", () => {
                    const appID = "/root/app-id";
                    const state = reducer({
                        [appID]: new AppExecution("CommandLineTool", "app-outdir", [new StepExecution("app-id", "Only Step")])
                    }, new ExecutionStartedAction(appID));

                    expect(state[appID].stepExecution[0].state).toBe("started");
                });

                it("should move steps to completed when completing app execution", () => {
                    const appID = "/root/app-id";
                    const state = reducer({
                        [appID]: new AppExecution("CommandLineTool", "app-outdir", [new StepExecution("app-id", "Only Step")])
                    }, new ExecutionCompletedAction(appID));

                    expect(state[appID].stepExecution[0].state).toBe("completed");
                });

                it("should move steps to failed when erroring app execution", () => {
                    const appID = "/root/app-id";
                    const state = reducer({
                        [appID]: new AppExecution("CommandLineTool", "app-outdir", [new StepExecution("app-id", "Only Step")])
                    }, new ExecutionErrorAction(appID, 1));

                    expect(state[appID].stepExecution[0].state).toBe("failed");
                });

            });

        });
    });
});
