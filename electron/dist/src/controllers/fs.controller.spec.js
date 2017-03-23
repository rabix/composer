"use strict";
const ctrl = require("./fs.controller");
const chai = require("chai");
const tmp = require("tmp");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const assert = chai.assert;
tmp.setGracefulCleanup();
describe("FS Controller", () => {
    function assertStandardEntryInfo(entry, values) {
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
            tmp.file({ postfix: ".json" }, (err, path, fd, cleanup) => {
                if (err)
                    throw err;
                fs.writeFile(fd, `{ "class": "Expression" }`, null, (err) => {
                    if (err)
                        throw err;
                    ctrl.getPotentialCWLClassFromFile(path, (err, cls) => {
                        if (err)
                            throw err;
                        assert.equal(cls, "");
                        cleanup();
                        done();
                    });
                });
            });
        });
        it("should return “CommandLineTool” if file has that class", (done) => {
            tmp.file({ postfix: ".json" }, (err, path, fd, cleanup) => {
                if (err)
                    throw err;
                fs.writeFile(fd, `
                    { 
                        "label": "Ariana Sans", 
                        "nested": { 
                            "class": "Workflow"
                        }, 
                        "class": "CommandLineTool" 
                    }
                `, null, (err) => {
                    if (err)
                        throw err;
                    ctrl.getPotentialCWLClassFromFile(path, (err, cls) => {
                        if (err)
                            throw err;
                        assert.equal(cls, "CommandLineTool");
                        cleanup();
                        done();
                    });
                });
            });
        });
        it("should return “Workflow” if file has that class", (done) => {
            tmp.file({ postfix: ".json" }, (err, path, fd, cleanup) => {
                if (err)
                    throw err;
                fs.writeFile(fd, `
                    { 
                        "label": "Gerard Grande", 
                        "nested": { 
                            "class": "CommandLineTool"
                        }, 
                        "class": "Workflow" 
                    }
                `, null, (err) => {
                    if (err)
                        throw err;
                    ctrl.getPotentialCWLClassFromFile(path, (err, cls) => {
                        if (err)
                            throw err;
                        assert.equal(cls, "Workflow");
                        cleanup();
                        done();
                    });
                });
            });
        });
    });
    describe("Utility: getFileOutputInfo()", () => {
        it("should give exact read/write permission information for 0o700", (done) => {
            tmp.file({ mode: 0o700 }, (err, fpath, fd, cleanup) => {
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
            tmp.file({ mode: 0o766 }, (err, fpath, fd, cleanup) => {
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
            tmp.file({ mode: 0o704 }, (err, fpath, fd, cleanup) => {
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
            tmp.file({ mode: 0o702 }, (err, fpath, fd, cleanup) => {
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
            tmp.file({ postfix: ".json" }, (err, fpath, fd, cleanup) => {
                if (err)
                    throw err;
                fs.writeFile(fd, `{ "class": "CommandLineTool" }`, null, (err) => {
                    if (err)
                        throw err;
                    ctrl.getFileOutputInfo(fpath, (err, info) => {
                        if (err)
                            throw err;
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
                if (err)
                    throw err;
                ctrl.getFileOutputInfo(fpath, (err, info) => {
                    if (err)
                        throw err;
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
                if (err)
                    throw err;
                assert.isArray(listing);
                listing.forEach(assertStandardEntryInfo);
                done();
            });
        });
    });
    describe("Endpoint: createFile", () => {
        it("should return an error if file already exists", (done) => {
            tmp.file((err, path, fd, cleanup) => {
                if (err)
                    throw err;
                ctrl.createFile(path, (err, info) => {
                    assert.isNotNull(err);
                    assert.instanceOf(err, Error);
                    cleanup();
                    done();
                });
            });
        });
        it("should create a file and return it's info", (done) => {
            tmp.tmpName({ postfix: ".json" }, (err, path) => {
                if (err)
                    throw err;
                ctrl.createFile(path, `{ "class": "CommandLineTool" }`, (err, info) => {
                    if (err)
                        throw err;
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
                if (err)
                    throw err;
                ctrl.saveFileContent(path, "", (err, info) => {
                    assert.isNull(err);
                    fs.access(path, fs.constants.F_OK, (err) => {
                        assert.isNull(err);
                        done();
                    });
                });
            });
        });
        it("should overwrite the file with the given content", (done) => {
            tmp.file({ postfix: ".json" }, (err, path, fd, cleanup) => {
                fs.writeFile(fd, "test data", (err) => {
                    if (err)
                        throw err;
                    const newContent = "{ \"class\": \"Workflow\" }";
                    ctrl.saveFileContent(path, newContent, (err, info) => {
                        if (err)
                            throw err;
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
            tmp.file({ postfix: ".json" }, (err, path, fd, cleanup) => {
                fs.writeFile(fd, "test data", (err) => {
                    if (err)
                        throw err;
                    const overwrite = "hello";
                    ctrl.saveFileContent(path, overwrite, (err, info) => {
                        if (err)
                            throw err;
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
                if (err)
                    throw err;
                ctrl.readFileContent(path, (err) => {
                    assert.instanceOf(err, Error);
                    done();
                });
            });
        });
        it("should return the raw content of the file", (done) => {
            tmp.file({ postfix: ".json" }, (err, path, fd, cleanup) => {
                const fileContent = `demo file content that should be matched`;
                fs.writeFile(fd, fileContent, (err) => {
                    if (err)
                        throw err;
                    ctrl.readFileContent(path, (err, raw) => {
                        if (err)
                            throw err;
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
                if (err)
                    throw err;
                tmp.dir((err, childDir, cleanChild) => {
                    if (err)
                        throw err;
                    tmp.file({ template: childDir + "/tmp-XXXXXX" }, (err, path, fd, cleanFile) => {
                        if (err)
                            throw err;
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
    describe("Endpoint: createFolder()", () => {
        it("should create folders recursively if direct parent doesn't exist", (done) => {
            tmp.tmpName({ prefix: "sub1/sub2/sub3/" }, (err, path) => {
                if (err)
                    throw err;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnMuY29udHJvbGxlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2ZzLmNvbnRyb2xsZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsd0NBQXlDO0FBQ3pDLDZCQUE4QjtBQUM5QiwyQkFBNEI7QUFDNUIseUJBQTBCO0FBQzFCLDZCQUE4QjtBQUM5QixpQ0FBa0M7QUFFbEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUUzQixHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUV6QixRQUFRLENBQUMsZUFBZSxFQUFFO0lBRXRCLGlDQUFpQyxLQUFLLEVBQUUsTUFBTTtRQUMxQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO1FBRXRCLE1BQU0sYUFBYSxHQUFHO1lBQ2xCLE1BQU07WUFDTixNQUFNO1lBQ04sTUFBTTtZQUNOLFNBQVM7WUFDVCxVQUFVO1lBQ1YsT0FBTztZQUNQLFFBQVE7WUFDUixZQUFZO1lBQ1osWUFBWTtTQUNmLENBQUM7UUFFRixhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUc7WUFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQztrQkFDTCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2tCQUMzQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxRQUFRLENBQUMseUNBQXlDLEVBQUU7UUFFaEQsRUFBRSxDQUFDLDBEQUEwRCxFQUFFLENBQUMsSUFBSTtZQUNoRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7Z0JBQ3RELE1BQU0sQ0FBQyxN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