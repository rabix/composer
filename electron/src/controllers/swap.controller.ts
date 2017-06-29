import * as fs from "fs";
import * as md5 from "md5";
import * as mkdirp from "mkdirp";

export class SwapController {

    private rootDir: string;

    private writeQueue: { [fp: string]: Function[] } = {};

    constructor(rootDir: string) {
        this.rootDir = rootDir;
        mkdirp(this.rootDir, (err, made) => {
            if (err) {
                console.log("Failed to make root dir", this.rootDir, err);
            }
        });
    }

    write(fp: string, content: string, callback: (err?: Error, success?: any) => void) {

        const fullPath = this.makeHashedPath(fp);

        this.enqueueWrite(fullPath, content, callback);
    }

    remove(fp: string, callback: (err?: Error, data?: any) => void) {
        const hash = this.makeHashedPath(fp);

        fs.unlink(hash, (err?, done?) =>{
            // Ignore failures, just return when it's done.
            // It might not be there in the first place, so the error is fine.
            callback(null, done);
        });
    }

    exists(fp: string, callback: (err?: Error, data?: boolean) => void) {
        const fullPath = this.makeHashedPath(fp);

        fs.open(fullPath, "r", (err, fd) => {
            if (err) {
                if (err.code === "ENOENT") {
                    return callback(null, false);
                }

                return callback(err);
            }

            callback(null, true);
        });
    }

    read(fp: string, callback: (err?: Error, data?: string) => void) {
        const fullPath = this.makeHashedPath(fp);

        fs.readFile(fullPath, "utf8", callback);
    }

    private makeHashedPath(fp: string): string {
        return this.rootDir + "/" + this.hash(fp);
    }

    private hash(path: string): string {
        return md5(path);
    }

    private enqueueWrite(fp: string, content: string, callback: (err?: Error, data?: any) => void) {
        if (!this.writeQueue[fp]) {
            this.writeQueue[fp] = [];
        }
        const pathQueue = this.writeQueue[fp];

        const executor = () => {
            fs.writeFile(fp, content, "utf8", (err?, data?) => {
                if (err) return callback(err);

                callback(null, data);

                pathQueue.shift();

                if (pathQueue.length) {
                    pathQueue[0]();
                }

            });

        };

        if (pathQueue.length === 2) {
            pathQueue[1] = executor;
            return;
        }

        if (pathQueue.length === 1) {
            pathQueue.push(executor);
            return;
        }

        if (pathQueue.length === 0) {
            pathQueue.push(executor);
            pathQueue[0]();
        }
    }
}
