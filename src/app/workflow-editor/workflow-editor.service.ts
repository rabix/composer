import {Injectable} from "@angular/core";
import {WorkflowModel} from "cwlts/models";

@Injectable()
export class WorkflowEditorService {

    private history = [];
    private future  = [];

    putInHistory(model: WorkflowModel) {
        if (this.history.length > 20) {
            this.history.shift();
        }

        this.history.push(model.serializeEmbedded(true));
        this.future.length = 0;
    }

    historyUndo(model: WorkflowModel) {
        this.future.push(model.serializeEmbedded(true));
        return this.history.pop();
    }

    historyRedo(model: WorkflowModel) {
        this.history.push(model.serializeEmbedded(true));
        return this.future.pop();
    }

    canUndo() {
        return this.history.length > 0;
    }

    canRedo() {
        return this.future.length > 0;
    }

    emptyHistory() {
        this.history.length = 0;
        this.future.length  = 0;
    }
}
