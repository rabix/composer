import {it, describe, expect} from "@angular/core/testing";
import {FileHelper} from "./file.helper";

describe("FileHelper", () => {

    describe("relativeToAbsolutePath()", () => {

        it("should convert a relative path to an absolute", () => {
            let result = FileHelper.relativeToAbsolutePath("./asd.json", "/Users/mate/testws/");
            expect(result).toEqual("/Users/mate/testws/asd.json");

            let result = FileHelper.relativeToAbsolutePath("asd.json", "/Users/mate/testws/");
            expect(result).toEqual("/Users/mate/testws/asd.json");

            let result = FileHelper.relativeToAbsolutePath("../../asd.json", "/Users/mate/testws/");
            expect(result).toEqual("/Users/asd.json");
        });

    });

    describe("isRelativePath()", () => {
        it("return true if a path begins with './' or '../'", () => {

            expect(FileHelper.isRelativePath("./test.json")).toBe(true);
            expect(FileHelper.isRelativePath("../../test.json")).toBe(true);

            expect(FileHelper.isRelativePath("test.json")).toBe(false);
        });
    });
});
