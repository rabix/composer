import {storiesOf} from "@storybook/angular";
import {MomentModule} from "angular2-moment";
import {ExecutionStatusComponent} from "./execution-status.component";
import {ExecutionError, AppExecution, StepExecution} from "../../models";
import {FileOpenerToken, DirectoryExplorerToken} from "../../interfaces";
import {ExecutionDurationPipe} from "../../pipes/execution-duration.pipe";

const statusPanelDefualts = {
    component: ExecutionStatusComponent,
    moduleMetadata: {
        imports: [MomentModule],
        declarations: [ExecutionDurationPipe],
        providers: [
            {
                provide: DirectoryExplorerToken, useValue: {
                    explore: () => void 0
                }
            },
            {
                provide: FileOpenerToken, useValue: {
                    open: () => void 0
                }
            }
        ]
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
            execution: new AppExecution("Workflow", "out", [
                new StepExecution("step_a", "Mike", "pending"),
                new StepExecution("step_b", "Bob", "started", Date.now() - 33125),
                new StepExecution("step_c", "Joe", "completed", Date.now() - 43211, Date.now()),
                new StepExecution("step_d", "Danny", "failed"),
                new StepExecution("step_e", "Nick", "stopped"),
                new StepExecution("step_f", "Fred", "stopped"),
                new StepExecution("step_g", "Joel", "stopped"),
                new StepExecution("step_h", "Chris", "stopped"),
                new StepExecution("step_i", "Ronald", "stopped"),
                new StepExecution("step_j"),
                new StepExecution("step_k", "Step K", "stopped"),
            ])
        } as Partial<ExecutionStatusComponent>
    }))

    .add("execution error", () => ({
        ...statusPanelDefualts,
        props: {
            execution: new AppExecution("Workflow", "outdir", [
                new StepExecution("step_a", "Step A", "completed"),
                new StepExecution("step_b", "Step B", "failed"),
            ], new ExecutionError(127, "Docker is missing", "requirement"), "failed")
        } as Partial<ExecutionStatusComponent>
    }))

    .add("step execution failed", () => ({
        ...statusPanelDefualts,
        props: {
            execution: new AppExecution("Workflow", "outdir", [
                new StepExecution("step_a", "Step A", "completed"),
                new StepExecution("step_b", "Step B", "failed"),
            ], new ExecutionError(1, "Some step failed", "execution"), "failed")
        }
    }));
