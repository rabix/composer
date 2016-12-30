import {FileResolver} from "./file-resolver";
import {Subject} from "rxjs";
import {FSEntrySource} from "../types";

export class ProjectResolver implements FileResolver {
    canResolve(path: string): boolean {
        return undefined;
    }

    resolve<T>(path: string): Subject<FSEntrySource<T>> {
        return undefined;
    }

}
