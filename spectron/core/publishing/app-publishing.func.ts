import * as spectron from "spectron";
import {boot, shutdown} from "../../util/util";

describe("app publishing", () => {
    let app: spectron.Application;

    afterEach(() => shutdown(app));

    it("opens newly published app in a new tab", function () {

        boot(this, {
            localRepository: {

            }
        })
    });
});

