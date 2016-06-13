/*
import {it, inject, describe, beforeEachProviders, injectAsync} from "@angular/core/testing";
import {CwlService} from "./cwl.service";
import {CwlFile} from "../../models/cwl.file.model.ts";
import {RefResolverService} from "./ref-resolver.service";
import {provide, Provider} from "@angular/core"
import {FileModel} from "../../store/models/fs.models";

class MockRefResolverService {
    public resolveRef(value, path) { }
}

describe("CwlFileModel", () => {
    var mockRefResolverService = new MockRefResolverService();

    beforeEachProviders(() => [CwlService, RefResolverService]);

    beforeEachProviders(() => [
        CwlService,
        provide(RefResolverService, {useValue: mockRefResolverService})
    ]);

    describe("parseCwlFile", () => {

        it("should parse the JSON string and get the content references",
            injectAsync([CwlService], (cwlService:CwlService) => {
                let testFileContent = {
                    "form": {
                        "bar": {
                            "$import": "import.yml",
                            "fooo": {
                                "bla": {
                                    "$include": "./include.yml"
                                }
                            }
                        },
                        "$include": "./include2.yml",
                        "c": {
                            "$import": "./import2.yml"
                        },
                        "d": {
                            "$import": "./import2.yml"
                        }
                    }
                };

                let testFile = FileModel.createFromObject({
                    name: 'file1',
                    absolutePath: './Users/mate/testws/file1.json',
                    content: JSON.stringify(testFileContent)
                });

               /!* let result:CwlFile = cwlService.parseCwlFile(testFile);

                expect(result.content).toEqual(testFileContent);
                expect(result.contentReferences).toEqual(['$include2.ymmml', 'import2.yml', 'import.yml', '$include.yml']);*!/

               /!* spyOn(RefResolverService, "resolveRef").and.callFake(function() {
                    let mockFile = FileModel.createFromObject({
                        name: 'included.yml',
                        absolutePath: '/Users/mate/testws/included.yml',
                        content: 'mock content'
                    });

                    return mockFile;
                });*!/

                cwlService.parseCwlFile(testFile).toPromise().then((result) => {
                    expect(true).toBe(false);
                });
            }));
    });
});
*/
