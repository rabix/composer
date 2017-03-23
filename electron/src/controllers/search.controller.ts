import {ChildProcess} from "child_process";
import * as async from "async";

const settings     = require("electron-settings");
const fsController = require("./fs.controller");
const cp           = require("child_process");

let searchProcess: ChildProcess;
const relevanceThreshold = 0.1;

export function searchLocalProjects(folders: string[] = [], term: string, limit = 10, callback) {

    console.log("Searching through local folders", folders);

    if (searchProcess) {
        searchProcess.kill();
        searchProcess = undefined;
    }

    searchProcess = cp.fork(`${__dirname}/../workers/search-worker.js`);

    searchProcess.send({
        term,
        limit,
        folders,
        threshold: relevanceThreshold
    });

    searchProcess.on("message", (data) => {
        if (data.err) {
            searchProcess.kill();
            return callback(data.err);
        }

        async.reduce(data.results, [], (memo, item, itemDone) => {
            fsController.getFileOutputInfo(item.path, (err, info) => {
                if (err) {
                    return itemDone(err);
                }
                itemDone(null, memo.concat({...item, ...info}));
            });
        }, (err, results) => {
            if (err) {
                searchProcess.kill();
                return callback(err);
            }

            callback(null, results);
            searchProcess.kill();
        });

    });
}

export function searchUserProjects(term, limit = 10, callback) {
    settings.get("dataCache").then(profiles => {
        const apps = [];
        for (let profile in profiles) {
            profiles[profile].apps.forEach(app => {
                const relevance = fuzzysearch(term.split("").reverse().join("").toLowerCase(), app.id.split("").reverse("").join("").toLowerCase())
                if (relevance > relevanceThreshold) {
                    apps.push({...app, relevance, profile});
                }
            });
        }
        const results = apps.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
        callback(null, results);
    }, err => callback(err));
}

/**
 *
 * @FIXME(refactor) This is a copy of the searchUserProjects funciton, fix the abstraction
 * @param term
 * @param limit
 * @param callback
 */
export function searchPublicApps(term, limit = 10, callback) {
    settings.get("dataCache").then(profiles => {
        const apps = [];
        for (let profile in profiles) {
            profiles[profile].publicApps.forEach(app => {
                const relevance = fuzzysearch(term.split("").reverse().join("").toLowerCase(), app.id.split("").reverse("").join("").toLowerCase())
                if (relevance > relevanceThreshold) {
                    apps.push({...app, relevance, profile});
                }
            });
        }
        const results = apps.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
        callback(null, results);
    }, err => callback(err));
}

/**
 * @FIXME(refactor) This is a copy of a fuzzy search from search-worker, put it into a separate module
 * @param needle
 * @param haystack
 * @returns {any}
 */
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
