import {it, inject, describe, beforeEach, addProviders} from "@angular/core/testing";
import {ToolValidator} from "./tool.validator";
import {FileModel} from "../store/models/fs.models";

describe("ToolValidator", () => {
    beforeEach(() => {
        addProviders([
            ToolValidator
        ]);
    });

    describe("isSupportedFileFormat", () => {

        it("Should return true if the file type is supported",
            inject([ToolValidator], (toolValidator: ToolValidator) => {
                let mockFile = new FileModel({name: "mockFileName"});
                
                mockFile.type = ".js";
                expect(toolValidator.isSupportedFileFormat(mockFile)).toBe(true);

                mockFile.type = ".cwl";
                expect(toolValidator.isSupportedFileFormat(mockFile)).toBe(true);

                mockFile.type = ".yaml";
                expect(toolValidator.isSupportedFileFormat(mockFile)).toBe(true);

                mockFile.type = ".yml";
                expect(toolValidator.isSupportedFileFormat(mockFile)).toBe(true);

                mockFile.type = ".json";
                expect(toolValidator.isSupportedFileFormat(mockFile)).toBe(true);
            }));

        it("Should return false if the file type is not supported",
            inject([ToolValidator], (toolValidator: ToolValidator) => {
                let mockFile = new FileModel({name: "mockFileName"});

                mockFile.type = ".txt";
                expect(toolValidator.isSupportedFileFormat(mockFile)).toBe(false);
            }));
    });
});
