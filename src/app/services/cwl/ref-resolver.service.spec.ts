import {it, inject, injectAsync, describe, beforeEachProviders, fakeAsync} from "@angular/core/testing";
import {provide, Provider} from "@angular/core"
import {BaseRequestOptions, Response, ResponseOptions, Http} from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {HttpService} from "../http/http.service";
import { Observable }     from 'rxjs/Observable';

import {RefResolverService} from "./ref-resolver.service";
import {UrlValidator} from "../../validators/url.validator";
import {FileApi} from "../../services/api/file.api";
import {TestScheduler} from "rxjs/Rx.KitchenSink";

//class HttpService { }

describe("RefResolverService", () => {

    // Aliases
    /*var TestScheduler = TestScheduler,
        onNext = ReactiveTest.onNext,
        onError = Rx.ReactiveTest.onError,
        onCompleted = Rx.ReactiveTest.onCompleted,
        subscribe = Rx.ReactiveTest.subscribe;*/

    class MockHttpService {
        public getRequest(url:string) {
           /* return {
                "content": {
                    "got response"
                }
            }*/
            /*return Observable.create((observer) => {
                observer.next({
                    "content": {
                        "got response"
                    }
                });
            });*/
        }
    }

    class MockFileApi { }

     beforeEachProviders(() => [
         RefResolverService,
         UrlValidator,
         provide(FileApi, {useClass: MockFileApi})
         provide(HttpService, {useClass: MockHttpService})
        // new Provider(HttpService, { useClass: MockHttpService })
     ]);

    describe("resolveRef", () => {
        it("Return an observable emitting the resolved content",
            injectAsync([RefResolverService], (refResolverService:RefResolverService) => {
          /*  inject([RefResolverService, HttpService, FileApi],
                fakeAsync((httpService: HttpService, fileApi: FileApi) => {*/

                console.log('HERE!!!!!');

               // spyOn(MockHttpService, 'getRequest');

               /* spyOn(MockHttpService, "getRequest").and.returnValue({
                    "content": {
                        "got response"
                    }
                });*/

                expect(true).toBe(false);

                refResolverService.resolveRef("https://stackoverflow.com/data/test.json").toPromise().then((res) => {
                    let body = res.json();
                    expect(body).toBe({"content":  { "got response2 "}});

                   // done();
                }).catch((e) => console.log(e));

               /*  refResolverService.resolveRef("https://stackoverflow.com/data/test.json").subscribe((res:Response) => {
                         let body = res.json();

                         console.log(res.json());
                         expect(body).toBe({"content":  { "got response2 "}});
                     }, (err) => {
                         console.error('something wrong occurred: ' + err)
                     });
*/                //expect(true).toBe(false);
            }));
    });
});
