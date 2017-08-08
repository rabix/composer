export interface Project {

    /** ID of the project in the {username}/{project-name} format */
    id?: string;

    /** Resource URI */
    href?: string;

    /** Project name */
    name?: string;

    /** Project Description */
    description?: string;

    billing_group?: string;

    /** Project Permissions */
    permissions: {
        admin: boolean,
        copy: boolean,
        execute: boolean,
        read: boolean,
        write: boolean
    };

    settings: {
        locked: boolean;
    }

    tags: any[]

    type: "v1" | "v2" | "string";

}
