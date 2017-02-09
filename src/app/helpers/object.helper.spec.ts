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

        it("should update array indexes", () => {
            const t = {foo: ["bar", "baz", "nar"]};
            ObjectHelper.addProperty(t, "foo.[1]", "marx");
            expect(t.foo[1]).toEqual("marx");
        });

        it("should add array elements and objects unexpectedly well", () => {
            const t: any = {};

            ObjectHelper.addProperty(t, "foo.[2].[3].path", "baz");
            expect(Array.isArray(t.foo[2])).toBe(true);
            expect(t.foo[2][3].path).toBe("baz");
        });
    });

    describe("getProperty()", () => {
        it("should retrieve first-level property from an object", () => {
            expect(ObjectHelper.getProperty({hello: "world"}, "hello")).toEqual("world");
        });

        it("should return a default value when requested property doesn't exist", () => {
            expect(ObjectHelper.getProperty({}, "hello")).toBeUndefined();
            expect(ObjectHelper.getProperty({hello: {foo: "bar"}}, "hello.boo", "moo")).toEqual("moo");
        });

        it("should retrieve  nested property", () => {
            const nested = {ray: "casting"};
            const target = {
                hello: {
                    foo: "bar"
                },
                meister: {
                    boo: nested
                }
            };
            expect(ObjectHelper.getProperty(target, "hello.foo")).toEqual("bar");
            expect(ObjectHelper.getProperty(target, "meister.boo")).toBe(nested);
        });

        it("should retrieve array indexes", () => {
            const arr = {ray: ["foo", "bar", "baz"]};
            expect(ObjectHelper.getProperty(arr, "ray.[1]")).toEqual("bar");
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
});
