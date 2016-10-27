const ctrl = require("./fs.controller");
const chai = require("chai");
const tmp = require("tmp");
const assert = chai.assert;
const fs = require("fs");
const path = require("path");

tmp.setGracefulCleanup();

describe("FS Controller", () => {

    function assertStandardEntryInfo(entry, values) {
        assert.isObject(entry);
        values = values || {};

        const mandatoryKeys = ["type", "path", "name", "dirname", "language", "isDir", "isFile"];

        mandatoryKeys.forEach(key => {
            values[key]
                ? assert.propertyVal(entry, key, values[key])
                : assert.property(entry, key);
        });
    }

    describe("Utility: getPotentialCWLClassFromFile()", () => {

        it("should return an empty string if the file does not exist", (done) => {
            ctrl.getPotentialCWLClassFromFile("hello world", (err, cls) => {
                assert.isNull(err);
                assert.equal(cls, "");
                done();
            });
        });

        it("should return an empty string if file has no known CWL classes", (done) => {
            tmp.file({postfix: ".json"}, (err, path, fd, cleanup) => {
                if (err) throw err;

                fs.writeFile(fd, `{ "class": "Expression" }`, null, (err) => {
                    if (err) throw err;

                    ctrl.getPotentialCWLClassFromFile(path, (err, cls) => {
                        if (err) throw err;

                        assert.equal(cls, "");
                        cleanup();
                        done();
                    })
                });
            });
        });

        it("should return “CommandLineTool” if file has that class", (done) => {
            tmp.file({postfix: ".json"}, (err, path, fd, cleanup) => {
                if (err) throw err;

                fs.writeFile(fd, `{ "label": "Ariana Sans", "class": "CommandLineTool" }`, null, (err) => {
                    if (err) throw err;

                    ctrl.getPotentialCWLClassFromFile(path, (err, cls) => {
                        if (err) throw err;

                        assert.equal(cls, "CommandLineTool");
                        cleanup();
                        done();
                    })
                });
            });
        });

        it("should return “Workflow” if file has that class", (done) => {
            tmp.file({postfix: ".json"}, (err, path, fd, cleanup) => {
                if (err) throw err;
                fs.writeFile(fd, `{ "class": "Workflow" }`, null, (err) => {

                    if (err) throw err;

                    ctrl.getPotentialCWLClassFromFile(path, (err, cls) => {
                        if (err) throw err;

                        assert.equal(cls, "Workflow");
                        cleanup();
                        done();
                    })
                });
            });
        });
    });

    describe("Utility: getFileOutputInfo()", () => {
        it("should give information about a file", (done) => {

            tmp.file({postfix: ".json"}, (err, fpath, fd, cleanup) => {
                if (err) throw err;


                fs.writeFile(fd, `{ "class": "CommandLineTool" }`, null, (err) => {
                    if (err) throw err;

                    ctrl.getFileOutputInfo(fpath, (err, info) => {
                        if (err) throw err;

                        assertStandardEntryInfo(info, {
                            type: "CommandLineTool",
                            path: fpath,
                            name: path.basename(fpath),
                            dirname: path.dirname(fpath),
                            language: "json",
                            isDir: false,
                            isFile: true
                        });

                        cleanup();
                        done();
                    });

                });
            });
        });

        it("should give information about a folder", (done) => {

            tmp.dir((err, fpath, cleanup) => {
                if (err) throw err;

                ctrl.getFileOutputInfo(fpath, (err, info) => {
                    if (err) throw err;

                    assertStandardEntryInfo(info, {
                        type: "",
                        path: fpath,
                        name: path.basename(fpath),
                        dirname: path.resolve(fpath, ".."),
                        language: "",
                        isDir: true,
                        isFile: false
                    });

                    cleanup();
                    done();
                });

            });
        });
    });

    describe("Endpoint: readDirectory() ", () => {
        it("should give the proper listing of directories", (done) => {
            const home = process.env["HOME"];

            ctrl.readDirectory(home, (err, listing) => {
                if (err) throw err;

                assert.isArray(listing);
                listing.forEach(assertStandardEntryInfo);

                done();
            });

        });
    });

    describe("Endpoint: createFile", () => {
        it("should return an error if file already exists", (done) => {
            tmp.file((err, path, fd, cleanup) => {
                if (err) throw err;

                ctrl.createFile(path, (err, info) => {
                    assert.isNotNull(err);
                    assert.instanceOf(err, Error);

                    cleanup();
                    done();
                });
            })
        });

        it("should create a file and return it's info", (done) => {
            tmp.tmpName({postfix: ".json"}, (err, path) => {
                if (err) throw err;

                ctrl.createFile(path, `{ "class": "CommandLineTool" }`, (err, info) => {
                    if (err) throw err;

                    assertStandardEntryInfo(info, {
                        type: "CommandLineTool"
                    });

                    done();
                });
            });
        });
    });

    describe("Endpoint: saveFileContent", () => {
        it("should return an error if file doesn't exist", (done) => {

            tmp.tmpName((err, path) => {
                if (err) throw err;

                ctrl.saveFileContent(path, "", (err, info) => {
                    assert.instanceOf(err, Error);
                    done();
                });
            });

        });

        it("should overwrite the file with the given content", (done) => {
            tmp.file({postfix: ".json"}, (err, path, fd, cleanup) => {
                fs.writeFile(fd, "test data", (err) => {
                    if (err) throw err;

                    ctrl.saveFileContent(path, `{ "class": "Workflow" } `, (err, info) => {
                        if (err) throw err;

                        assertStandardEntryInfo(info, {
                            type: "Workflow"
                        });

                        cleanup();
                        done();
                    });

                });
            });
        });
    });

    describe("Endpoint: readFileContent", () => {
        it("should return an error if the file doesn't exist", (done) => {
            tmp.tmpName((err, path) => {
                if (err) throw err;

                ctrl.readFileContent(path, (err) => {
                    assert.instanceOf(err, Error);
                    done();
                });
            });
        });

        it("should return the raw content of the file", (done) => {

            tmp.file({postfix: ".json"}, (err, path, fd, cleanup) => {

                const fileContent = `demo file content that should be matched`;

                fs.writeFile(fd, fileContent, (err) => {
                    if (err) throw err;

                    ctrl.readFileContent(path, (err, raw) => {
                        if (err) throw err;

                        assert.equal(raw, fileContent);

                        cleanup();
                        done();
                    });
                });

            });
        });
    });

    describe("Endpoint: deletePath()", () => {
        it("should return success if the path does not exist", (done) => {
            tmp.tmpName((err, path) => {
                ctrl.deletePath(path, (err) => {
                    assert.isNull(err);
                    done();
                });
            });

        });

        it("should delete a file", (done) => {
            tmp.file((err, path, fd, cleanup) => {
                ctrl.deletePath(path, (err) => {

                    assert.isNull(err);

                    fs.access(path, fs.F_OK, (err) => {
                        assert.instanceOf(err, Error);

                        if (!err) {
                            cleanup();
                        }
                        done();
                    });

                });
            });
        });

        it("should recursively delete a folder", (done) => {
            tmp.dir((err, parentDir, cleanParent) => {
                if (err) throw err;

                tmp.dir((err, childDir, cleanChild) => {
                    if (err) throw err;

                    tmp.file({template: childDir + "/tmp-XXXXXX"}, (err, path, fd, cleanFile) => {
                        if (err) throw err;


                        ctrl.deletePath(parentDir, (err) => {
                            assert.isNull(err);

                            fs.access(parentDir, fs.F_OK, (err) => {
                                assert.instanceOf(err, Error);

                                if (!err) {
                                    cleanFile();
                                    cleanChild();
                                    cleanParent();
                                }
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});