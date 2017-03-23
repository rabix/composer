"use strict";
const chai_1 = require("chai");
const proxy = require("proxyquire");
const sinon = require("sinon");
describe("File Controller", () => {
    it("should export a get method", () => {
        chai_1.assert.isFunction(require("./file.controller").get);
    });
    it("should proxy a file read to fs controller if the path is an absolute", () => {
        const spy = sinon.spy();
        const patchedCtrl = proxy("./file.controller", {
            "./fs.controller": {
                readFileContent: spy
            }
        });
        patchedCtrl.get("/hello", (err, info) => {
            chai_1.assert.isTrue(spy.calledOnce, "Spy didn't get called");
            chai_1.assert.equal(spy.args[0][0], "/hello", "Spy called with an incorrect path");
            chai_1.assert.isFunction(spy.args[0][1], "Spy didn't get a callback function");
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5jb250cm9sbGVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvZmlsZS5jb250cm9sbGVyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtCQUE0QjtBQUM1QixvQ0FBb0M7QUFDcEMsK0JBQStCO0FBRS9CLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtJQUV4QixFQUFFLENBQUMsNEJBQTRCLEVBQUU7UUFDN0IsYUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxzRUFBc0UsRUFBRTtRQUV2RSxNQUFNLEdBQUcsR0FBVyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLG1CQUFtQixFQUFFO1lBQzNDLGlCQUFpQixFQUFFO2dCQUNmLGVBQWUsRUFBRSxHQUFHO2FBQ3ZCO1NBQ0osQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSTtZQUNoQyxhQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQUN2RCxhQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLG1DQUFtQyxDQUFDLENBQUM7WUFDNUUsYUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=