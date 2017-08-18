import {app} from "electron";
import * as fs from "fs-extra";
import * as winston from "winston";

const logDir = app.getPath("userData") + "/logs";

const logFilePath = logDir + "/composer.log";
fs.ensureFileSync(logFilePath);

export const Log = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: "debug",
            colorize: true,
            timestamp: true
        }),
        new winston.transports.File({
            level: "debug",
            colorize: false,
            timestamp: true,
            json: true,
            filename: logFilePath,
            handleExeptions: true,
            exitOnError: false
        })
    ],
    exitOnError: false
});
