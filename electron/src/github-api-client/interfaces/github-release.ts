export interface GitHubRelease {

    url: string;

    html_url: string;

    id: string;

    tag_name: string;

    target_commitish: string;

    name: string;

    author: any;

    prerelease: boolean;

    created_at: string;

    published_at: string;

    body: string;

}
