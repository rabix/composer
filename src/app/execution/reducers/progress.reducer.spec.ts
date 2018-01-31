import {reducer} from "./progress.reducer";
import {TabCloseAction} from "../../core/actions/core.actions";
import {ExecutionStartAction} from "../actions/execution.actions";
import {AppExecution} from "../models";
import {StepExecution} from "../models/step-progress";
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

            it("should create an execution state object upon receiving an ExecutionStartAction event", () => {

                const action = new ExecutionStartAction("myApp", [
                    {id: "step_a", label: "Step A"},
                    {id: "step_b", label: "step_b"}
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

        });
    })
});
