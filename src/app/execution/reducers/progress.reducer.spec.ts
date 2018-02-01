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

                const action = new ExecutionPreparedAction("myApp", [
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
        });
    });
});
