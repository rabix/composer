import {LayoutService} from "./layout.service"

describe("LayoutService", () => {
    let layoutService: LayoutService;

    beforeEach(() => {
        layoutService = new LayoutService(null);
    })

    it("should change sidebarHidden value on toggleSidebar call", () => {
        expect(layoutService.sidebarHidden).toBe(false);
        layoutService.toggleSidebar();
        expect(layoutService.sidebarHidden).toBe(true);
    });
});
