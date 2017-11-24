import * as assert from "assert";
import * as fs from "fs-extra";
import * as spectron from "spectron";
import {generateAuthCredentials, generatePlatformProject} from "../../util/generator";
import {mockSBGClient} from "../../util/sbg-client-proxy";
import {boot, getTestDir, proxerialize, shutdown} from "../../util/util";

describe("app publishing", () => {
    let app: spectron.Application;

    afterEach(() => shutdown(app));

    it("opens newly published app in a new tab", async function () {

        const user    = generateAuthCredentials("test-user", "https://api.sbgenomics.com");
        const project = generatePlatformProject({id: "test-user/test-project"});

        const demoAppContent = fs.readFileSync(__dirname + "/stub/demo-app.json", "utf-8");

        const demoAppTestPath = getTestDir(this, "demo-app.json");

        app = await boot(this, {
            localRepository: {
                credentials: [user],
                activeCredentials: user,
                openTabs: [{
                    id: demoAppTestPath,
                    type: "CommandLineTool",
                    label: "My Demo App"
                }]
            },
            platformRepositories: {
                [user.id]: {
                    projects: [project],
                    openProjects: [project.id]
                }
            },
            prepareTestData: [{
                name: "demo-app.json",
                content: demoAppContent
            }],
            overrideModules: [
                {
                    module: "./sbg-api-client/sbg-client",
                    override: {
                        SBGClient: mockSBGClient({
                            createApp: () => Promise.resolve("{}"),
                            getApp: proxerialize((appContent, $callCount) => {

                                return (appID: string) => {

                                    if (appID.startsWith("test-user/test-project/test-app-publish") && $callCount > 1) {
                                        return Promise.resolve({raw: JSON.parse(appContent)});
                                    }

                                    return Promise.resolve(appContent);
                                };
                            }, demoAppContent)
                        }),
                    }

                }
            ]
        });

        const client = app.client;

        const modal          = `ct-publish-modal`;
        const submitBtn      = `${modal} button[type=submit]`;
        const nameControl    = `${modal} [formControlName=name]`;
        const projectControl = `${modal} [formControlName=project]`;
        const projectOption  = `${projectControl} .option[data-value='test-user/test-project']`;

        const publishBtn = `[data-test=publish-button]`;

        await client.waitForEnabled(publishBtn, 10000);
        await client.click(publishBtn);
        await client.waitForVisible(modal);

        await client.setValue(nameControl, "Test App Publish");

        await client.click(`${projectControl} .selectize-input`);
        await client.waitForVisible(projectOption, 5000);
        await client.click(projectOption);


        await client.waitForEnabled(submitBtn, 3000);
        await client.click(submitBtn);

        const newTabSelector = `ct-workbox .tab-bar .tab:nth-child(2)`;
        await client.waitForVisible(newTabSelector, 10000);
        const tabTitle = await client.getText(`${newTabSelector} .title`);

        assert.equal(tabTitle, "Test App Publish");
    });
});

