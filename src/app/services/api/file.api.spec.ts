import {beforeEachProviders, it, describe, inject} from "@angular/core/testing";
import {DirectoryModel, FileModel} from "../../store/models/fs.models";
import {FileApi} from "./file.api";
import {FilePath} from "./api-response-types";
import {Observable} from "rxjs/Rx";
import {provide} from "@angular/core";
import {SocketService} from "./socket.service";

describe("FileAPI", () => {

    beforeEachProviders(() => [FileApi]);

    describe("getDirContent", () => {

        beforeEachProviders(() => [
            provide(SocketService, {
                useValue: {
                    request: (path) => {
                        let paths: FilePath[] = [
                            {
                                name: "myFirstDir",
                                type: "directory",
                                relativePath: "subdir/myDir",
                                absolutePath: `/root/subdir/myFirstDir`
                            },
                            {
                                name: "mySecondDir",
                                type: "directory",
                                relativePath: "subdir/myDir",
                                absolutePath: "/root/subdir/mySecondDir"
                            },
                            {
                                name: "myTsFile",
                                type: ".ts",
                                relativePath: "subdir/myTsFile.ts",
                                absolutePath: "/root/subdir/myTsFile.ts"
                            },
                        ];
                        return Observable.of({
                            message: "",
                            content: paths
                        });
                    }
                }
            }),
        ]);

        it("should properly map files and directories to their respective models",
            inject([FileApi], (file: FileApi) => {
                file.getDirContent("./").subscribe((dirContent) => {
                    expect(Array.isArray(dirContent)).toEqual(true);
                    expect(dirContent.length).toEqual(3);
                    expect(dirContent[0] instanceof DirectoryModel).toEqual(true);
                    expect(dirContent[1] instanceof FileModel).toEqual(false);
                    expect(dirContent[2] instanceof FileModel).toEqual(true);
                });
            }));
    });
});
