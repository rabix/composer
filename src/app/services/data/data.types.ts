const SOCKET_REQUESTS = {
    "DIR_CONTENT": "getDirContents",
    "FILES_IN_WORKSPACE": "getFilesInWorkspace",
    "FILE_CONTENT": "getFile",
    "CREATE_FILE": "createFile",
    "UPDATE_FILE": "updateFile",
    "FILE_EXISTS": "fileExists"
};

/**
 * All request types that the backend must handle
 */
export type DataRequestType = string
    | "CREATE_FILE"
    | "DIR_CONTENT"
    | "FILE_CONTENT"
    | "FILE_EXISTS"
    | "FILES_IN_WORKSPACE"
    | "UPDATE_FILE";

export const SOCKET_EVENTS = [];


export class DataResponse {
    constructor(private responseData: any,
                private request?: DataRequest) {
    }
}

export class DataRequest {
    constructor(private type: DataRequestType,
                private data: any) {
    }

    public getMethodName() {
        return SOCKET_REQUESTS[this.type];
    }

    public getType() {
        return this.type;
    }

    public getData() {
        return this.data;
    }
}




