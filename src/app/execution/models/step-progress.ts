import {ExecutionState} from "./types";

export class StepExecution {
    /** Step ID */
    readonly id: string;

    /** Step label, used for displaying step names. Should fall back to ID */
    readonly label?: string;

    /** Current execution state of this particular step */
    readonly state: ExecutionState;

    /** Timestamp of when the step execution started (ms) */
    readonly startTime?: number;

    /** Timestamp of when the step execution ended (ms) */
    readonly endTime?: number;


    constructor(id: string,
                label?: string,
                state: ExecutionState = "pending",
                startTime?: number,
                endTime?: number) {

        this.id        = id;
        this.label     = label || id;
        this.state     = state;
        this.startTime = startTime;
        this.endTime   = endTime;
    }

    /**
     * Creates a new StepExecution object based on updated properties.
     */
    update(parameters: Partial<StepExecution>): StepExecution {
        const update = Object.assign({}, this, parameters);
        return new StepExecution(update.id, update.label, update.state, update.startTime, update.endTime);
    }

    transitionTo(state: ExecutionState): StepExecution {

        if (state === this.state) {
            return this;
        }

        switch (state) {
            case "pending":
            case "stopped":
                return this.update({state, startTime: undefined, endTime: undefined});
            case "started":
                return this.update({state, startTime: Date.now(), endTime: undefined});
            case "completed":
            case "failed":
                return this.update({state, endTime: Date.now()});
        }

        return this;


    }


}
