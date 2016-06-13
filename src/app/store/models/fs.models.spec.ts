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

            let dir = new DirectoryModel(confObject);

            expect(dir.name).toEqual(confObject.name);
            expect(dir.isEmpty).toEqual(confObject.isEmpty);
            expect(dir.absolutePath).toEqual(confObject.absolutePath);
            expect(dir.relativePath).toEqual(confObject.relativePath);
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

           let dir = new FileModel(confObject);

           expect(dir.name).toEqual(confObject.name);
           expect(dir.absolutePath).toEqual(confObject.absolutePath);
           expect(dir.relativePath).toEqual(confObject.relativePath);
           expect(dir.type).toEqual(confObject.type);
       });
    });
});
