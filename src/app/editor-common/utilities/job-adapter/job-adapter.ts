import {CommandLineToolModel} from "cwlts/models";
import {JobHelper} from "cwlts/models/helpers/JobHelper";
import {File, Directory} from "cwlts/mappings/v1.0";
import {InputParameterModel} from "cwlts/models/generic/InputParameterModel";

/**
 * Traverses a given job object and ensures that all data in it is valid for a given model.
 * Valid data will be preserved through the whole tree, invalid data will be replaced with mock entries.
 */
export function fixJob(jobValue = {}, model: CommandLineToolModel): { [inputID: string]: any } {
    const mockData = JobHelper.getJobInputs(model);
    const adapted  = {};

    Object.keys(mockData).forEach(inputID => {
        const input = model.inputs.find(i => i.id === inputID);

        if (!jobValue.hasOwnProperty(inputID)) {
            adapted[inputID] = mockData[inputID];
            return;
        }

        adapted[inputID] = ensureValueType(
            jobValue[inputID],
            mockData[inputID],
            input.type.type,
            input.type.items,
            input.type.symbols,
            input.type.fields
        );
    });

    return adapted;
}

function makeMockValue(inputID: string, type: string, arrayItemsType: string, recordFields?: InputParameterModel[], enumSymbols?: string[]) {
    return JobHelper.generateMockJobData({
        id: inputID,
        type: {
            type: type,
            items: arrayItemsType,
            fields: recordFields,
            symbols: enumSymbols
        }
    } as InputParameterModel);
}

function ensureValueType(value: any, fallback: any, type: string, arrayItemsType: string, enumSymbols: string[], recordFields?: InputParameterModel[], inputID?: string) {
    switch (type) {
        case "long":
        case "float":
        case "double":
            return maybeMakeFloat(value) || fallback;
        case "int":
            return maybeMakeInt(value) || fallback;
        case "boolean":
            return typeof value === "boolean" ? value : fallback;
        case "string":
            return typeof value === "string" ? value : fallback;
        case "File":
            return maybeMakeFile(value) || fallback;
        case "Directory":
            return maybeMakeDirectory(value) || fallback;
        case "array":
            if (!Array.isArray(value)) {
                return fallback;
            }

            const mock = makeMockValue(inputID, arrayItemsType, null, recordFields, enumSymbols);
            return value.map(v => ensureValueType(v, mock, arrayItemsType, null, enumSymbols, recordFields));
        case "enum":
            if (enumSymbols && ~enumSymbols.indexOf(value)) {
                return value;
            }
            return fallback;
        case "map":

            if (!Object.prototype.isPrototypeOf(value)) {
                return fallback;
            }
            try {
                return Object.keys(value).reduce((acc, key) => {
                    const kv = value[key];

                    let stringified = String(kv);
                    if (Object.prototype.isPrototypeOf(kv) && !Array.isArray(kv)) {
                        stringified = JSON.stringify(kv);
                    }

                    return {...acc, [key]: stringified};
                }, {});
            } catch (ex) {
                return fallback;

            }
        case "record":
            if (!Object.prototype.isPrototypeOf(value) || Array.isArray(value)) {
                return fallback;
            }

            return recordFields.reduce((acc, recordField) => {

                const mock = makeMockValue(
                    recordField.id,
                    recordField.type.type,
                    recordField.type.items,
                    recordField.type.fields,
                    recordField.type.symbols
                );

                return Object.assign(acc, {
                    [recordField.id]: ensureValueType(
                        value[recordField.id],
                        mock,
                        recordField.type.type,
                        recordField.type.items,
                        recordField.type.symbols,
                        recordField.type.fields,
                        recordField.id
                    )
                });
            }, {});

        default:
            return fallback;
    }
}

function maybeMakeInt(val: any): number | undefined {
    const maybeInt = parseInt(val);

    if (!isNaN(maybeInt)) {
        return maybeInt;
    }
}

function maybeMakeFloat(val: any): number | undefined {
    const maybeFloat = parseFloat(val);
    if (!isNaN(maybeFloat)) {
        return maybeFloat;
    }
}

function maybeMakeFile(val: any): File | void {
    if (!val || !Object.prototype.isPrototypeOf(val)) {
        return;
    }
    if (val.class === "File" && typeof val.path === "string" && val.path.length > 0) {
        return val;
    }
}

function maybeMakeDirectory(val: any): Directory | void {
    if (!val || !Object.prototype.isPrototypeOf(val)) {
        return;
    }
    if (val.class === "Directory" && typeof val.path === "string" && val.path.length > 0) {
        return val;
    }
}
