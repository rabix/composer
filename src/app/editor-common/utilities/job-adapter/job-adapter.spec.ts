import {fixJob} from "./job-adapter";
import {V1CommandLineToolModel} from "cwlts/models/v1.0";
import {CommandLineTool, CommandInputParameter} from "cwlts/mappings/v1.0";
import {JobHelper} from "cwlts/models/helpers/JobHelper";
import {CommandLineToolModel} from "cwlts/models";
import objectContaining = jasmine.objectContaining;
import any = jasmine.any;

describe("JobAdapter", () => {

    it("should generate all values for an empty job", () => {
        const model = makeToolWithInputs([
            {id: "file_id", type: "File"},
            {id: "string_id", type: "string"},
        ]);

        const mockData = JobHelper.getJobInputs(model);
        const adapted  = fixJob({}, model);
        expect(adapted).toEqual(objectContaining(mockData));
    });

    it("should remove entries for non-existing inputs", () => {
        const model = makeToolWithInputs([
            {id: "string_id", type: "string"}
        ]);

        const mockData = JobHelper.getJobInputs(model);
        const adapted  = fixJob({foo: "bar"}, model);

        expect(adapted).toEqual(objectContaining(mockData));
    });

    it("should add missing keys", () => {
        const model = makeToolWithInputs([
            {id: "boolean_id", type: "boolean"},
            {id: "string_id", type: "string"}
        ]);

        const mockData = JobHelper.getJobInputs(model);

        expect(fixJob({
            boolean_id: false
        }, model)).toEqual(objectContaining({
            boolean_id: false,
            string_id: mockData.string_id
        }));
    });

    describe("integer handling", () => {

        it("should make non-numeric types ints", () => {
            const tool    = makeToolWithInputs([{id: "a", type: "int"}]);
            const adapted = makeMapper("a", tool);

            // Convertibles
            expect(adapted(5.13)).toEqual(5, "Failed to convert float to int");
            expect(adapted("42")).toEqual(42, "Failed to convert a numeric string to int");

            expectAll(adapted, "foo", [], {}, null).toEqual(any(Number));
        });

    });

    describe("float/double handling", () => {
        it("should make non-numeric types floats", () => {
            const tool    = makeToolWithInputs([{id: "a", type: "float"}]);
            const adapted = makeMapper("a", tool);

            expect(adapted(5.13)).toEqual(5.13, "Failed to preserve float as-is");
            expect(adapted("42.15")).toEqual(42.15, "Failed to convert a numeric string to float");
            expectAll(adapted, "foo", [], {}, null).toEqual(any(Number));
        })
    });

    describe("boolean", () => {

        let tool, parse;
        beforeEach(() => {
            tool  = makeToolWithInputs([{id: "a", type: "boolean"}]);
            parse = makeMapper("a", tool);
        });

        it("should preserve only pure booleans", () => {
            expect(parse(true)).toBe(true);
            expect(parse(false)).toBe(false);
        });

        it("should make booleans from other type", () => {
            expectAll(parse, "foo", [], {}, null, undefined).toBe(true);
        });
    });

    it("should adapt strings", () => {
        const tool  = makeToolWithInputs([{id: "foo", type: "string"}]);
        const parse = makeMapper("foo", tool);

        expect(parse("something")).toEqual("something");
        expectAll(parse, 13, [], {}, null, undefined).toEqual(any(String));
    });

    describe("files", () => {
        let tool, adapted;
        beforeEach(() => {
            tool    = makeToolWithInputs([{id: "foo", type: "File"}]);
            adapted = makeMapper("foo", tool);
        });

        it("should keep a valid file shape", () => {
            const minimal = {class: "File", path: "hello world"};
            expect(adapted(minimal)).toBe(minimal);
        });

        it("should regenerate file type without a path", () => {
            expect(adapted({class: "File"}).path).toEqual(any(String));
            expect(adapted({class: "File", path: ""}).path.length).toBeGreaterThan(0);
        });

        it("should not accept a directory", () => {
            expect(adapted({class: "Directory"})).toEqual(objectContaining({class: "File"}));
        });

        it("should convert other types", () => {
            expectAll(adapted, {class: "Directory"}, "foo", 1, true, [], undefined, null).toEqual(objectContaining({class: "File"}));
        });
    });

    describe("directories", () => {
        let tool, adapted;
        beforeEach(() => {
            tool    = makeToolWithInputs([{id: "foo", type: "Directory"}]);
            adapted = makeMapper("foo", tool);
        });

        it("should keep a valid directory shape", () => {
            const minimal = {class: "Directory", path: "hello world"};
            expect(adapted(minimal)).toBe(minimal);
        });

        it("should regenerate directory type without a path", () => {
            expect(adapted({class: "Directory"}).path).toEqual(any(String));
            expect(adapted({class: "Directory", path: ""}).path.length).toBeGreaterThan(0);
        });

        it("should not accept a file", () => {
            expect(adapted({class: "File"})).toEqual(objectContaining({class: "Directory"}));
        });

        it("should convert other types", () => {
            expectAll(adapted, {class: "File"}, "foo", 1, true, [], undefined, null).toEqual(objectContaining({class: "Directory"}));
        });
    });

    describe("arrays", () => {

        it("should regenerate non-array types", () => {
            const tool    = makeToolWithInputs([{id: "foo", type: "string[]"}]);
            const adapted = makeMapper("foo", tool);
            expectAll(adapted, 10, "nein", {}, false, null, undefined).toEqual(any(Array));
        });

        describe("individual non-conforming value regeneration", () => {

            it("should regenerate strings", () => {
                const tool    = makeToolWithInputs([{id: "foo", type: "string[]"}]);
                const adapted = makeMapper("foo", tool);
                const val     = ["foo", 1, "bar", {}, true];
                expect(adapted(val)).toEqual(["foo", any(String), "bar", any(String), any(String)]);
            });

            it("should regenerate numbers", () => {
                const tool    = makeToolWithInputs([{id: "foo", type: "int[]"}]);
                const adapted = makeMapper("foo", tool);
                const val     = ["foo", 1, {}, true];
                expect(adapted(val)).toEqual([any(Number), 1, any(Number), any(Number)]);
            });

            it("should regenerate files", () => {
                const tool    = makeToolWithInputs([{id: "foo", type: "File[]"}]);
                const adapted = makeMapper("foo", tool);

                const val = [
                    "foo", 3, {}, [], true,
                    {class: "File"},
                    {class: "Directory", path: "./"},
                    {class: "File", path: "preserved-file-path", size: 2000},
                ];

                const fileStructure = {class: "File"};

                expect(adapted(val)).toEqual([
                    objectContaining(fileStructure),
                    objectContaining(fileStructure),
                    objectContaining(fileStructure),
                    objectContaining(fileStructure),
                    objectContaining(fileStructure),
                    objectContaining(fileStructure),
                    objectContaining(fileStructure),
                    objectContaining({class: "File", path: "preserved-file-path", size: 2000}),
                ]);
            });

            it("should regenerate directories", () => {
                const tool    = makeToolWithInputs([{id: "foo", type: "Directory[]"}]);
                const adapted = makeMapper("foo", tool);

                const val = [
                    "foo", 3, {}, [], true,
                    {class: "Directory"},
                    {class: "File", path: "./myFile.txt"},
                    {class: "Directory", path: "preserved-directory-path", size: 2000},
                ];

                const dirStructure = {class: "Directory"};

                expect(adapted(val)).toEqual([
                    objectContaining(dirStructure),
                    objectContaining(dirStructure),
                    objectContaining(dirStructure),
                    objectContaining(dirStructure),
                    objectContaining(dirStructure),
                    objectContaining(dirStructure),
                    objectContaining(dirStructure),
                    objectContaining({class: "Directory", path: "preserved-directory-path", size: 2000}),
                ]);
            });

            it("should regenerate enums", () => {
                const symbols = ["foo", "bar"];
                const tool    = makeToolWithInputs([{
                    id: "alpha", type: {
                        type: "array",
                        items: {type: "enum", symbols}
                    },
                }]);

                const parse = makeMapper("alpha", tool);

                expect(parse(["foo", "bar", "baz", null])).toEqual(["foo", "bar", "foo", "foo"]);
            });
        });

    });

    describe("enums", () => {

        let tool, parse;
        beforeEach(() => {
            tool  = makeToolWithInputs([{id: "alpha", type: {type: "enum", symbols: ["foo", "bar"]}}]);
            parse = makeMapper("alpha", tool);
        });

        it("should keep a valid symbol", () => {
            expect(parse("bar")).toEqual("bar");
            expect(parse("foo")).toEqual("foo");
            expect(parse(null)).toEqual("foo");
        });

        it("should replace invalid symbols", () => {
            expect(parse("moo")).toEqual("foo");
        });
    });

    describe("maps", () => {
        let tool, parse;
        beforeEach(() => {
            tool  = makeToolWithInputs([{id: "alpha", type: "map"}]);
            parse = makeMapper("alpha", tool);
        });

        it("should work valid map structures", () => {
            const empty = {};
            expect(parse(empty)).toEqual(empty);

            const standardMap = {foo: "bar", baz: "15"};
            expect(parse(standardMap)).toEqual(objectContaining(standardMap));
        });

        it("should convert non-maps to maps", () => {
            expectAll(parse, 15, "str", [], false).toEqual(any(Object));
        });

        it("should serialize non-literal map values", () => {
            const nonLiteral = {
                arr: ["one", "two"],
                obj: {one: 2}
            };
            expect(parse(nonLiteral)).toEqual(objectContaining({
                arr: "one,two",
                obj: `{"one":2}`
            }));
        });
    });

    describe("records", () => {

        it("should work in ideal case", () => {
            const tool  = makeToolWithInputs([{
                id: "rec",
                type: {
                    type: "record",
                    fields: [
                        {name: "fl", type: "File"},
                        {name: "str", type: "string"},
                        {name: "arr", type: "int[]"},
                        {name: "en", type: {type: "enum", symbols: ["foo", "bar"]}}
                    ]
                }
            }]);
            const parse = makeMapper("rec", tool);

            const goodRecord = {
                fl: {class: "File", path: "./fl.txt"},
                arr: [4, 12],
                str: "hello",
                en: "bar"
            };

            expect(parse(goodRecord)).toEqual(objectContaining(goodRecord));
        });

        it("should regenerate if not an object", () => {
            const tool  = makeToolWithInputs([{
                id: "rec",
                type: {type: "record", fields: [{name: "fl", type: "File"}]}
            }]);
            const parse = makeMapper("rec", tool);

            expect(parse("hello").fl).toEqual(objectContaining({class: "File"}));
        });

        it("should remove keys that don't exist in record", () => {
            const tool   = makeToolWithInputs([{
                id: "rec",
                type: {
                    type: "record", fields: [
                        {name: "alpha", type: "string"},
                        {name: "beta", type: "int"},
                    ]
                }
            }]);
            const parse  = makeMapper("rec", tool);
            const parsed = parse({alpha: "a", gamma: 12, beta: 3, delta: 100});

            expect(parsed).not.toEqual(objectContaining({gamma: 12, delta: 100}));
            expect(parsed).toEqual(objectContaining({alpha: "a", beta: 3}));
        });

        it("should replace non-conforming keys", () => {
            const tool  = makeToolWithInputs([{
                id: "rec", type: {
                    type: "record", fields: [
                        {name: "alpha", type: "string"},
                        {name: "beta", type: "int"},
                    ]
                }
            }]);
            const parse = makeMapper("rec", tool);

            expect(parse({
                alpha: "str",
                beta: "str"
            })).toEqual(objectContaining({
                alpha: any(String),
                beta: any(Number)
            }));
        });

        describe("adapting nested structure", () => {
            it("int[]", () => {
                const tool   = makeToolWithInputs([{
                    id: "rec", type: {
                        type: "record", fields: [{
                            name: "intArr", type: "int[]"
                        }]
                    }
                }]);
                const parse  = makeMapper("rec", tool);
                const parsed = parse({intArr: [2, 1, true, "foo", {}]});
                expect(parsed.intArr).toEqual([2, 1, any(Number), any(Number), any(Number)])
            });

            it("enum[]", () => {
                const tool = makeToolWithInputs([{
                    id: "rec", type: {
                        type: "record", fields: [{
                            name: "enumArr", type: {
                                type: "array",
                                items: {
                                    type: "enum",
                                    symbols: ["foo", "bar", "baz"]
                                }
                            }
                        }]
                    }
                }]);

                const parse = makeMapper("rec", tool);
                expect(parse({enumArr: ["foo", "baz", "baz", "bar"]}).enumArr).toEqual(["foo", "baz", "baz", "bar"]);
                expect(parse({enumArr: ["moo", "yay"]}).enumArr).toEqual(["foo", "foo"]);
                expect(parse({enumArr: ["foo", "moo", "bar", "yar"]}).enumArr).toEqual(["foo", "foo", "bar", "foo"]);

            });

            it("enum[]", () => {
                const tool = makeToolWithInputs([{
                    id: "rec", type: {
                        type: "record", fields: [{
                            name: "enumArr", type: {
                                type: "array",
                                items: {
                                    type: "enum",
                                    symbols: ["foo", "bar", "baz"]
                                }
                            }
                        }]
                    }
                }]);

                const parse = makeMapper("rec", tool);
                expect(parse({enumArr: ["foo", "baz", "baz", "bar"]}).enumArr).toEqual(["foo", "baz", "baz", "bar"]);
                expect(parse({enumArr: ["moo", "yay"]}).enumArr).toEqual(["foo", "foo"]);
                expect(parse({enumArr: ["foo", "moo", "bar", "yar"]}).enumArr).toEqual(["foo", "foo", "bar", "foo"]);

            });

            it("record[]", () => {
                const tool = makeToolWithInputs([{
                    id: "rec", type: {
                        type: "record", fields: [{
                            name: "nestedRecord", type: {
                                type: "array",
                                items: {
                                    type: "record",
                                    fields: [{
                                        name: "file",
                                        type: "File"
                                    }, {
                                        name: "bool",
                                        type: "boolean"
                                    }, {
                                        name: "enum",
                                        type: {type: "enum", symbols: ["foo", "bar"]}
                                    }]
                                }
                            }
                        }]
                    }
                }]);

                const parse = makeMapper("rec", tool);
                expect(parse({
                    nestedRecord: [
                        "invalid",
                        {file: {class: "File", path: "preserved"}, bool: false, enum: "moo"},
                        {file: {class: "File", path: "preserved-2"}, bool: 123, enum: "bar"},
                        [],
                        {file: {class: "File"}}
                    ]
                }).nestedRecord).toEqual([
                    objectContaining({
                        file: objectContaining({class: "File", path: any(String)}),
                        bool: any(Boolean),
                        enum: "foo"
                    }),
                    objectContaining({
                        file: objectContaining({class: "File", path: "preserved"}),
                        bool: false,
                        enum: "foo"
                    }),
                    objectContaining({
                        file: objectContaining({class: "File", path: "preserved-2"}),
                        bool: any(Boolean),
                        enum: "bar"
                    }),
                    objectContaining({
                        file: objectContaining({class: "File", path: any(String)}),
                        bool: any(Boolean),
                        enum: "foo"
                    }),
                    objectContaining({
                        file: objectContaining({class: "File", path: any(String)}),
                        bool: any(Boolean),
                        enum: "foo"
                    }),
                ]);

            });
        });

    });
});

/**
 * Utility function for checking if multiple values, when adapted, are equal or same as one given value.
 * @example expectAll(val => Boolean(val), 1, "str", [], {} ).toBe(true)
 */
function expectAll(mappedBy: Function, ...values: any[]): {
    toBe: (value: any) => void,
    toEqual: (value: any) => void
} {
    // Make an object with "toBe" and "toEqual" methods which evaluate appropriate jasmine methods on collection items
    return ["toBe", "toEqual"].reduce((acc, fnName) => {
        return Object.assign(acc, {
            [fnName]: (result: any) => values.forEach(v => expect(mappedBy(v))[fnName](result))
        });
    }, {}) as any;
}

function makeMapper(inputID, tool): (value: any) => any {
    return (value: any) => {
        return fixJob({[inputID]: value}, tool)[inputID];
    }
}

function makeToolWithInputs(inputs: CommandInputParameter[]): CommandLineToolModel {
    return new V1CommandLineToolModel({
        class: "CommandLineTool",
        outputs: [],
        inputs,
    });
}
