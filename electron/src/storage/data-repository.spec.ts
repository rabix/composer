import {assert} from "chai";
import * as fs from "fs-extra";
import * as proxyquire from "proxyquire";
import * as rimraf from "rimraf";
import * as sinon from "sinon";

import * as tmp from "tmp";
import {SynchrounousResult} from "tmp";
import {encrypt} from "../security/encoder";
import {DataRepository} from "./data-repository";
import {UserRepository} from "./types/user-repository";

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

    it("should load token from keychain service upon loading the profile", function (done) {

        prepareTestUser();

        const token = "test-token";
        sinon.stub(keychain, "get").callsFake(() => Promise.resolve(token));
        const repository = new dataRepositoryClass(dir.name);

        repository.load(err => {
            if (err) throw err;

            try {
                assert.equal(repository.local.activeCredentials.token, token);
                done()

            } catch (ex) {
                done(ex);
            }

        });

    });

    it("should delete token from keychain when user gets removed", function (done) {
        const user = prepareTestUser();

        const keychainRemoval = sinon.stub(keychain, "remove").callsFake(() => Promise.resolve(true));
        const repository      = new dataRepositoryClass(dir.name);

        repository.load(err => {

            if (err) throw err;

            repository.updateLocal({
                credentials: []
            }, (err) => {

                if (err) throw err;

                try {
                    assert.equal(keychainRemoval.callCount, 1);
                    const [callArg] = keychainRemoval.firstCall.args;
                    assert.equal(callArg, user.id);
                    done();

                } catch (ex) {
                    done(ex);
                }

            });

        });
    });

    it("handles token change properly", function (done) {
        const user = prepareTestUser();

        const token = "altered-token";

        sinon.stub(keychain, "get").callsFake(() => Promise.resolve(token));

        const tokenSetting = sinon.stub(keychain, "set").callsFake(() => Promise.resolve());

        const repository = new dataRepositoryClass(dir.name);

        repository.load(err => {

            if (err) throw err;

            repository.updateLocal({
                credentials: [Object.assign({}, user, {token})]
            }, (err) => {

                if (err) throw err;

                try {
                    assert.equal(repository.local.activeCredentials.token, token);
                    assert.equal(tokenSetting.callCount, 1);
                    assert.equal(tokenSetting.firstCall.args[0], user.id);
                    assert.equal(tokenSetting.firstCall.args[1], token);
                    done();
                } catch (ex) {
                    done(ex);
                }
            });

        });

    });

    function prepareTestUser() {

        // Set up basic logged in user data, this will be the active user
        const userData = {
            id: "api_testuser",
            token: null,
            url: "https://api.sbgenomics.com",
            user: {username: "testuser",}
        };

        // This is the full path of the local profile file
        const localPath = dir.name + "/local";

        // Write basic user data to that profile file, so we don't start with a blank state
        const profileData = {
            credentials: [userData],
            activeCredentials: userData
        } as Partial<UserRepository>;

        const stringified = JSON.stringify(profileData);
        const encrypted   = encrypt(stringified);

        fs.outputFileSync(localPath, encrypted);

        return userData;
    }
});
