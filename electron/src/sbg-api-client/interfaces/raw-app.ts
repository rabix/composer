import {RevisionInfo} from "./revision";

export interface RawApp {
    "id": string;
    "label": string;
    "class": string;
    "cwlVersion"?:string;
    "description": string;
    "sbg:categories": string[];
    "sbg:contributors": string[];
    "sbg:copyOf": string;
    "sbg:createdBy": string;
    "sbg:createdOn": number;
    "sbg:id": string;
    "sbg:image_url": string;
    "sbg:latestRevision": number;
    "sbg:modifiedBy": string;
    "sbg:modifiedOn": number;
    "sbg:project": string;
    "sbg:revision": number;
    "sbg:revisionsInfo": RevisionInfo[];
    "sbg:sbgMaintained": boolean;
    "sbg:tagline": string;
    "sbg:toolkit": string;
    "sbg:toolkitVersion": string;
    "sbg:validationErrors": any[];
}
