import fs = require("fs");
import yaml = require("js-yaml");
import request = require("request");
import {LoadOptions} from "js-yaml";

function isUrl(s) {
    const regexp = /^(ftp|http|https):\/\/.*/i;
    return regexp.test(s);
}

function traverse(data, source, root, graph = {}) {
    return new Promise((resolve, reject) => {

        const future = [];

        for (let key in data) {

            const entry = data[key];

            const isExternalResource = typeof entry === "string" && [
                "run",
                "$mixin",
                "$import",
                "$include"
            ].indexOf(key) !== -1;

            const isGraphReference    = isExternalResource && key === "run" && entry.startsWith("#");
            const isGraphSubreference = !isExternalResource && typeof entry === "string" && entry.startsWith("#") && entry.indexOf("/") !== -1;

            if (isGraphSubreference) {

                const [graphKey, ...rest] = entry.substr(1).split("/");
                const remains             = rest.join("/");

                if (graph[graphKey]) {
                    data[key] = remains;
                    future.push(Promise.resolve(1));
                } else {
                    future.push(Promise.reject(`Could not dereference a non-existing $graph path for “${entry}”`));
                }


            } else if (isGraphReference) {
                const embedding = new Promise((resolve, reject) => {
                    const graphID = entry.slice(1);
                    if (graph[graphID]) {

                        Object.assign(data, {
                            [key]: graph[graphID]
                        });

                        resolve();
                        return;
                    }

                    reject(`Graph id “${entry}” has no corresponding $graph entry`);
                });

                future.push(embedding);
            } else if (isExternalResource) {
                future.push(new Promise((resolve, reject) => {

                    let externalPath = source.split("/").slice(0, -1).concat(entry).join("/");
                    if (isUrl(entry) || (!isUrl(source) && entry.startsWith("/"))) {
                        externalPath = entry;
                    }

                    let patchFn;

                    fetch(externalPath, {
                        type: key === "$include" ? "text" : "json"
                    }).then((content) => {

                        switch (key) {

                            case "$import":
                                Object.keys(data).forEach(k => delete data[k]);
                                Object.assign(data, content);
                                break;
                            case "$include":
                                data[key] = content;

                                break;

                            case "$mixin":
                                const newData = {};
                                for (let k in data) {
                                    if (k === "$mixin") {
                                        Object.assign(newData, content);
                                        continue;
                                    }
                                    newData[k] = data[k];
                                }

                                Object.keys(data).forEach(k => delete data[k]);
                                Object.assign(data, newData);

                                break;
                            case "run":
                            default:
                                Object.assign(data, {
                                    [key]: content,
                                    "sbg:rdfId": entry,
                                    "sbg:rdfSource": externalPath
                                });
                                break;
                        }

                        resolve(patchFn);
                    }, reject);
                }));
            } else if (entry && typeof entry === "object") {
                future.push(traverse(entry, source, root, graph));
            } else {
                future.push(new Promise(resolve => resolve()));
            }
        }

        Promise.all(future).then(() => {

            Object.keys(data).forEach(k => {

                if (data[k] !== null && typeof data[k] === "object" && !Array.isArray(data[k]) && data[k]["$include"]) {
                    data[k] = data[k]["$include"];
                }
            });

            resolve(data);
        }, reject);
    });
}

function parseJSON(content, source, root?, graph?) {
    return new Promise((resolve, reject) => {
        const data = yaml.safeLoad(content, {
            filename: source,
            onWarning: (warning) => {
                console.log(warning);
            },
            json: true
        } as LoadOptions) || {};

        if (!graph) {
            graph = {};
            if (data.$graph && Array.isArray(data.$graph)) {
                graph = data.$graph.reduce((acc, entry) => {
                    return Object.assign(acc, {[entry.id]: entry});
                }, {});
            }
        }

        traverse(data, source, root, graph).then(resolve, reject);
    });
}

/**
 * @param filename
 * @param options
 * @returns {Promise<Object>|Promise}
 */
function fetch(filename, options) {

    options = Object.assign({
        type: "json"
    }, options);

    return new Promise((resolve, reject) => {

        let call = new Promise((resolve, reject) => {
            if (isUrl(filename)) {
                request(filename, (err, response, body) => {
                    if (err) return reject(err);
                    resolve(body);
                });
            } else {
                fs.readFile(filename, {encoding: "utf8", flag: "r"}, (err, data) => {
                    if (err) return reject(err);

                    resolve(data);
                });
            }
        });

        call.then((body) => {
            if (options.type === "json") {
                try {
                    parseJSON(body, filename).then(resolve, reject);
                } catch (ex) {
                    reject(ex);
                }
            } else {
                resolve(body);
            }
        }, reject);
    });
}

/**
 *
 * @type {resolve}
 */
module.exports = {
    resolve: fetch,
    resolveContent: (content, path): Promise<Object> => {
        return new Promise((resolve, reject) => {
            try {
                parseJSON(content, path, content).then(resolve, reject);
            } catch (ex) {
                reject(ex);
            }
        })
    },
};
