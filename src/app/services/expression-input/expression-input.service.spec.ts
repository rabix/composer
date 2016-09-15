import {it, describe} from "@angular/core/testing";
import {ExpressionInputService} from "./expression-input.service";

describe("ExpressionInputService", () => {

    describe("setExpression", () => {
        
        it("should update the expression stream", (done) => {
            const expressionInputService = new ExpressionInputService();

            expressionInputService.setExpression("123 + 123");
            
            expressionInputService.expression.subscribe(expression => {
                expect(expression).toBe("123 + 123");
                done();
            });
        });

    });
});
