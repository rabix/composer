"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const async = require("async");
const settings = require("electron-settings");
const fsController = require("./fs.controller");
const cp = require("child_process");
let searchProcess;
const relevanceThreshold = 0.2;
function searchLocalProjects(term, limit = 10, callback) {
    if (searchProcess) {
        searchProcess.kill();
        searchProcess = undefined;
    }
    searchProcess = cp.fork(`${__dirname}/../workers/search-worker.js`);
    settings.get("localFolders").then(folders => {
        searchProcess.send({
            term,
            limit,
            folders,
            threshold: relevanceThreshold
        });
    }, err => callback(err));
    searchProcess.on("message", (data) => {
        if (data.err) {
            return callback(data.err);
        }
        async.reduce(data.results, [], (memo, item, itemDone) => {
            fsController.getFileOutputInfo(item.path, (err, info) => {
                if (err) {
                    return itemDone(err);
                }
                itemDone(null, memo.concat(__assign({}, item, info)));
            });
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    });
}
exports.searchLocalProjects = searchLocalProjects;
function searchUserProjects(term, limit = 10, callback) {
    settings.get("dataCache").then(profiles => {
        const apps = [];
        for (let profile in profiles) {
            profiles[profile].apps.forEach(app => {
                const relevance = fuzzysearch(term.split("").reverse().join("").toLowerCase(), app.id.split("").reverse("").join("").toLowerCase());
                if (relevance > relevanceThreshold) {
                    apps.push(__assign({}, app, { relevance, profile }));
                }
            });
        }
        const results = apps.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
        callback(null, results);
    }, err => callback(err));
}
exports.searchUserProjects = searchUserProjects;
/**
 *
 * @FIXME(refactor) This is a copy of the searchUserProjects funciton, fix the abstraction
 * @param term
 * @param limit
 * @param callback
 */
function searchPublicApps(term, limit = 10, callback) {
    settings.get("dataCache").then(profiles => {
        const apps = [];
        for (let profile in profiles) {
            profiles[profile].publicApps.forEach(app => {
                const relevance = fuzzysearch(term.split("").reverse().join("").toLowerCase(), app.id.split("").reverse("").join("").toLowerCase());
                if (relevance > relevanceThreshold) {
                    apps.push(__assign({}, app, { relevance, profile }));
                }
            });
        }
        const results = apps.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
        callback(null, results);
    }, err => callback(err));
}
exports.searchPublicApps = searchPublicApps;
/**
 * @FIXME(refactor) This is a copy of a fuzzy search from search-worker, put it into a separate module
 * @param needle
 * @param haystack
 * @returns {any}
 */
function fuzzysearch(needle, haystack) {
    const noSpaceNeedle = needle.replace(/ /g, "");
    const hlen = haystack.length;
    const nlen = noSpaceNeedle.length;
    if (nlen > hlen) {
        return 0;
    }
    if (nlen === hlen) {
        return 1;
    }
    let matchedCharacters = 0;
    let spacings = [];
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
    let totalDistance = spacings.reduce((acc, n) => acc + n, 0);
    let adjacencyBonus = haystack.length / (totalDistance * (haystack.length / spacings.length));
    let indexBonus = needle.split(" ").map(word => haystack.indexOf(word)).reduce((acc, idx) => acc + Number(idx !== -1), 0);
    let bonus = adjacencyBonus + indexBonus;
    return bonus + matchedCharacters / hlen;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvc2VhcmNoLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsK0JBQStCO0FBRS9CLE1BQU0sUUFBUSxHQUFPLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2hELE1BQU0sRUFBRSxHQUFhLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUU5QyxJQUFJLGFBQTJCLENBQUM7QUFDaEMsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFFL0IsNkJBQW9DLElBQUksRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLFFBQVE7SUFFMUQsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNoQixhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckIsYUFBYSxHQUFHLFNBQVMsQ0FBQztJQUM5QixDQUFDO0lBRUQsYUFBYSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLDhCQUE4QixDQUFDLENBQUM7SUFFcEUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTztRQUNyQyxhQUFhLENBQUMsSUFBSSxDQUFDO1lBQ2YsSUFBSTtZQUNKLEtBQUs7WUFDTCxPQUFPO1lBQ1AsU0FBUyxFQUFFLGtCQUFrQjtTQUNoQyxDQUFDLENBQUM7SUFFUCxDQUFDLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRXpCLGFBQWEsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSTtRQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNYLE1BQU0sQ0FBQyxRQUFR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