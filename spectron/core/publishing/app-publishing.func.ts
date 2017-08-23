import * as assert from "assert";
import * as fs from "fs-extra";
import * as spectron from "spectron";
import {generateAuthCredentials, generatePlatformProject} from "../../util/generator";
import {mockSBGClient} from "../../util/sbg-client-proxy";
import {boot, partialProxy, proxerialize, shutdown} from "../../util/util";

describe("app publishing", () => {
    let app: spectron.Application;

    afterEach(() => shutdown(app));

    it("opens newly published app in a new tab", async function () {

        const user    = generateAuthCredentials("test-user", "https://api.sbgenomics.com");
        const project = generatePlatformProject({id: "test-user/test-project"});

        const demoApp = fs.readFileSync(__dirname + "/stub/demo-app.json", "utf-8");

        app = await boot(this, {
            testTimeout: 10000,
            localRepository: {
                credentials: [user],
                activeCredentials: user,
                openTabs: [{
                    id: "/demo-app.json",
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
            overrideModules: [
                {
                    module: "fs-extra",
                    override: partialProxy("fs-extra", {
                        readFile: proxerialize((fileContent) => {
                            return (target, context, args) => {
                                const filepath = args[0];
                                const callback = args[args.length - 1];
                                if (filepath === "/demo-app.json") {
                                    return callback(null, fileContent);
                                }

                                return target(...args);
                            }
                        }, demoApp)
                    })
                },
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
                            }, demoApp)
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

        const publishBtn = `[data-test=publish-btn]`;

        await client.waitForEnabled(publishBtn, 2000);
        await client.click(publishBtn);
        await client.waitForVisible(modal);

        await client.setValue(nameControl, "Test App Publish");

        await client.click(`${projectControl} .selectize-input`);
        await client.waitForVisible(projectOption, 1000);
        await client.click(projectOption);


        await client.waitForEnabled(submitBtn, 3000);
        await client.click(submitBtn);

        const newTabSelector = `ct-workbox .tab-bar .tab:nth-child(2)`;
        await client.waitForVisible(newTabSelector, 2000);
        const tabTitle = await client.getText(`${newTabSelector} .title`);

        assert.equal(tabTitle, "Test App Publish");
    });
});

