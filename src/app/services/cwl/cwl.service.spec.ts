import {it, describe, beforeEachProviders, injectAsync} from "@angular/core/testing";
import {CwlService} from "./cwl.service";
import {CwlFile} from "../../models/cwl.file.model.ts";
import {RefResolverService} from "./ref-resolver.service";
import {provide} from "@angular/core"
import {FileModel} from "../../store/models/fs.models";
import {Observable} from "rxjs/Observable";
import * as _ from "lodash";

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

let refFile: FileModel = new FileModel({
    name: 'included.yml',
    absolutePath: '/Users/mate/testws/included.yml',
    content: '{ "content": "mock" }'
});

class MockRefResolverService {
    public resolveRef() {
        return Observable.of(refFile);
    }
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

                let testFile = new FileModel({
                    name: "file1",
                    absolutePath: "/Users/mate/testws/",
                    content: JSON.stringify(testFileContent)
                });

                let expectedRef = new CwlFile({
                    id: 'included.yml',
                    content: {content: 'mock'},
                    path: '/Users/mate/testws/included.yml',
                    contentReferences: []
                });
                
                cwlService.parseCwlFile(testFile).subscribe((res: CwlFile) => {
                    expect(res.contentReferences.length).toBe(4);
                    expect(_.isEqual(res.contentReferences[0], expectedRef)).toBe(true);
                }, (err) => console.log(err));
            }));
    });
});
