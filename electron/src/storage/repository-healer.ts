import * as fs from "fs-extra";
import {LocalRepository} from "./types/local-repository";

export function heal(repository: LocalRepository, key?: keyof LocalRepository): Promise<boolean> {

    const fixes = [] as Promise<any>[];
    let modified = false;

    return new Promise((resolve, reject) => {

        if (key === "localFolders" || !key) {

            if (!Array.isArray(repository.localFolders)) {
                repository.localFolders = [];
            }

            const checks = [];
            repository.localFolders = repository.localFolders.filter((v, i, arr) => {
                const isString = typeof v === "string";
                const isUnique = arr.indexOf(v) === i;
                return isString && isUnique;
            });

            for (let i = 0; i < repository.localFolders.length; i++) {

                const dirPath = repository.localFolders[i];

                const access = new Promise((res, rej) => {

                    console.log("healing", dirPath);
                    fs.stat(dirPath, (err, stats) => {

                        if (err || !stats.isDirectory()) {
                            console.log("Removing", dirPath);
                            repository.localFolders.splice(i, 1);
                            modified = true;
                        }
                        res();
                    });

                });
                checks.push(access);
            }

            fixes.push(Promise.all(checks));
        }


        Promise.all(fixes).then(() => resolve(modified), reject);

    });
}
