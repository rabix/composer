import {SBGClient} from "../../electron/src/sbg-api-client/sbg-client";

export function mockSBGClient(methods: Partial<SBGClient> = {}) {

    let methodInjection = "";

    for (let name in methods) {

        methodInjection += `
            MockSBGClient.prototype.${name} = ${methods[name].toString()};
        `
    }

    // language=JavaScript 1.8
    return `(function () {
        const client = require("./sbg-api-client/sbg-client").SBGClient;

        function MockSBGClient() {
        }

        MockSBGClient.prototype = new client();
        
        ${methodInjection}

        return MockSBGClient;
    })()`
}
