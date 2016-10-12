import {Observable} from "rxjs";
export interface TabData<T> {
    id: string,
    title: Observable<string>;
    contentType: Observable<"CommandLineTool" | "Workflow" | "Settings" | "Code">,
    contentData?: T
}