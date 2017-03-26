import {Injectable} from "@angular/core";

const templates = {
    "draft-2-workflow": require("../templates/draft-2-workflow.json"),
    "draft-2-command-line-tool": require("../templates/draft-2-command-line-tool.json")
};

type TemplateType = "draft-2-workflow" | "draft-2-command-line-tool" | string;

@Injectable()
export class TemplateProviderService {

    public compile(templateName: TemplateType, data = {}) {
        if (!templates[templateName]) {
            return "";
        }
        // console.debug("Compiling template", templateName);
        let str = JSON.stringify(templates[templateName] || "", null, 4);

        Object.keys(data).forEach(key => {
            str = str.replace(`{{ ${key} }}`, data[key]);
        });

        return str;
    }
}
