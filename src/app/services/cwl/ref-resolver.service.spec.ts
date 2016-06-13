import {it, inject, injectAsync, describe, beforeEachProviders, fakeAsync} from "@angular/core/testing";
import {provide, Provider} from "@angular/core"
import {BaseRequestOptions, Response, ResponseOptions, Http} from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {HttpService} from "../http/http.service";
import { Observable }     from 'rxjs/Observable';

import {RefResolverService} from "./ref-resolver.service";
import {UrlValidator} from "../../validators/url.validator";
import {FileApi} from "../../services/api/file.api";
import {Observer} from "rxjs/Observer";
import {FileModel} from "../../store/models/fs.models";
import {FileHelper} from "../../helpers/file.helper";

class MockHttpService {
    public getRequest(url:string) {
        return Observable.of({
            json() {
                return {
                    content: "mock"
                }
            }
        });
    }
}

let mockFileModel: FileModel = new FileModel({
    name: 'mock.yml',
    absolutePath: '/Users/mate/testws/mock.yml',
    content: '{ "content": "mock" }'
});

class MockFileApi {
    public checkIfFileExists() {
        return Observable.of(true);
    }

    public getFileContent() {
        return Observable.of(mockFileModel);
    }
}

describe("RefResolverService", () => {

    beforeEachProviders(() => [
        RefResolverService,
        UrlValidator,
        FileHelper,
        provide(FileApi, {useClass: MockFileApi})
        provide(HttpService, {useClass: MockHttpService})
    ]);

    describe("resolveUrlReference", () => {
        it("should return an FileModel with content from the URL",
            injectAsync([RefResolverService], (refResolverService:RefResolverService) => {

                let expectedResult = new FileModel({
                    name: 'test.json',
                    absolutePath: 'https://stackoverflow.com/data/test.json',
                    content: '{"content":"mock"}'
                });

                refResolverService.resolveUrlReference('test.json', "https://stackoverflow.com/data/test.json")
                    .subscribe((res: FileModel) => {
                        expect(_.isEqual(res, expectedResult)).toBe(true);
                    });
            }));
    });

    describe("resolveRef", () => {

        it("should call resolveUrlReference if the reference is a URL",
            injectAsync([RefResolverService], (refResolverService:RefResolverService) => {
                spyOn(refResolverService, "resolveUrlReference").and.callFake(function() {
                    return Observable.of({});
                });


                refResolverService.resolveRef("./test.json", "https://stackoverflow.com/data/")
                    .subscribe((res: FileModel) => {
                        expect(refResolverService.resolveUrlReference).toHaveBeenCalled();
                    });

                refResolverService.resolveRef("https://stackoverflow.com/data/test.json", "https://google.com/")
                    .subscribe((res: FileModel) => {
                        expect(refResolverService.resolveUrlReference).toHaveBeenCalled();
                    });
            }));


        it("should return a file from the file system if the reference is NOT a URL",
            injectAsync([RefResolverService], (refResolverService:RefResolverService) => {
                
                refResolverService.resolveRef("./test.json", "/Users/mate/testws/")
                    .subscribe((res: FileModel) => {
                        expect(_.isEqual(res, mockFileModel)).toBe(true);
                    });

                refResolverService.resolveRef("/Users/mate/testws/test.json", "/mock")
                    .subscribe((res: FileModel) => {
                        expect(_.isEqual(res, mockFileModel)).toBe(true);
                    });
            }));
    });

});
