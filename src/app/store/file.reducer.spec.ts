import {it, describe, expect} from "@angular/core/testing";
import * as R from "./file.reducer";
import {UPDATE_DIRECTORY_CONTENT} from "./actions";

describe('File Reducer', function () {

    describe("Directory tree state", () => {

        it("Should should add new objects to the state", () => {

            let state = R.directoryTree([], {
                type: UPDATE_DIRECTORY_CONTENT,
                payload: {
                    path: "./",
                    content: [
                        {name: "foo", relativePath: "foo", type: "directory"},
                        {name: "bar.html", relativePath: "bar", type: ".html"}
                    ]
                }
            });

            let expectation = [
            ];

            expect(state).toEqual(expectation);

            expect(state).toEqual([{name: "x-1"}, {name: "x-2"}]);
        });

    });
});
