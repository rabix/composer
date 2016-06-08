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
                    return Observable.of(["first", "second", "third"]);
                },
                getFileContent: () => {
                    return Observable.of(FileModel.createFromObject({
                        name: 'file1',
                        content: 'hello world'
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
        it('should retreive file content', inject([MockStateUpdates, FileEffects, AsyncTestCompleter],
            (updates: MockStateUpdates, fileFx: FileEffects, completer: AsyncTestCompleter) => {
                updates.sendAction({type: ACTIONS.FILE_CONTENT_REQUEST, payload: "nothing"});

                fileFx.fileContent$.subscribe((action) => {
                    expect(action.payload.model instanceof FileModel).toBeTruthy();
                    expect(action.payload.model.content).toBe("hello world");
                    completer.done("finished");
                })
            }
        ));
    });
});


//@todo(maya) add test for fileContent effect