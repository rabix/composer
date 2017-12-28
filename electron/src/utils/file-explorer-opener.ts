import {spawn} from "child_process";

export function open(target) {

    let opener = "nautilus";

    if (process.platform === "darwin") {
        opener = "open"
    } else if (process.platform === "win32") {
        opener = "start";
    }

    spawn(opener, [target], {detached: true});

}
