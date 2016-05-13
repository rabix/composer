import {it, describe, beforeEachProviders, async, inject} from "@angular/core/testing";
import {provide} from "@angular/core";
import {SocketService} from "./socket.service";
import {FileApi} from "./file.api";
import * as Q from "q";
import {ApiService} from "./api.service";
import {CONFIG, APP_CONFIG} from "../../config/app.config";

describe("SocketService", () => {


    beforeEachProviders(() => [
        provide(APP_CONFIG, {useValue: CONFIG}),
        SocketService,
        FileApi
    ]);

    // it("Should ...", injectAsync([SocketService], (service: SocketService, second: any) => {
    //
    //     let p = new Promise((resolve, reject) => {
    //         let sub1 = service.socketStream.subscribe((next) => {
    //             console.log("Ola");
    //         });
    //
    //         setTimeout(function () {
    //             sub1.unsubscribe();
    //         }, 500);
    //     });
    // }));

    // it("Should return a directory listing", injectAsync([FileApi], (service: FileApi) => {
    //
    //     let def = Q.defer();
    //
    //
    //     let toolbox = service.getDirContent();
    //     console.log("Yeah!", toolbox);
    //     setTimeout(function () {
    //         console.log("Resolving");
    //         def.resolve(function(){
    //             console.log("wath", arguments);
    //         });
    //     }, 50);
    //
    //     return def.promise;
    // }));
    //
    // it("Should wait, then resolve", async(inject([FileApi], (service: FileApi) => {
    //     return service.getDirContent("").then(function (content) {
    //         console.log("Got content", content);
    //         expect(true).toBe(true);
    //         return content;
    //     });
    // })));

    // it('...', async(inject([FileApi], (service: FileApi) => {
    //     service.waitAWhile().then(function(){
    //         console.log("Assert something");
    //     });
    // })));

    it('...', async(inject([FileApi], (files: FileApi) => {

        // @FIXME don't test against real socket connection, mock SocketService
        files.getDirContent().subscribe((data) => {
            console.log("Got Data", data);
        });

    })));
});
