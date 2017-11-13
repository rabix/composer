const userDataPath = require("electron").app.getPath("userData");
const path         = require("path");

export function makeOutputDirectoryName(appID, user = "local", time = new Date()) {

    const base = userDataPath + path.sep + "execution-results";

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
