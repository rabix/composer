import {DataRepository} from "../data-repository";

export interface RepositoryHook {
    afterLoad?: (repository: DataRepository) => void | Promise<any>;
}
