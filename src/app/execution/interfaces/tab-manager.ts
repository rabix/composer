import {InjectionToken} from "@angular/core";

export const TabManagerToken = new InjectionToken("execution.tabManager");

interface TabData {
    id: string;
    type: string;
    label?: string;
    isWritable?: boolean;
    language?: string;
}

export interface TabManager {
    getOrCreate(data: TabData): TabData,

    open(tabData: TabData): void;
}
