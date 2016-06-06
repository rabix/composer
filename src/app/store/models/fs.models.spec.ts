import {describe, it, expect} from "@angular/core/testing";
import {DirectoryModel, FileModel} from "./fs.models";
import {FilePath} from "../../services/api/api-response-types";

describe("FS Models", () => {

    describe("DirectoryModel", () => {

        it("should be possible to create it from a FilePath object", () => {
            let confObject: FilePath = {
                name: "foo",
                isEmpty: true,
                type: "directory",
                relativePath: "user/foo",
                absolutePath: "/root/user/foo",
            };

            let dir = DirectoryModel.createFromObject(confObject);

            expect(dir.getName()).toEqual(confObject.name);
            expect(dir.hasContent()).toEqual(confObject.isEmpty);
            expect(dir.getAbsolutePath()).toEqual(confObject.absolutePath);
            expect(dir.getRelativePath()).toEqual(confObject.relativePath);
        });
    });

    describe("FileModel", () => {
       it("should be possible to create it from a FilePath object", () => {
           let confObject: FilePath = {
               name: "foo",
               isEmpty: true,
               type: ".ts",
               relativePath: "user/foo",
               absolutePath: "/root/user/foo",
           };

           let dir = FileModel.createFromObject(confObject);

           expect(dir.getName()).toEqual(confObject.name);
           expect(dir.getAbsolutePath()).toEqual(confObject.absolutePath);
           expect(dir.getRelativePath()).toEqual(confObject.relativePath);
           expect(dir.getType()).toEqual(confObject.type);
       });
    });
});
