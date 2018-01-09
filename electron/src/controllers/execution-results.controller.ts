import * as os from "os";

const path = require("path");

export const defaultExecutionOutputDirectory = [os.homedir(), "RabixComposer", "Executions"].join(path.sep);

export function makeOutputDirectoryName(outputDir, appID, user = "local", time = new Date()) {

    const base = outputDir + path.sep + "execution-results";

    let projectSlug;
    let appSlug;
    let executionDate = [
        time.getFullYear(),
        time.getMonth() + 1,
        time.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
    ].map((el, i) => {
        if (i > 0 && el.toString().length < 2) {
            return "0" + el;
        }

        return el;
    }).join("-");

    if (user === "local") {
        appSlug = path.basename(appID).split(".").slice(0, -1).join(".");
    } else {
        [, projectSlug, appSlug] = appID.split("/");
    }


    const fullPath = [
        base,
        user,
        projectSlug,
        appSlug,
        executionDate
    ].filter(v => v).join(path.sep);

    return fullPath;

}
