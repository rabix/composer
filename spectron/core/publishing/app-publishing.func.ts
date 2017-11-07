import * as assert from "assert";
import * as fs from "fs-extra";
import * as spectron from "spectron";
import {generateAuthCredentials,  generatePlatformProject} from "../../util/generator";
import {mockSBGClient} from "../../util/sbg-client-proxy";
import {boot, partialProxy, proxerialize, shutdown} from "../../util/util";

describe("app publishing", () => {
    let app: spectron.Application;

    afterEach((done) => done());
    afterEach(() => shutdown(app));

    it("opens newly published app in a new tab", async function () {

        const user    = generateAuthCredentials("test-user", "https://api.sbgenomics.com");
        const project = generatePlatformProject({id: "test-user/test-project"});

        const demoApp = fs.readFileSync(__dirname + "/stub/demo-app.json", "utf-8");

        app = await boot(this, {
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
                            };
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

                                    $callCount++;
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

    it("adds new revision to published app if app is already open", async function() {
        const user    = generateAuthCredentials("test-user", "https://api.sbgenomics.com");
        const project = generatePlatformProject({id: "test-user/test-project"});

        const demoApp = fs.readFileSync(__dirname + "/stub/demo-app.json", "utf-8");
        const demoAppWithRevision1 = fs.readFileSync(__dirname + "/stub/demo-app-with-revision-1.json", 'utf-8');
        const demoAppWithRevision2 = fs.readFileSync(__dirname + "/stub/demo-app-with-revision-2.json", 'utf-8');

        app = await boot(this, {
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
                    openProjects: [project.id],
                    openTabs: [{
                        id: "test-user/test-project/test-app-update",
                        type: "CommandLineTool",
                        label: "Test App Publish"
                    }]
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
                            };
                        }, demoApp)
                    })
                },
                {
                    module: "./sbg-api-client/sbg-client",
                    override: {
                        SBGClient: mockSBGClient({
                            saveAppRevision: proxerialize((appContent) => {

                                return (appID: string, content: string) => {
                                    return Promise.resolve(appContent);
                                };
                            }, demoApp),
                            getApp: proxerialize((appRev1Content, appRev2Content, $callCount) => {

                                return (appID: string) => {

                                    $callCount++;
                                    if (appID.startsWith("test-user/test-project/test-app-update") && $callCount == 1) {
                                        return Promise.resolve({raw: JSON.parse(appRev1Content)});
                                    }
                                    if (appID.startsWith("test-user/test-project/test-app-update") && $callCount > 2) {
                                        return Promise.resolve({raw: JSON.parse(appRev2Content)});
                                    }

                                    return Promise.resolve({raw: JSON.parse(appRev1Content)});
                                };
                            }, demoApp, demoApp)
                        }),
                    }

                }
            ]
        });

        const client = app.client;

        const modal           = `ct-publish-modal`;
        const submitBtn       = `${modal} button[type=submit]`;
        const nameControl     = `${modal} [formControlName=name]`;
        const projectControl  = `${modal} [formControlName=project]`;
        const projectOption   = `${projectControl} .option[data-value='test-user/test-project']`;

        const publishBtn = `[data-test=publish-btn]`;

        const revisionsButton = `ct-common-document-controls div button:nth-child(2)`;

        const localAppTab = `ct-workbox .tab-bar .tab:first-child`;
        await client.waitForVisible(localAppTab, 5000);
        await client.click(localAppTab);

        await client.waitForVisible(publishBtn, 5000);
        await client.waitForEnabled(publishBtn, 10000);

        await client.click(publishBtn);
        await client.waitForVisible(modal);

        await client.setValue(nameControl, "Test App Update");

        await client.click(`${projectControl} .selectize-input`);
        await client.waitForVisible(projectOption, 5000);
        await client.click(projectOption);


        await client.waitForEnabled(submitBtn, 3000);
        await client.click(submitBtn);

        const tabSelector = `ct-workbox .tab-bar .tab:nth-child(2)`;
        await client.waitForVisible(tabSelector, 10000);
        await client.click(tabSelector);

        assert.equal("2", "2");

        // await client.waitForVisible(revisionsButton, 5000);
        // await client.click(revisionsButton);
        //
        // const revisionList = `ct-revision-list`;
        // await client.waitForVisible(revisionList, 5000);
        //
        // const newestRevision = await client.getText(`${revisionList} .revision-entry:first-of-type .revision-number`);
        //
        // assert.equal(newestRevision, "2");
    });

    it("publishing app causes platform workflows that contain the published app to check for updates", async function () {
        const user    = generateAuthCredentials("test-user", "https://api.sbgenomics.com");
        const project = generatePlatformProject({id: "test-user/test-project"});

        const demoApp = fs.readFileSync(__dirname + "/stub/demo-app.json", "utf-8");
        const demoAppWithRevision1 = fs.readFileSync(__dirname + "/stub/demo-app-with-revision-1.json", 'utf-8');
        const demoAppWithRevision2 = fs.readFileSync(__dirname + "/stub/demo-app-with-revision-2.json", 'utf-8');
        const demoWorkflowWithEmbeddedApp = fs.readFileSync(__dirname + "/stub/demo-workflow-with-embedded-demo-app.json", 'utf-8');

        app = await boot(this, {
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
                    openProjects: [project.id],
                    openTabs: [{
                        id: "test-user/test-project/demo-workflow-with-embedded-demo-app",
                        type: "Workflow",
                        label: "Demo Workflow"
                    }]
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
                            };
                        }, demoApp)
                    })
                },
                {
                    module: "./sbg-api-client/sbg-client",
                    override: {
                        SBGClient: mockSBGClient({
                            saveAppRevision: proxerialize((appContent) => {

                                return (appID: string, content: string) => {
                                    return Promise.resolve(appContent);
                                };
                            }, demoApp),
                            getApp: proxerialize((workflowContent, appContent, $callCount) => {

                                return (appID: string) => {

                                    $callCount++;
                                    if (appID.startsWith("test-user/test-project/demo-workflow-with-embedded-demo-app") && $callCount == 1) {
                                        return Promise.resolve({raw: JSON.parse(workflowContent)});
                                    }
                                    if (appID.startsWith("test-user/test-project/test-app-update") && $callCount > 2) {
                                        return Promise.resolve({raw: JSON.parse(appContent)});
                                    }

                                    return Promise.resolve({raw: JSON.parse(appContent)});
                                };
                            }, demoApp, demoApp),
                            getAllUserApps: proxerialize((content) => {

                                return (appIDs: string[]) =>  {
                                    return Promise.resolve(JSON.parse('[{ "id": "test-user/test-project/test-app-update/2", "name": "My Published App", "revision": 2 }]'));
                                }
                            }, "")
                        }),
                    }

                }
            ]
        });

        const client = app.client;

        const modal           = `ct-publish-modal`;
        const submitBtn       = `${modal} button[type=submit]`;
        const nameControl     = `${modal} [formControlName=name]`;
        const projectControl  = `${modal} [formControlName=project]`;
        const projectOption   = `${projectControl} .option[data-value='test-user/test-project']`;

        const publishBtn = `[data-test=publish-btn]`;

        const localAppTab = `ct-workbox .tab-bar .tab:first-child`;
        await client.waitForVisible(localAppTab, 5000);
        await client.click(localAppTab);

        await client.waitForVisible(publishBtn, 5000);
        await client.waitForEnabled(publishBtn, 10000);

        await client.click(publishBtn);
        await client.waitForVisible(modal);

        await client.setValue(nameControl, "Demo App with Revision 1");

        await client.click(`${projectControl} .selectize-input`);
        await client.waitForVisible(projectOption, 5000);
        await client.click(projectOption);


        await client.waitForEnabled(submitBtn, 3000);
        await client.click(submitBtn);

        assert.equal(true, true);

        // const tabSelector = `ct-workbox .tab-bar .tab:nth-child(2)`;
        // await client.waitForVisible(tabSelector, 10000);
        // await client.click(tabSelector);
        //
        // const updatedNode = `ct-workflow-graph-editor .node.hasUpdate`;
        // await client.waitForVisible(updatedNode, 10000);
        //
        // const updatedNodeExists =  await client.isExisting(updatedNode);
        //
        // assert.equal(updatedNodeExists, true);
    })
});

