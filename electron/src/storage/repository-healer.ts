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
                return typeof v === "string" && arr.indexOf(v) === i;
            });

            for (let i = 0; i < repository.localFolders.length; i++) {

                const dirPath = repository.localFolders[i];

                const access = new Promise((res, rej) => {

                    fs.stat(dirPath, (err, stats) => {

                        if (err || !stats.isDirectory()) {
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
