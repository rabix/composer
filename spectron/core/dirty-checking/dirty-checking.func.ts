import * as assert from "assert";
import * as fs from "fs-extra";
import * as spectron from "spectron";
import {generateAuthCredentials, generatePlatformProject} from "../../util/generator";
import {boot, proxerialize, shutdown} from "../../util/util";
import {mockSBGClient} from "../../util/sbg-client-proxy";

describe("dirty checking", async () => {
    let app: spectron.Application;
    const user =  generateAuthCredentials("test-user", "https://api.sbgenomics.com");
    const project = generatePlatformProject({id: "test-user/test-project"});
    const localTool = fs.readFileSync(__dirname + "/stub/local-tool.json", "utf-8");
    const localWorkflow = fs.readFileSync(__dirname + "/stub/local-workflow.json", "utf-8");
    const platformTool = fs.readFileSync(__dirname + "/stub/platform-tool.json", "utf-8");
    const platformWorkflow = fs.readFileSync(__dirname + "/stub/platform-workflow.json", "utf-8");
    const localFile = fs.readFileSync(__dirname + "/stub/local-file.json", "utf-8");

    afterEach(() => shutdown(app));

    describe("prevent closing tabs", async () => {

        it("modal should prevent closing dirty apps", async function () {

            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-app-tool.json",
                    content: localTool
                }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-app-tool.json",
                        type: "CommandLineTool",
                        label: "My Demo App",
                        isWritable: true
                    }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-tool-visual-editor`;
            const tab = `ct-workbox .tab`;
            const closingDirtyAppsModal = `ct-modal-closing-dirty-apps`;
            const commonDocumentControls = `ct-common-document-controls`;
            const docker = `[data-test="docker-pull-input"]`;

            await client.waitForVisible(visualEditor);
            await client.waitForVisible(docker);

            // Tab should not be dirty
            await waitUntilTabBecomeDirty(client, tab, false);

            // Set docker value
            await client.setValue(docker, "someText");

            // Wait until tab is dirty
            await waitUntilTabBecomeDirty(client, tab);

            // Click to close the tab,  Dirty Apps Modal should appear
            await client.click(`${tab} .close-icon`);
            await client.waitForVisible(closingDirtyAppsModal);

            // If you click on Cancel button, tab should be still Dirty
            await client.click(`${closingDirtyAppsModal} [data-test="dirty-app-modal-cancel-button"]`);
            await waitUntilTabBecomeDirty(client, tab);

            // When you click on Save button, tab should not be Dirty anymore
            await client.click(`${commonDocumentControls} [data-test="save-button"]`);
            await waitUntilTabBecomeDirty(client, tab, false);

            // When you change something again tab should be Dirty
            await client.setValue(docker, "someText1");
            await waitUntilTabBecomeDirty(client, tab);

            // Click to close the tab, Dirty Apps Modal should appear
            await client.click(`${tab} .close-icon`);
            await client.waitForVisible(closingDirtyAppsModal);

            // If you click on Save button app should be saved and Dirty state should be false
            await client.click(`${closingDirtyAppsModal} [data-test="dirty-app-modal-save-button"]`);
            await waitUntilTabBecomeDirty(client, tab, false);

            // If you click on close button now, tab should be closed
            await client.click(`${tab} .close-icon`);

            await client.waitUntil(async () => {
                const isVisible = await client.isVisible(tab);
                return !isVisible;
            }, 5000);

        });

        it("modal that prevents closing dirty tabs should have discard button", async function () {

            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-app-tool.json",
                    content: localTool
                }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-app-tool.json",
                        type: "CommandLineTool",
                        label: "My Demo App",
                        isWritable: true
                    }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-tool-visual-editor`;
            const tab = `ct-workbox .tab`;
            const closingDirtyAppsModal = `ct-modal-closing-dirty-apps`;
            const docker = `[data-test="docker-pull-input"]`;

            await client.waitForVisible(visualEditor);
            await client.waitForVisible(docker);

            // Set docker value
            await client.setValue(docker, "someText");

            // Wait until tab is dirty
            await waitUntilTabBecomeDirty(client, tab);

            // Click to close the tab, Dirty Apps Modal should appear
            await client.click(`${tab} .close-icon`);
            await client.waitForVisible(closingDirtyAppsModal);

            // If you click on Discard button app tab should be closed
            await client.click(`${closingDirtyAppsModal} [data-test="dirty-app-modal-discard-button"]`);

            await client.waitUntil(async () => {
                const isVisible = await client.isVisible(tab);
                return !isVisible;
            }, 5000);

        });

        it("Close all tabs context menu item should work as expected", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-app-tool1.json",
                    content: localTool
                },
                    {
                        name: "/demo-app-tool2.json",
                        content: localTool
                    }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-app-tool1.json",
                        type: "CommandLineTool",
                        label: "My Demo App",
                        isWritable: true
                    },
                        {
                            id: "test:/demo-app-tool2.json",
                            type: "CommandLineTool",
                            label: "My Demo App",
                            isWritable: true
                        }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-tool-visual-editor`;
            const tab = `ct-workbox .tab`;
            const activeTab = `ct-workbox .tab.active`;
            const docker = `[data-test="docker-pull-input"]`;
            const contextMenu = `ct-menu`;
            const contextMenuItem = `ct-menu-item`;
            const modalConfirm = `ct-modal-confirm`;

            await client.waitForVisible(visualEditor);
            await client.waitForVisible(docker);

            let tabs = await client.elements(`.tab`);
            assert.equal(tabs.value.length, 2, "2 tabs should be visible");

            await client.setValue(docker, "someText");

            // Wait until active tab becomes dirty
            await waitUntilTabBecomeDirty(client, activeTab);

            // Right click on active tab (second one is active) to open the context menu
            await client.rightClick(activeTab);

            await client.waitForVisible(contextMenu);

            // click on close all item
            await client.click(`${contextMenuItem}:nth-of-type(2)`);

            // Confirm modal should appear
            await client.waitForVisible(modalConfirm);

            // click on Cancel button
            await client.click(`${modalConfirm} .btn-secondary`);

            // Both tabs should be still visible
            tabs = await client.elements(`.tab`);
            assert.equal(tabs.value.length, 2, "2 tabs should be still here");

            // Click on first tab to activate it
            await client.click(`${tab}:nth-of-type(1)`);

            //  Right click on active tab (first one is active) to open the context menu
            await client.rightClick(activeTab);

            // click on close all
            await client.click(`${contextMenuItem}:nth-of-type(2)`);

            // Confirm modal should appear
            await client.waitForVisible(modalConfirm);

            // Click on confirmation button
            await client.click(`${modalConfirm} .btn-primary`);

            // All tabs should be closed
            tabs = await client.elements(tab);
            assert.equal(tabs.value.length, 0);
        });

        it("Close others context menu item should close items if they are not dirty", async function () {
                app = await boot(this, {
                    prepareTestData: [{
                        name: "/demo-app-tool1.json",
                        content: localTool
                    },
                        {
                            name: "/demo-app-tool2.json",
                            content: localTool
                        }],
                    localRepository: {
                        credentials: [user],
                        activeCredentials: user,
                        openTabs: [{
                            id: "test:/demo-app-tool1.json",
                            type: "CommandLineTool",
                            label: "My Demo App",
                            isWritable: true
                        },
                            {
                                id: "test:/demo-app-tool2.json",
                                type: "CommandLineTool",
                                label: "My Demo App",
                                isWritable: true
                            }]
                    },
                    platformRepositories: {
                        [user.id]: {
                            projects: [project],
                            openProjects: [project.id]
                        }
                    }
                });

                const client = app.client;

                const visualEditor = `ct-tool-visual-editor`;
                const tab = `ct-workbox .tab`;
                const activeTab = `ct-workbox .tab.active`;
                const docker = `[data-test="docker-pull-input"]`;
                const contextMenu = `ct-menu`;
                const contextMenuItem = `ct-menu-item`;

                await client.waitForVisible(visualEditor);
                await client.waitForVisible(docker);

                await client.setValue(docker, "someText");

                // Wait until tab is dirty
                await waitUntilTabBecomeDirty(client, activeTab);

                // Right click on active tab (second one is active) to open the context menu
                await client.rightClick(activeTab);
                await client.waitForVisible(contextMenu);

                // Click on Close others menu item
                await client.click(`${contextMenuItem}:nth-of-type(1)`);

                const tabs = await client.elements(tab);
                assert.equal(tabs.value.length, 1, "One tab should be open.");
        });

        it("Close others tab menu item should show modal if there are dirty tabs", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-app-tool1.json",
                    content: localTool
                },
                    {
                        name: "/demo-app-tool2.json",
                        content: localTool
                    }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-app-tool1.json",
                        type: "CommandLineTool",
                        label: "My Demo App",
                        isWritable: true
                    },
                        {
                            id: "test:/demo-app-tool2.json",
                            type: "CommandLineTool",
                            label: "My Demo App",
                            isWritable: true
                        }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-tool-visual-editor`;
            const tab = `ct-workbox .tab`;
            const activeTab = `ct-workbox .tab.active`;
            const docker = `[data-test="docker-pull-input"]`;
            const contextMenu = `ct-menu`;
            const contextMenuItem = `ct-menu-item`;
            const modalConfirm = `ct-modal-confirm`;

            await client.waitForVisible(visualEditor);
            await client.waitForVisible(docker);

            await client.setValue(docker, "someText");

            await waitUntilTabBecomeDirty(client, activeTab);

            // Click on first tab to activate it
            await client.click(`${tab}:nth-of-type(1)`);

            // Right click to open context menu
            await client.rightClick(activeTab);

            await client.waitForVisible(contextMenu);

            // Click on Close Others menu item
            await client.click(`${contextMenuItem}:nth-of-type(1)`);

            // Modal should appear
            await client.waitForVisible(modalConfirm);

            // Click on cancel button
            await client.click(`${modalConfirm} .btn-secondary`);

            let tabs = await client.elements(tab);
            assert.equal(tabs.value.length, 2, "Both tabs should be open");

            // Right click on active tab (first one is active) to open context menu
            await client.rightClick(activeTab);

            // Click on Close Others menu item
            await client.click(`${contextMenuItem}:nth-of-type(1)`);

            // Modal should appear
            await client.waitForVisible(modalConfirm);

            // Click on Close Others button
            await client.click(`${modalConfirm} .btn-primary`);

            tabs = await client.elements(tab);
            assert.equal(tabs.value.length, 1, "One tab should be open");
        });


        it("Close all tabs context menu item should close all tabs if there is no dirty ones", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-app-tool1.json",
                    content: localTool
                },
                    {
                        name: "/demo-app-tool2.json",
                        content: localTool
                    }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-app-tool1.json",
                        type: "CommandLineTool",
                        label: "My Demo App",
                        isWritable: true
                    },
                        {
                            id: "test:/demo-app-tool2.json",
                            type: "CommandLineTool",
                            label: "My Demo App",
                            isWritable: true
                        }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-tool-visual-editor`;
            const tab = `ct-workbox .tab`;
            const activeTab = `ct-workbox .tab.active`;
            const contextMenu = `ct-menu`;
            const contextMenuItem = `ct-menu-item`;

            await client.waitForVisible(visualEditor);

            await client.rightClick(activeTab);
            await client.waitForVisible(contextMenu);

            //  Click on Close All context menu item
            await client.click(`${contextMenuItem}:nth-of-type(2)`);

            const tabs = await client.elements(tab);
            assert.equal(tabs.value.length, 0, "There should be no open tabs");
        });

    });

    describe("actions in FileEditor should make tab dirty", async () => {
        it("modifing content should make tab dirty", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-file.json",
                    content: localFile
                }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-file.json",
                        type: "Code",
                        label: "My Demo App",
                        isWritable: true
                    }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;
            const tab = `ct-workbox .tab`;
            const fileEditor = `ct-file-editor`;
            const modal = `ct-modal-closing-dirty-apps`;
            const aceEditorContent = `.ace_content`;

            await client.waitForVisible(fileEditor);
            await client.waitForVisible(aceEditorContent);

            // Modify some text in code editor
            await client.click(aceEditorContent);
            client.keys("maxi");

            // Wait until tab is dirty
            await waitUntilTabBecomeDirty(client, tab);

            // Click to close the tab, Dirty Apps Modal should appear
            await client.click(`.tab .close-icon`);
            await client.waitForVisible(modal);
        });

    });

    describe("actions in CommandLineTool should make tab dirty", async () => {

        it("Changing Code editor content should make tab dirty", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-app-tool.json",
                    content: localTool
                }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-app-tool.json",
                        type: "CommandLineTool",
                        label: "My Demo App",
                        isWritable: true
                    }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-tool-visual-editor`;
            const tab = `ct-workbox .tab`;
            const codeTab = `[data-test="tool-code-tab"]`;
            const codeTabContent = `ct-code-editor`;
            const aceEditorContent = `.ace_content`;

            await client.waitForVisible(visualEditor);

            // Click on Code to activate code editor
            await client.click(codeTab);
            await client.waitForVisible(codeTabContent);

            // Tab should not be dirty
            await waitUntilTabBecomeDirty(client, tab, false);

            // Add some text in code editor
            await client.click(aceEditorContent);
            client.keys("Some random text");

            // Tab should become dirty
            await waitUntilTabBecomeDirty(client, tab);

        });

        it("Changing App info content should make tab dirty", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-app.json",
                    content: localTool
                }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-app.json",
                        type: "CommandLineTool",
                        label: "My Demo App",
                        isWritable: true
                    }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-tool-visual-editor`;
            const tab = `ct-workbox .tab`;
            const infoTab = `[data-test="tool-info-tab"]`;
            const infoTabSection = `ct-app-info`;
            const inlineEditor = `ct-inline-editor`;

            await client.waitForVisible(visualEditor);

            // Click on App info to activate app info page
            await client.click(infoTab);
            await client.waitForVisible(infoTabSection);

            // Click on first inline editor area
            await client.click(inlineEditor);

            // Change some text
            await client.setValue(`${inlineEditor} input`, "sometext");

            // Save changes
            await client.click(`${inlineEditor} .btn-primary`);

            // Tab should be dirty
            await waitUntilTabBecomeDirty(client, tab);
        });

        it("modal should prevent changing revisions if tab is dirty", async function () {
            app = await boot(this, {
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: []
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id],
                        openTabs: [{
                            id: "marijanlekic89/div-nesto-input/draft2",
                            type: "CommandLineTool",
                            label: "My Demo App",
                            isWritable: true
                        }]
                    }
                },
                overrideModules: [
                    {
                        module: "./sbg-api-client/sbg-client",
                        override: {
                            SBGClient: mockSBGClient({
                                getApp: proxerialize((appContent) => {
                                    return () => {
                                        return Promise.resolve({raw: JSON.parse(appContent)});
                                    };
                                }, platformTool)
                            }),
                        }

                    }
                ]
            });

            const client = app.client;
            const visualEditor = `ct-tool-visual-editor`;
            const tab = `ct-workbox .tab`;
            const docker = `[data-test="docker-pull-input"]`;
            const revisionBtn = `[data-test="revision-button"]`;
            const revisionComponent = `ct-revision-list`;
            const closingDirtyAppsModal = `ct-modal-closing-dirty-apps`;

            await client.waitForVisible(visualEditor);
            await client.waitForVisible(docker);

            await client.setValue(docker, "someText");

            // Tab should be dirty
            await waitUntilTabBecomeDirty(client, tab);

            // Click on revision button
            await client.click(revisionBtn);

            // Revision component should appear
            await client.waitForVisible(revisionComponent);

            // Click on revision entry
            await client.click(`${revisionComponent} .revision-entry:nth-of-type(2)`);

            // Modal should prevent changing revision
            await client.waitForVisible(closingDirtyAppsModal);

            // Click on cancel button
            await client.click(`${closingDirtyAppsModal} [data-test="dirty-app-modal-cancel-button"]`);

            // Tab should be still dirty
            await waitUntilTabBecomeDirty(client, tab);

            // Click again to change the revision
            await client.click(`${revisionComponent} .revision-entry:nth-of-type(2)`);

            // Click on discard button
            await client.click(`${closingDirtyAppsModal} [data-test="dirty-app-modal-discard-button"]`);

            // Tab should not be dirty anymore
            await waitUntilTabBecomeDirty(client, tab, false);

        });

    });

    describe("actions in Workflow should make tab dirty", async () => {

        it("Changing App info content should make tab dirty", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-workflow.json",
                    content: localWorkflow
                }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-workflow.json",
                        type: "Workflow",
                        label: "My Demo App",
                        isWritable: true
                    }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-workflow-graph-editor`;
            const tab = `ct-workbox .tab`;
            const infoTab = `[data-test="workflow-info-tab"]`;
            const infoTabSection = `ct-app-info`;
            const inlineEditor = `ct-inline-editor`;

            await client.waitForVisible(visualEditor);

            // Click on App info to activate app info page
            await client.click(infoTab);
            await client.waitForVisible(infoTabSection);

            // Click on first inline editor area
            await client.click(inlineEditor);

            // Change some text
            await client.setValue(`${inlineEditor} input`, "sometext");

            // Save changes
            await client.click(`${inlineEditor} .btn-primary`);

            // Tab should be dirty
            await waitUntilTabBecomeDirty(client, tab);
        });


        it("actions in visual editor should make tab dirty ", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-workflow.json",
                    content: localWorkflow
                }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-workflow.json",
                        type: "Workflow",
                        label: "My Demo App",
                        isWritable: true
                    }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-workflow-graph-editor`;
            const tab = `ct-workbox .tab`;
            const arrange = `[data-test="workflow-graph-arrange-button"]`;

            await client.waitForVisible(visualEditor);

            // Click on arrange button
            await client.waitForVisible(arrange);
            await client.click(arrange);

            // Tab should be dirty
            await waitUntilTabBecomeDirty(client, tab);
        });

        it("Changing Code editor content should make tab dirty", async function () {
            app = await boot(this, {
                prepareTestData: [{
                    name: "/demo-workflow.json",
                    content: localWorkflow
                }],
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: [{
                        id: "test:/demo-workflow.json",
                        type: "Workflow",
                        label: "My Demo App",
                        isWritable: true
                    }]
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id]
                    }
                }
            });

            const client = app.client;

            const visualEditor = `ct-workflow-graph-editor`;
            const tab = `ct-workbox .tab`;
            const codeTab = `[data-test="workflow-code-tab"]`;
            const codeTabContent = `ct-code-editor`;
            const aceEditorContent = `.ace_content`;

            await client.waitForVisible(visualEditor);

            // Click on Code to activate code editor
            await client.click(codeTab);
            await client.waitForVisible(codeTabContent);

            // Tab should not be dirty
            await waitUntilTabBecomeDirty(client, tab, false);

            // Add some text in code editor
            await client.click(aceEditorContent);
            client.keys("Some random text");

            // Tab should become dirty
            await waitUntilTabBecomeDirty(client, tab);

        });

        it("modal should prevent changing revisions if tab is dirty", async function () {
            app = await boot(this, {
                localRepository: {
                    credentials: [user],
                    activeCredentials: user,
                    openTabs: []
                },
                platformRepositories: {
                    [user.id]: {
                        projects: [project],
                        openProjects: [project.id],
                        openTabs: [{
                            id: "marijanlekic89/div-nesto-input/draft2",
                            type: "Workflow",
                            label: "My Demo App",
                            isWritable: true
                        }]
                    }
                },
                overrideModules: [
                    {
                        module: "./sbg-api-client/sbg-client",
                        override: {
                            SBGClient: mockSBGClient({
                                getApp: proxerialize((appContent) => {
                                    return () => {
                                        return Promise.resolve({raw: JSON.parse(appContent)});
                                    };
                                }, platformWorkflow)
                            }),
                        }

                    }
                ]
            });

            const client = app.client;
            const visualEditor = `ct-workflow-graph-editor`;
            const tab = `ct-workbox .tab`;
            const arrange = `[data-test="workflow-graph-arrange-button"]`;
            const revisionBtn = `[data-test="revision-button"]`;
            const revisionComponent = `ct-revision-list`;
            const closingDirtyAppsModal = `ct-modal-closing-dirty-apps`;

            await client.waitForVisible(visualEditor, 5000);
            await client.waitForVisible(arrange, 5000);

            await client.click(arrange);

            // Tab should be dirty
            await waitUntilTabBecomeDirty(client, tab);

            // Click on revision button
            await client.click(revisionBtn);

            // Revision component should appear
            await client.waitForVisible(revisionComponent, 5000);

            // Click on revision entry
            await client.click(`${revisionComponent} .revision-entry:nth-of-type(2)`);

            // Modal should prevent changing revision
            await client.waitForVisible(closingDirtyAppsModal, 5000);

            // Click on cancel button
            await client.click(`${closingDirtyAppsModal} [data-test="dirty-app-modal-cancel-button"]`);

            // Tab should be still dirty
            await waitUntilTabBecomeDirty(client, tab);

            // Click again to change the revision
            await client.click(`${revisionComponent} .revision-entry:nth-of-type(2)`);

            // Click on discard button
            await client.click(`${closingDirtyAppsModal} [data-test="dirty-app-modal-discard-button"]`);

            // Tab should not be dirty anymore
            await waitUntilTabBecomeDirty(client, tab, false);
        });
    });

});


async function waitUntilTabBecomeDirty(client, tab, dirty = true) {
    return await client.waitUntil(async () => {
       const has =  await hasClass(client, tab);
        return dirty ? has : !has;
    }, 5000, `Tab should${!dirty ? " not " : ""}be dirty`);
}

async function hasClass(client, element) {
    const elementClass = await client.getAttribute(element, "class").then((r) => r);
    return elementClass.split(" ").includes("isDirty");
}
