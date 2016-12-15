import {SandboxService, SandboxResponse} from "./sandbox.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import * as jailed from "jailed";

describe("SandboxService", () => {
    const sandboxService = new SandboxService();

    class FakePlugin {
        public whenConnected() { }
        public disconnect() { }
    }

    describe("runHidden", () => {

        it("should prevent the worker scope from being accessed", () => {

            expect(() => {
                sandboxService.runHidden("console.log(123)");
            }).toThrowError(TypeError, "undefined is not an object (evaluating 'console.log')");

            expect(() => {
                sandboxService.runHidden("application.remote");
            }).toThrowError(TypeError, "undefined is not an object (evaluating 'application.remote')");

        });
    });


    describe("submit", () => {

        it("should update the expressionResult with the result of the expression", done => {

            let updateExpressionResult: BehaviorSubject<SandboxResponse> = new BehaviorSubject<SandboxResponse>(undefined);

            spyOn(sandboxService, "initializeEngine").and.callFake(code => code);
            spyOn(jailed, "DynamicPlugin").and.callFake(expressionCode => {
                const mockResult = eval(expressionCode);

                //output() needs to be called after the class has returned
                setTimeout(() => {
                    jailedApi.output({
                        output: mockResult,
                        error: undefined
                    });
                }, 0);

                return new FakePlugin();
            });

            sandboxService.submit(1 + 2)
                .subscribe((result: SandboxResponse) => {
                    expect(result).toEqual({ output: '3', error: undefined });
                    done();
                });

        });
    });

});

