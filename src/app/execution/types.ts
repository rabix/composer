export type AppType = "Workflow" | "CommandLineTool";


export interface ComposerLogEntry {
    message?: string;
    status: "READY" | "COMPLETED" | "FAILED" | "DOCKER_PULL_FAILED";
}

export interface StepInfoLogEntry extends ComposerLogEntry {
    status: "READY" | "COMPLETED" | "FAILED";
    stepId: string;
}

export interface DockerPullTryLogEntry extends ComposerLogEntry {
    status: "DOCKER_PULL_FAILED"
    image: string;
    message: string;
    retry: number;
}
