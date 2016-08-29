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
                
                let jsMockFile = new FileModel({
                    name: "mockFileName",
                    type: ".js"
                });
                expect(toolValidator.isSupportedFileFormat(jsMockFile)).toBe(true);

                
                let cwlMockFile = new FileModel({
                    name: "mockFileName",
                    type: ".cwl"
                });
                expect(toolValidator.isSupportedFileFormat(cwlMockFile)).toBe(true);


                let yamlMockFile = new FileModel({
                    name: "mockFileName",
                    type: ".yaml"
                });
                expect(toolValidator.isSupportedFileFormat(yamlMockFile)).toBe(true);

                
                let ymlMockFile = new FileModel({
                    name: "mockFileName",
                    type: ".yml"
                });
                expect(toolValidator.isSupportedFileFormat(ymlMockFile)).toBe(true);

                
                let jsonMockFile = new FileModel({
                    name: "mockFileName",
                    type: ".json"
                });
                expect(toolValidator.isSupportedFileFormat(jsonMockFile)).toBe(true);
            }));

        it("Should return false if the file type is not supported",
            inject([ToolValidator], (toolValidator: ToolValidator) => {
                let txtMockFile = new FileModel({
                    name: "mockFileName",
                    type: ".txt"
                });
              
                expect(toolValidator.isSupportedFileFormat(txtMockFile)).toBe(false);
            }));
    });
});
