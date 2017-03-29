import {Injectable} from "@angular/core";
import {WorkflowModel} from "cwlts/models";

@Injectable()
export class WorkflowEditorService {

    private history = [];
    private future = [];

    public putInHistory(model: WorkflowModel) {
        if (this.history.length > 20) {
            this.history.shift();
        }
        this.history.push(model.serialize());
        this.future.length = 0;
    }

    public historyUndo(model: WorkflowModel) {
        this.future.push(model.serialize());
        return this.history.pop();
    }

    public historyRedo(model: WorkflowModel) {
        this.history.push(model.serialize());
        return this.future.pop();
    }

    public canUndo() {
        return this.history.length > 0;
    }

    public canRedo() {
        return this.future.length > 0;
    }
}
