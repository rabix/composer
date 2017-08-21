import {Project} from "../../electron/src/sbg-api-client/interfaces/project";
import {User} from "../../electron/src/sbg-api-client/interfaces/user";
import {AuthCredentials} from "../../src/app/auth/model/auth-credentials";
import {Guid} from "../../src/app/services/guid.service";

export function generateToken(): string {
    return Guid.generate().replace(/-/g, "")
}

export function generateAuthCredentials(username: string, platformURL: string): AuthCredentials {
    const token      = generateToken();
    const user: User = generateUser({username});
    return new AuthCredentials(platformURL, token, user);
}

export function generateUser(data: Partial<User> = {}): User {
    return Object.assign({
        username: "generated_username",
        first_name: "Generated First Name",
        last_name: "Generated Last Name",
        state: "",
        address: "",
        affiliation: "",
        city: "",
        email: "",
        href: "",
        phone: "",
        tags: [],
        zip_code: "",
        country: ""

    }, data);
}

export function generatePlatformProject(data: Partial<Project> = {}): Project {
    return Object.assign({
        id: "test-user/test-project",
        type: "v2",
        tags: [],
        href: "",
        description: "Test Project Description",
        name: "Test Project",
        billing_group: null,
        permissions: {
            write: true,
            execute: true,
            admin: true,
            copy: true,
            read: true
        },
        settings: null
    } as Project, data);
}
