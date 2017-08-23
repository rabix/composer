import {app} from "electron";
import * as fs from "fs-extra";
import * as winston from "winston";
import * as path from "path";

const logDir = app.getPath("userData") + path.sep + "logs";

const logFilePath = logDir + path.sep + "composer.log";
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
