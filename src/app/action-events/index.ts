import {FileModel} from "../store/models/fs.models";
import {CwlFileTemplate} from "../types/file-template.type";

export class EventHubAction {
    public type: string;
    public payload: any;

    constructor(type: string, payload: any) {
        this.type    = type;
        this.payload = payload;
    }
}

export class OpenFileRequestAction extends EventHubAction {
    constructor(file: FileModel) {
        super("open_file_request", file);
    }
}

export class FetchFileRequestAction extends EventHubAction {
    constructor(file: FileModel) {
        super("fetch_file_request", file);
    }
}

export class SelectFileAction extends EventHubAction {
    constructor(file: FileModel) {
        super("select_file", file);
    }
}

export class CloseFileAction extends EventHubAction {
    constructor(file: FileModel) {
        super("close_file", file);
    }
}

export class UpdateFileAction extends EventHubAction {
    constructor(file: FileModel) {
        super("update_file", file);
    }
}

export class CreateFileRequestAction extends EventHubAction {
    constructor(options: {path: string, content?: string, template?: CwlFileTemplate}) {
        super("create_file_request", options);
    }
}

export class CopyFileRequestAction extends EventHubAction {
    constructor(source: string, destination: string) {
        super("copy_file_request", {source, destination});
    }
}

export class FileCreatedAction extends EventHubAction {
    constructor(file: FileModel) {
        super("file_created", file);
    }
}

export class SaveFileRequestAction extends EventHubAction {
    constructor(file: FileModel) {
        super("save_file_request", file);
    }
}

export class CreateFileResponse extends EventHubAction {
    constructor(file: FileModel) {
        super("create_file_response", file);
    }
}

export class ApiError extends EventHubAction {
    constructor(error: any) {
        super("api_error", error);
    }
}
