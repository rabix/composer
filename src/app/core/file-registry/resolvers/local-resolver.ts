import {FileResolver} from "./file-resolver";
import {Subject} from "rxjs";
import {FSEntrySource} from "../types";
import {Injectable} from "@angular/core";
import {IpcService} from "../../../services/ipc.service";

@Injectable()
export class LocalResolverService implements FileResolver {

    constructor(private ipc: IpcService){
    }

    canResolve(path: string): boolean {
        return path.startsWith("/");
    }

    public fetch<T>(path: string): Promise<FSEntrySource<T>> {
        return new Promise((resolve, reject) => {
            this.ipc.request()
        });
    }

}
