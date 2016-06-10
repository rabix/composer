/*
import {it, inject, describe, beforeEachProviders} from "@angular/core/testing";
import {CwlService} from "./cwl.service";
import {CwlFile} from "../../models/cwl.file.models";
import {RefResolverService} from "./ref-resolver.service";

describe("CwlFileModel", () => {
    beforeEachProviders(() => [CwlService, RefResolverService]);

    describe("parseCwlFile", () => {

        it("should parse the JSON string and get the content references",
            inject([CwlService], (cwlService:CwlService) => {
                let testFileContent = {
                    "form": {
                        "bar": {
                            "$import": "import.yml",
                            "fooo": {
                                "bla": {
                                    "$include": "$include.yml"
                                }
                            }
                        },
                        "$include": "$include2.yml",
                        "c": {
                            "$import": "import2.yml"
                        },
                        "d": {
                            "$import": "import2.yml"
                        }
                    }
                };

                let result:CwlFile = cwlService.parseCwlFile(JSON.stringify(testFileContent));

                expect(result.content).toEqual(testFileContent);
                expect(result.contentReferences).toEqual(['$include2.yml', 'import2.yml', 'import.yml', '$include.yml']);
            }));

    });
});
*/
