import {spawn} from "child_process";

export function open(target) {

    const isWindows = process.platform === "win32";
    const isMac     = process.platform === "darwin";

    // Windows does not recognize start as a program, but as a command
    // Calling it works in cmd, but not through spawning a process in that manner
    // So we need to invoke “start” through cmd
    if (isWindows) {
        spawn("cmd", ["/s", "/c", "start", target], {detached: true});
        return;
    }

    spawn(isMac ? "open" : "nautilus", [target], {detached: true});
}
