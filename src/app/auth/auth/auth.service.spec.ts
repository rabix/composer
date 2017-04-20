import {AuthService} from "./auth.service";
describe("AuthModule", () => {
    describe("AuthService", () => {
        it("should translate urls to profile strings based on subdomain", () => {
            const conv = AuthService.urlToProfile;

            expect(conv("https://igor.sbgenomics.com")).toBe("default", "Main platform URL is not converted to a 'default' profile");
            expect(conv("https://cwl-vayu.sbgenomics.com")).toBe("cwl-vayu", "Vayu URL is not converted to a 'default' profile");
            expect(conv("https://staging.sbgenomics.com")).toBe("staging", "Staging is not converted to a 'default' profile");
            expect(() => {
                conv("http://somewebsite.com")
            }).toThrow();
            expect(() => {
                conv("not even an url")
            }).toThrow();
        });
    });
});
