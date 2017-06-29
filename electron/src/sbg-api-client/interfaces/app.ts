import {RawApp} from "./raw-app";

export interface App {
    id: string;
    href: string;
    project: string;
    name: string;
    revision: number;
    raw?: RawApp;
}
