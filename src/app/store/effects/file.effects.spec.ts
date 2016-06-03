import {
    MOCK_EFFECTS_PROVIDERS,
    MockStateUpdates
} from '@ngrx/effects/testing';

import {FileEffects} from "./file.effects";
import {ReflectiveInjector, provide} from "@angular/core";
import {it, inject, describe, beforeEachProviders} from "@angular/core/testing";
import {FileApi} from "../../services/api/file.api";
import {Observable} from "rxjs/Rx";
import {AsyncTestCompleter} from "@angular/core/testing/async_test_completer";

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
                }
            }
        })
    ]);


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
