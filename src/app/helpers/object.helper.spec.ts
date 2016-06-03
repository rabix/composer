import {it, describe, expect} from "@angular/core/testing";
import {ObjectHelper} from "./object.helper";

describe("ObjectHelper", () => {

    describe("addProperty()", () => {

        it("should add a root-level value to an empty object", () => {
            const target   = {},
                  addition = "bar";

            ObjectHelper.addProperty(target, "foo", addition);
            expect(target).toEqual({foo: "bar"});
        });

        it("should add a nested value to an empty object", () => {
            const target   = {},
                  addition = "bar";

            ObjectHelper.addProperty(target, "foo.baz.maz", addition);
            expect(target).toEqual({foo: {baz: {maz: "bar"}}});
        });

        it("should override a nested object", () => {
            const target   = {foo: {moo: "boo"}},
                  addition = {baz: {taz: "gaz"}};

            ObjectHelper.addProperty(target, "foo.moo", addition);
            expect(target).toEqual({foo: {moo: {baz: {taz: "gaz"}}}});
        });

        it("should throw an error is the value to override is not an object or undefined", () => {
            const target   = {foo: {moo: 2000}},
                  addition = {baz: "taz"};

            expect(() => {
                ObjectHelper.addProperty(target, "foo.moo.goo", addition)
            }).toThrowError();
        });

        it("should work with arrays", () => {
            const target   = {foo: "moo"},
                  addition = {baz: {taz: "gaz"}};

            ObjectHelper.addProperty(target, ["goo", "boo"], addition);
            expect(target).toEqual({
                foo: "moo",
                goo: {boo: {baz: {taz: "gaz"}}}
            });
        });
    });

});
