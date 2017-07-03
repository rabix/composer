export interface QueryParams {
    fields?: string;
}

export interface AppQueryParams extends QueryParams {
    id?: string | string[];
    project?: string;
    project_owner?: string;
    visibility?: string;
}
