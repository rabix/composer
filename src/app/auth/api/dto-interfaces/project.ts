export interface Project {

    current_user_membership_status: "FULL" | string;
    owner_id: string;
    created_on: number;
    project_type: "PRIVATE" | "PUBLIC" | string;
    owner: string;
    slug: string;
    org_owned: boolean;
    owner_canonical: string;
    created_by_username: string;
    description: string;
    id: string;
    tags: string[];
    current_user_membership_request: any;
    state: "READY" | string;
    created_by: string;
    membership: {
        execute: boolean;
        admin: boolean;
        write: boolean;
        read: boolean;
        copy: boolean
    };
    current_user_joined_on: number;
    name: string;
    is_rabix: boolean;
}
