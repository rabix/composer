export interface PlatformAppRevisionEntry {
    "sbg:modifiedBy": string;
    "sbg:modifiedOn": number;
    "sbg:revision": number;
    "sbg:revisionNotes": string;
}

export interface PlatformAppEntry {
    "id": string;
    "label": string;
    "class": string;
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
    "sbg:revisionInfo": PlatformAppRevisionEntry[];
    "sbg:sbgMaintained": boolean;
    "sbg:tagline": string;
    "sbg:toolkit": string;
    "sbg:toolkitVersion": string;
    "sbg:validationErrors": any[];
}

export interface PlatformProjectEntry {
    created_by: string;
    created_by_username: string;
    created_on: number;
    current_user_joined_on: number;
    current_user_membership_request: any;
    current_user_membership_status: string;
    description: string;
    id: string;
    is_rabix: boolean;
    membership: {
        admin: boolean,
        execute: boolean,
        copy: boolean,
        read: boolean,
        write: boolean
    },
    name: string,
    owner_canonical: string;
    project_type: "PRIVATE" | "PUBLIC",
    slug: string;
    state: string;
    tags: Array;
    // Not part of the api response, added on client side
    path: string;
}
