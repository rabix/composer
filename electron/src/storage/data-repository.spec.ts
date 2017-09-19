import * as proxyquire from "proxyquire";
import * as rimraf from "rimraf";

import * as tmp from "tmp";
import {SynchrounousResult} from "tmp";
import {DataRepository} from "./data-repository";

describe("Data repository", function () {

    let dataRepositoryClass: { new(...args: any[]): DataRepository };
    let dir: SynchrounousResult;
    let keychain;

    beforeEach(function () {

        dir = tmp.dirSync();

        keychain = {
            get: () => Promise.resolve(),
            set: () => Promise.resolve(),
            remove: () => Promise.resolve(),
        };

        dataRepositoryClass = proxyquire.noCallThru().load("./data-repository", {
            "../keychain": keychain
        }).DataRepository;

    });

    afterEach(function () {
        rimraf.sync(dir.name);
    });

});
