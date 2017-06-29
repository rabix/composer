import * as fs from "fs";
import * as async from "async";
import * as path from "path";

let term: string;
let limit: number;
let threshold: number;
let folders: string[];
let results: any[] = [];
// let traversedFolders = [];

process.on("message", (data: { term: string, threshold: number, limit: number, folders: string[] }) => {

    term      = data.term.split("").reverse().join("").toLowerCase();
    limit     = data.limit;
    threshold = data.threshold || 0;
    folders   = data.folders.filter((f, idx, arr) => arr.indexOf(f) === idx);

    const promises = folders.map(folder => new Promise((resolve, reject) => {
        recurseFolder(folder, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(null);
        });
    }));

    Promise.all(promises).then(_ => {
        process.send({
            success: true,
            results: results.sort((a, b) => b.relevance - a.relevance).slice(0, limit)
        })
    });


});

function terminate(err) {
    process.send({
        success: false,
        err
    });
}


function fuzzysearch(needle, haystack) {

    const noSpaceNeedle = needle.replace(/ /g, "");
    const hlen          = haystack.length;
    const nlen          = noSpaceNeedle.length;

    if (nlen > hlen) {
        return 0;
    }
    if (nlen === hlen) {
        return 1;
    }
    let matchedCharacters = 0;
    let spacings          = [];

    let previousFoundIndex = 0;

    outer: for (let i = 0, j = 0; i < nlen; i++) {
        let nch = noSpaceNeedle.charCodeAt(i);
        while (j < hlen) {
            if (haystack.charCodeAt(j++) === nch) {
                spacings.push(j - previousFoundIndex);
                previousFoundIndex = j;
                matchedCharacters++;

                continue outer;
            }
        }
        return 0;
    }
    let totalDistance  = spacings.reduce((acc, n) => acc + n, 0);
    let adjacencyBonus = haystack.length / (totalDistance * (haystack.length / spacings.length));
    let indexBonus     = needle.split(" ").map(word => haystack.indexOf(word)).reduce((acc, idx) => acc + Number(idx !== -1), 0);
    let bonus          = adjacencyBonus + indexBonus;

    return bonus + matchedCharacters / hlen;
}

function getRelevance(strPath) {
    if (!
            (strPath.endsWith(".yaml")
            || strPath.endsWith(".json")
            || strPath.endsWith(".yml")
            || strPath.endsWith(".cwl"))
    ) {
        return 0;
    }

    return fuzzysearch(term, strPath.split("").reverse().join("").toLowerCase());
}


function recurseFolder(folderPath, folderTraversed) {
    // if (traversedFolders.indexOf(folderPath) !== -1) {
    //     return folderTraversed(null);
    // }

    fs.readdir(folderPath, (err, files) => {
        // traversedFolders.push(folderPath);

        if (err) {
            folderTraversed(err);
            return terminate(err);
        }
        if (!files) {
            return folderTraversed(null);
        }

        async.each(files, (filepath, fileRead) => {
            let strPath;
            try {
                strPath = path.join(folderPath, filepath);
            } catch (e) {
                return fileRead(null);
            }

            fs.lstat(strPath, (err, stat) => {
                if (err || !stat) {
                    return fileRead(null);
                }


                const relevance = getRelevance(strPath);
                if (relevance > threshold) {
                    results.push({
                        path: strPath,
                        relevance
                    });
                }

                if (stat.isDirectory()) {
                    recurseFolder(strPath, (err) => {
                        return fileRead(null);
                    })
                } else {
                    return fileRead(null);
                }
            });


        }, (err) => {
            if (err) {
                return folderTraversed(err);
            }

            folderTraversed(null);
        });
    });
}

