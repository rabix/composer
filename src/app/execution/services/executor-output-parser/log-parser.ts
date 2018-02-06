import {ExecutionState} from "../../models";
import {Optional} from "../../utilities/types";

/**
 * Parses a block of Bunny log text in order to try to extract information about
 * step progress (starting, stopping, failures).
 */
export function parseContent(text: string): Map<Optional<string>, ExecutionState> {

    const lines = text.split("\n");
    const state = new Map<Optional<string>, ExecutionState>();

    for (let i = 0; i < lines.length; i++) {
        const parsed = parseLine(lines[i]);

        if (!parsed) {
            continue;
        }

        const {stepID, status} = parsed;
        state.set(stepID, status);
    }

    return state;
}

/**
 * Parses a log line, trying to determine if it contains information about steps starting, stopping, or failing.
 */
export function parseLine(content: string): {
    stepID;
    status: ExecutionState,
} {

    const expression = [
        // Has something that contains “Job root.
        "Job root",
        // Group 0,1: then match the word after the dot, which is a step ID
        "\\.(.*?)",
        // Group 2: capture whatever optionally follows, then discard captured value
        // |- whitespace (in “root.compile has started”)
        // |- dot (in “root.compile.subStep has started”)
        // |- comma (in “root.compile, job id 32454 has failed”)
        "(\\s|,.*?|\\..*?)?",
        // Group 3: then match the state that the executor flushes
        "(has\\scompleted|has\\sstarted|failed)",
    ].join("");

    const matcher = new RegExp(expression, "i");
    const match   = content.match(matcher);

    if (match) {

        const [all, stepID, rest, stateMatch] = match;

        let status: ExecutionState = "failed";

        // FIXME: Might match completion status for a sub-step, which we should ignore, needs better communication with bunny
        if (rest.startsWith(".")) {
            return;
        }

        if (stateMatch === "has completed") {
            status = "completed";
        } else if (stateMatch === "has started") {
            status = "started";
        }

        return {stepID, status};
    }
}
