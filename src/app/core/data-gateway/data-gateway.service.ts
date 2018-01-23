import {Injectable} from "@angular/core";
import * as YAML from "js-yaml";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {noop} from "../../lib/utils.lib";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {IpcService} from "../../services/ipc.service";
import {AppHelper} from "../helpers/AppHelper";

@Injectable()
export class DataGatewayService {

    cacheInvalidation = new Subject<string>();

    /**
     * @depreceated Can check AppHelper.isLocal directly
     * @param id
     * @returns {"local" | "app"}
     */
    static getFileSource(id): "local" | "app" {

        return AppHelper.isLocal(id) ? "local" : "app";
    }


    constructor(private ipc: IpcService) {
    }

    checkIfPathExists(path) {
        return this.ipc.request("pathExists", path);
    }

    createLocalFolder(folderPath) {
        return this.ipc.request("createDirectory", folderPath);
    }

    searchLocalProjects(term, limit = 20): Promise<{
        type: "Workflow" | "CommandLineTool" | string;
        path: string;
        name: string;
        isReadable: boolean;
        isWritable: boolean;
        isDir: boolean;
        isFile: boolean;
        dirname: string;
        language: "cwl" | "json" | "yaml" | string;
        relevance: number;
    }[]> {

        return this.ipc.request("searchLocalProjects", {term, limit,}).toPromise();
    }

    fetchFileContent(almostID: string, parse = false): Observable<string> {

        const source = DataGatewayService.getFileSource(almostID);

        if (source === "local") {

            const fetch = Observable.empty().concat(this.ipc.request("getLocalFileContent", almostID)) as Observable<string>;

            if (parse) {
                return fetch
                    .map(content => {
                        try {
                            return YAML.safeLoad(content, {json: true, onWarning: noop} as any);
                        } catch (err) {
                            return new Error(err);
                        }
                    });
            }

            return fetch;
        }

        if (source === "app" || source === "public") {

            const fetch = Observable.empty().concat(this.ipc.request("getPlatformApp", {
                id: almostID
            }));

            if (parse) {
                return fetch.map(content => JSON.parse(content));
            }
            return fetch;
        }
    }

    resolveContent(content, path): Observable<Object | any> {
        if (AppHelper.isLocal(path)) {
            return this.ipc.request("resolveContent", ({content, path})).take(1);
        }

        return Observable.of(content).map(txt => YAML.safeLoad(txt, {json: true} as any));
    }


    /**
     * @deprecated use FileRepository.saveFile
     */
    saveLocalFileContent(path, content) {
        return this.ipc.request("saveFileContent", {path, content});
    }

    /**
     * @deprecated use FileRepository.saveFile
     */
    saveFile(fileID, content): Observable<string> {
        return this.saveLocalFileContent(fileID, content).map(() => content);
    }

    /**
     *
     * @param url
     * @param token
     */
    getUserWithToken(url, token): Observable<any> {
        return this.ipc.request("getUserByToken", {url, token});
    }

    sendFeedbackToPlatform(type: string, text: string): Promise<any> {
        return this.ipc.request("sendFeedback", {type, text}).toPromise();
    }


}
