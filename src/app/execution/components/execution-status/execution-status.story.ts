import {storiesOf} from "@storybook/angular";
import {action} from "@storybook/addon-actions";
import {MomentModule} from "angular2-moment";
import {ExecutionStatusComponent} from "./execution-status.component";
import {ExecutionError} from "../../models";

const statusPanelDefualts = {
    component: ExecutionStatusComponent,
    moduleMetadata: {
        imports: [MomentModule]
    }
};

storiesOf("Execution Status Panel", module)
    .add("with pristine description", () => ({
        ...statusPanelDefualts,
        props: {
            appID: "test-app-id",
        } as Partial<ExecutionStatusComponent>
    }))
    .add("step state overview", () => ({
        ...statusPanelDefualts,
        props: {
            isRunning: true,
            stepStates: [
                {id: "step_a", label: "Mike", state: "pending"},
                {id: "step_b", label: "Bob", state: "started", startTime: Date.now() - 33125},
                {id: "step_c", label: "Joe", state: "completed", startTime: Date.now() - 43211, endTime: Date.now()},
                {id: "step_d", label: "Danny", state: "failed"},
                {id: "step_e", label: "Nick", state: "stopped"},
                {id: "step_f", label: "Fred", state: "stopped"},
                {id: "step_g", label: "Joel", state: "stopped"},
                {id: "step_h", label: "Chris", state: "stopped"},
                {id: "step_i", label: "Ronald", state: "stopped"},
                {id: "step_j"},
                {id: "step_k", state: "stopped"},
            ]
        } as Partial<ExecutionStatusComponent>
    }))
    .add("execution error", () => ({
        ...statusPanelDefualts,
        props: {
            isRunning: true,
            stepStates: [
                {id: "step_a", label: "Step A", state: "completed"},
                {id: "step_b", label: "Step B", state: "failed"}
            ],
            error: new ExecutionError(127, "This is an error message")
        } as Partial<ExecutionStatusComponent>
    }));
