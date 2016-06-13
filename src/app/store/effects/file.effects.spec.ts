import {
    MOCK_EFFECTS_PROVIDERS,
    MockStateUpdates
} from '@ngrx/effects/testing';

import {FileEffects} from "./file.effects";
import {ReflectiveInjector, provide} from "@angular/core";
import {it, inject, describe, beforeEachProviders, expect} from "@angular/core/testing";
import {FileApi} from "../../services/api/file.api";
import {Observable} from "rxjs/Rx";
import {AsyncTestCompleter} from "@angular/core/testing/async_test_completer";
import {FileModel} from "../models/fs.models";
import * as ACTIONS from "../../store/actions";

describe('File Effects', function () {
    // let fileEffects: FileEffects;
    // let updates$: MockStateUpdates;
    //
    // beforeEach(function () {
    //
    //     const injector = ReflectiveInjector.resolveAndCreate([
    //         FileEffects,
    //         MOCK_EFFECTS_PROVIDERS,
    //     ]);
    //
    //     fileEffects = injector.get(FileEffects);
    //     updates$    = injector.get(MockStateUpdates);
    // });

    beforeEachProviders(() => [
        FileEffects,
        MOCK_EFFECTS_PROVIDERS,
        AsyncTestCompleter,
        provide(FileApi, {
            useValue: {
                getDirContent: function () {
                    //noinspection TypeScriptUnresolvedFunction
                    return Observable.of(["first", "second", "third"]);
                },
                getFileContent: (path) => {
                    if (!path) {
                        return Observable.create((obs) => {
                            obs.error("error message");
                        });
                    }

                    //noinspection TypeScriptUnresolvedFunction
                    return Observable.of(new FileModel({
                        name: "file1",
                        content: "hello world"
                    }));
                },
                createFile: (path) => {
                    if (!path) {
                        return Observable.create((obs) => {
                            obs.error("error message");
                        });
                    }

                    //noinspection TypeScriptUnresolvedVariable
                    return Observable.of(new FileModel({
                        name: "file1",
                        content: "hello world"
                    }));
                }
            }
        })
    ]);


    describe('Directory Content', () => {
        it('should respond in a certain way', inject([MockStateUpdates, FileEffects, AsyncTestCompleter],
            (updates: MockStateUpdates, fileFx: FileEffects, completer: AsyncTestCompleter) => {

                updates.sendAction({type: "DIR_CONTENT", payload: "nothing"});

                completer.done("yay");
                // Add an action in the updates queue
                // updates$.sendAction({type: 'LOGIN', payload: "hello"});

                // fileEffects.directoryContent$.subscribe(function (action) {
                //     console.log("Got dir content action", action);
                // });
            }
        ));
    });


    describe('File Content', () => {
        it('should retrieve file content', inject([MockStateUpdates, FileEffects],
            (updates: MockStateUpdates, fileFx: FileEffects) => {
                updates.sendAction({type: ACTIONS.FILE_CONTENT_REQUEST, payload: "somePath"});

                fileFx.fileContent$.subscribe((action) => {
                    expect(action.payload.model instanceof FileModel).toBe(true);
                    expect(action.payload.model.content).toBe("hello world");
                });
            }
        ));

        it('should handle an error correctly', inject([MockStateUpdates, FileEffects],
            (updates: MockStateUpdates, fileFx: FileEffects)=> {
                updates.sendAction({type: ACTIONS.FILE_CONTENT_REQUEST, payload: ''});

                fileFx.fileContent$.subscribe((error) => {
                    expect(error.payload).toBeDefined();
                    expect(error.payload.error).toBe("error message");
                });
            }
        ));
    });

    describe('New File', () => {
        it('should create a new file and return its file model', inject([MockStateUpdates, FileEffects],
            (updates: MockStateUpdates, fileFx: FileEffects) => {
                updates.sendAction({type: ACTIONS.CREATE_FILE_REQUEST, payload: "filePath"});

                fileFx.newFile$.subscribe((action) => {
                    expect(action.payload.model instanceof FileModel).toBe(true);
                    expect(action.payload.path).toEqual("filePath");
                });
            }
        ));


        it('should handle an error correctly', inject([MockStateUpdates, FileEffects],
            (updates: MockStateUpdates, fileFx: FileEffects)=> {
                updates.sendAction({type: ACTIONS.CREATE_FILE_REQUEST, payload: ''});

                fileFx.fileContent$.subscribe((error) => {
                    expect(error.payload).toBeDefined();
                    expect(error.payload.error).toBe("error message");
                });
            }
        ))
    })
});


//@todo(maya) add test for fileContent effect
