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

    /**
     * @name ObjectHelper-addEnumerablesTest
     */
    describe("addEnumerables()", () => {
        it("should add source properties that exist on the target object", () => {
            let target = {foo: "", bar: ""};
            let source = {bar: "baz", goo: "moo"};

            ObjectHelper.addEnumerables(target, source);

            expect(target).toEqual({foo: "", bar: "baz"});
        });

        it("should extend class instance properties", () => {
            class TestClass {
                private first    = null;
                protected second = "moo";
                public third     = null;
            }

            let instance = new TestClass();
            let source   = {first: "foo", second: "bar", third: "baz"};

            ObjectHelper.addEnumerables(instance, source);
            expect((<any>instance).first).toEqual("foo");
            expect((<any>instance).second).toEqual("bar");
            expect((<any>instance).third).toEqual("baz");

        });

    });


    describe("iterate", () => {
        it("should find nested properties and apply the callback", () => {
            let obj = { a: 123, b: { c: { d: 456 }, e: 789 }, g: "ABC" };

            ObjectHelper.iterateAll(obj, function (propName, value, obj) {
                if (propName === 'd') {
                    obj['d'] = 444;
                }

                if (propName === 'a') {
                    obj['a'] = 111;
                }
            });

            expect(obj.b.c.d).toEqual(444);
            expect(obj.a).toEqual(111);
        });

        it("should handle circular references", () => {
            let obj1 = { a: 444 };
            let obj2 = { a: 123, b: { c: { d: 456 }, e: 789 }, g: "ABC", h: obj1, j: [1] };

            obj1['circular'] = obj2 ;

            obj2.b.c['circular'] = obj2;
            obj2.j.push(obj2);

            let resultValues = [];
            ObjectHelper.iterateAll(obj2, function (propName, value)  {
                    resultValues.push(value);
            });

            expect(resultValues).toEqual([123, 'ABC', 1, 444, 789, 456]);
        });
    });

});
