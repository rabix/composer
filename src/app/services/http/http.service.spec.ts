import {it, inject, describe, beforeEachProviders} from "@angular/core/testing";
import {provide} from "@angular/core"
import {BaseRequestOptions, Response, ResponseOptions, Http} from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";

import {HttpService} from "./http.service";

describe("HttpService", () => {
    beforeEachProviders(() => [
        HttpService,
        BaseRequestOptions,
        MockBackend,
        provide(Http, {
            useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
                return new Http(backend, defaultOptions);
            },
            deps: [MockBackend, BaseRequestOptions]
        })
    ]);

    beforeEach(inject([MockBackend], (backend: MockBackend) => {
        const baseResponse = new Response(new ResponseOptions({body: {"content": "got response"}}));
        backend.connections.subscribe((c: MockConnection) => c.mockRespond(baseResponse));
    }));

    describe("getRequest", () => {

        it("Check valid Urls",
            inject([HttpService], (httpService:HttpService) => {
                httpService.getRequest("https://stackoverflow.com/data/test.json").subscribe((res:Response) => {
                    let body = res.json();
                    expect(body.content).toBe('got response');
                });
            }));
    });
});
