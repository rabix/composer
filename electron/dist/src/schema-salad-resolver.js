"use strict";
const fs = require("fs");
const request = require("request");
const yaml = require("js-yaml");
function isUrl(s) {
    const regexp = /^(ftp|http|https):\/\/.*/i;
    return regexp.test(s);
}
function traverse(data, source) {
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
            if (isExternalResource) {
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
                                debugger;
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
            }
            else if (entry && typeof entry === "object") {
                future.push(traverse(entry, source));
            }
            else {
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
function parseJSON(content, source) {
    return new Promise((resolve, reject) => {
        const data = yaml.safeLoad(content, {
            filename: source,
            onWarning: (warning) => {
                console.log(warning);
            },
            json: true
        }) || {};
        traverse(data, source).then(resolve, reject);
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
                    if (err)
                        return reject(err);
                    resolve(body);
                });
            }
            else {
                fs.readFile(filename, { encoding: "utf8", mode: "r" }, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve(data);
                });
            }
        });
        call.then((body) => {
            if (options.type === "json") {
                try {
                    parseJSON(body, filename).then(resolve, reject);
                }
                catch (ex) {
                    reject(ex);
                }
            }
            else {
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
    resolveContent: (content, path) => {
        return new Promise((resolve, reject) => {
            try {
                parseJSON(content, path).then(resolve, reject);
            }
            catch (ex) {
                reject(ex);
            }
        });
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLXNhbGFkLXJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjaGVtYS1zYWxhZC1yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEseUJBQTBCO0FBRTFCLG1DQUFvQztBQUNwQyxnQ0FBaUM7QUFFakMsZUFBZSxDQUFDO0lBQ1osTUFBTSxNQUFNLEdBQUcsMkJBQTJCLENBQUM7SUFDM0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELGtCQUFrQixJQUFJLEVBQUUsTUFBTTtJQUMxQixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtRQUUvQixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFbEIsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVuQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFeEIsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUk7Z0JBQ2hELEtBQUs7Z0JBQ0wsUUFBUTtnQkFDUixTQUFTO2dCQUNULFVBQVU7YUFDYixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMxQixFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Z0JBRXJCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtvQkFFcEMsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDMUUsRUFB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