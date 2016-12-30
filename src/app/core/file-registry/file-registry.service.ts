import {Subject} from "rxjs";
import {Injectable, Inject} from "@angular/core";
import {FILE_RESOLVERS, FSEntrySource} from "./types";
import {FileResolver} from "./resolvers/file-resolver";

@Injectable()
export class FileRegistryService {

    constructor(@Inject(FILE_RESOLVERS) private resolvers: FileResolver[]){
    }

    public resolve<T>(path: string): Subject<FSEntrySource>{
        const resolver = this.resolvers.find(r => r.canResolve(path));

        if(!resolver){
            throw new Error("There's not resolver that can resolve this URL.");
        }

        return resolver.resolve<T>(path);
    }

}
