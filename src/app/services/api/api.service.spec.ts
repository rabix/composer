import {HTTP_PROVIDERS, XHRBackend, Response, ResponseOptions} from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {it, inject, describe, beforeEachProviders} from "@angular/core/testing";
import {provide} from "@angular/core";
import {ApiService} from "./api.service";
import {APP_CONFIG} from "../../config/app.config";
declare const APP_ENV_CONFIG;

describe("ApiService", () => {
    beforeEachProviders(() => [
        HTTP_PROVIDERS,
        provide(XHRBackend, {useClass: MockBackend}),
        provide(APP_CONFIG, {useValue: APP_ENV_CONFIG}),
        ApiService
    ]);


    it("Should test the HTTP call", inject([XHRBackend, ApiService],

        (mockBackend: MockBackend, service: ApiService)=> {

            mockBackend.connections.subscribe((connection: MockConnection) => {

                connection.mockRespond(new Response(new ResponseOptions({
                    body: {
                        paths: [

                        ]
                    }
                })));
            });

            service.getDirectoryContent("mind over matter").subscribe((next) => {
                console.log("Got", next);
            });
        }));

    describe("Directory Listing", () => {

        it("Should have a \"getDirectoryListing()\" method", inject([ApiService], (service: ApiService)=> {
            expect(typeof service.getDirectoryContent).toEqual("function");
        }));
    });
});
