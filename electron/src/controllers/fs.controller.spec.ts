import ctrl = require("./fs.controller");
import chai = require("chai");
import tmp = require("tmp");
import fs = require("fs-extra");
import path = require("path");
import rimraf = require("rimraf");

const assert = chai.assert;

tmp.setGracefulCleanup();

describe("FS Controller", () => {

    function assertStandardEntryInfo(entry, values = {}) {
        assert.isObject(entry);
        values = values || {};

        const mandatoryKeys = [
            "type",
            "path",
            "name",
            "dirname",
            "language",
            "isDir",
            "isFile",
            "isReadable",
            "isWritable"
        ];

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

                fs.writeFile(fd as any, `{ "class": "Expression" }`, null, (err) => {
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

                fs.writeFile(fd as any, `
                    { 
                        "label": "Ariana Sans", 
                        "nested": { 
                            "class": "Workflow"
                        }, 
                        "class": "CommandLineTool" 
                    }
                `, null, (err) => {

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
                fs.writeFile(fd as any, `
                    { 
                        "label": "Gerard Grande", 
                        "nested": { 
                            "class": "CommandLineTool"
                        }, 
                        "class": "Workflow" 
                    }
                `, null, (err) => {

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

        it("should give exact read/write permission information for 0o700", (done) => {
            tmp.file({mode: 0o700}, (err, fpath, fd, cleanup) => {

                ctrl.getFileOutputInfo(fpath, (err, info) => {

                    assert.isNull(err);
                    assertStandardEntryInfo(info, {
                        isReadable: false,
                        isWritable: false
                    });

                    cleanup();
                    done();
                });
            });
        });

        it("should give exact read/write permission information for 0o766", (done) => {
            tmp.file({mode: 0o766}, (err, fpath, fd, cleanup) => {

                ctrl.getFileOutputInfo(fpath, (err, info) => {

                    assert.isNull(err);
                    assertStandardEntryInfo(info, {
                        isReadable: true,
                        isWritable: true
                    });

                    cleanup();
                    done();
                });
            });
        });

        it("should give exact read/write permission information for 0o704", (done) => {
            tmp.file({mode: 0o704}, (err, fpath, fd, cleanup) => {

                ctrl.getFileOutputInfo(fpath, (err, info) => {

                    assert.isNull(err);
                    assertStandardEntryInfo(info, {
                        isReadable: true,
                        isWritable: false
                    });

                    cleanup();
                    done();
                });
            });
        });

        it("should give exact read/write permission information for 0o702", (done) => {
            tmp.file({mode: 0o702}, (err, fpath, fd, cleanup) => {

                ctrl.getFileOutputInfo(fpath, (err, info) => {

                    assert.isNull(err);
                    assertStandardEntryInfo(info, {
                        isReadable: false,
                        isWritable: true
                    });

                    cleanup();
                    done();
                });
            });
        });

        it("should give information about a file", (done) => {

            tmp.file({postfix: ".json"}, (err, fpath, fd, cleanup) => {
                if (err) throw err;


                fs.writeFile(fd as any, `{ "class": "CommandLineTool" }`, null, (err) => {
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

                ctrl.createFile(path, "", (err) => {
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
        it("should create file if it doesn't exist", (done) => {

            tmp.tmpName((err, path) => {
                if (err) throw err;

                ctrl.saveFileContent(path, "", (err) => {
                    assert.isNull(err);

                    fs.access(path, fs.constants.F_OK, (err) => {

                        assert.isNull(err);
                        done();
                    });
                });
            });

        });

        it("should overwrite the file with the given content", (done) => {
            tmp.file({postfix: ".json"}, (err, path, fd, cleanup) => {

                fs.writeFile(fd as any, "test data", (err) => {
                    if (err) throw err;

                    const newContent = "{ \"class\": \"Workflow\" }";

                    ctrl.saveFileContent(path, newContent, (err, info) => {
                        if (err) throw err;

                        assertStandardEntryInfo(info, {
                            type: "Workflow"
                        });

                        fs.readFile(path, "utf8", (err, content) => {
                            assert.isNull(err);
                            assert.equal(content, newContent);

                            cleanup();
                            done();

                        });

                    });

                });
            });
        });

        /**
         * Made to exactly replicate a bug
         */
        it("should replace file content when new content is shorter than the old one", (done) => {
            tmp.file({postfix: ".json"}, (err, path, fd, cleanup) => {

                fs.writeFile(fd as any, "test data", (err) => {
                    if (err) throw err;

                    const overwrite = "hello";

                    ctrl.saveFileContent(path, overwrite, (err) => {
                        if (err) throw err;

                        fs.readFile(path, "utf8", (err, content) => {
                            assert.isNull(err);
                            assert.equal(content, overwrite);

                            cleanup();
                            done();
                        });
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

                fs.writeFile(fd as any, fileContent, (err) => {
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

                    fs.access(path, fs.constants.F_OK, (err) => {
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

                    tmp.file({template: childDir + path.sep + "tmp-XXXXXX"}, (err, path, fd, cleanFile) => {
                        if (err) throw err;


                        ctrl.deletePath(parentDir, (err) => {
                            assert.isNull(err);

                            fs.access(parentDir, fs.constants.F_OK, (err) => {
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

    describe("Endpoint: createFolder()", () => {

        it("should create folders recursively if direct parent doesn't exist", (done) => {
            tmp.tmpName({prefix: "sub1/sub2/sub3/"}, (err, path) => {
                if (err) throw err;

                ctrl.createDirectory(path, (err, info) => {
                    assert.isNull(err);
                    assertStandardEntryInfo(info);
                    done();
                });
            });
        });

        it("should return an error if folder exists", (done) => {

            tmp.dir((err, path, cleanup) => {

                ctrl.createDirectory(path, (err) => {

                    assert.instanceOf(err, Error);

                    cleanup();
                    done();
                });
            });
        });

        it("should create an empty folder", (done) => {

            tmp.tmpName((err, path) => {

                ctrl.createDirectory(path, (err, info) => {

                    assert.isNull(err);
                    assertStandardEntryInfo(info);

                    rimraf(path, () => {
                        done();
                    });
                });
            });
        });
    });

    describe("Endpoint: checkIfPathExists", () => {

        it("should return true if the given path is present", (done) => {

            tmp.dir((err, path, cleanup) => {

                ctrl.pathExists(path, (err, info) => {

                    assert.isNull(err);
                    assert.isObject(info);
                    assert.propertyVal(info, "exists", true);

                    cleanup();
                    done();
                });
            });
        });

        it("should return false if the given path is available", (done) => {

            tmp.tmpName((err, path) => {

                ctrl.pathExists(path, (err, info) => {

                    assert.isNull(err);
                    assert.isObject(info);
                    assert.propertyVal(info, "exists", false);

                    done();
                });
            });
        });
    });

});
