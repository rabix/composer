import * as fs from "fs-extra";
import * as rimraf from "rimraf";

import * as tmp from "tmp";
import {SynchrounousResult} from "tmp";
import {DataRepository} from "./data-repository";
import {UserRepository} from "./types/user-repository";

const assert = require("chai").assert;

describe("Data repository", function () {

    let dir: SynchrounousResult;


    beforeEach(function () {

        dir = tmp.dirSync();

    });

    afterEach(function () {
        rimraf.sync(dir.name);
    });

    it("stores a token alongside user data", function (done) {

        const user = {
            id: "api_testuser",
            token: "tokentoken",
            url: "https://api.sbgenomics.com",
            user: {username: "testuser"}
        };

        const repository = new DataRepository(dir.name);

        repository.load(() => {

            const update = {
                credentials: [user],
                activeCredentials: user
            };

            repository.updateLocal(update, (err) => {
                if (err) {
                    return done(err);
                }

                const profileFilePath = repository.getProfileFilePath("local");
                const profile         = fs.readJSONSync(profileFilePath);

                assert.deepEqual(profile.credentials, update.credentials);
                assert.deepEqual(profile.activeCredentials, update.activeCredentials)

                done();
            });
        });

    });

    it("updates tokens", function (done) {

        const user = {
            id: "api_testuser",
            token: "original-token",
            url: "https://api.sbgenomics.com",
            user: {username: "testuser"}
        };

        const initialData = {
            credentials: [user],
            activeCredentials: user
        };

        const repository       = new DataRepository(dir.name);
        const localProfilePath = repository.getProfileFilePath("local");
        fs.writeJSONSync(localProfilePath, initialData);

        repository.load(() => {

            const patch = {
                credentials: [
                    {...user, token: "updated-token"}
                ]
            };

            repository.updateLocal(patch, (err) => {
                if (err) {
                    return done(err);
                }

                setTimeout(() => {
                    const profile = fs.readJSONSync(localProfilePath);

                    assert.deepEqual(profile.credentials, patch.credentials);

                    done();
                }, 100);

            });
        });
    });


    function prepareTestUser() {

        // Set up basic logged in user data, this will be the active user
        const userData = {
            id: "api_testuser",
            token: "tokentoken",
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

        fs.outputFileSync(localPath, JSON.stringify(profileData));

        return userData;
    }
});
