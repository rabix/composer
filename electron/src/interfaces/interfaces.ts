import {AppMetaEntry} from "../storage/types/app-meta";

export type AppMetaPatcher = (data: {
    profile: "local" | "user",
    appID: string,
    key: keyof AppMetaEntry,
    value: any,
}, callback) => void;

export interface ElectronRoutes {
    patchAppMeta: AppMetaPatcher,
    watchLocalRepository: LocalRepositoryWatcher,
    watchUserRepository: UserRepositoryWatcher
}

export type RepositoryWatcher = (data: { key: string }, callback: Function) => void;
export type LocalRepositoryWatcher = RepositoryWatcher;
export type UserRepositoryWatcher = RepositoryWatcher;
