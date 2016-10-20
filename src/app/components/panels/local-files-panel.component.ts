import {Component, ChangeDetectorRef, ChangeDetectionStrategy, Input} from "@angular/core";
import {TreeViewComponent} from "../tree-view";
import {PanelToolbarComponent} from "./panel-toolbar.component";
import {LocalDataSourceService} from "../../sources/local/local.source.service";
import {Observable, BehaviorSubject} from "rxjs";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {OpenTabAction} from "../../action-events";
import {IpcService} from "../../services/ipc.service";

@Component({
    selector: "ct-local-files-panel",
    directives: [TreeViewComponent, PanelToolbarComponent],
    providers: [LocalDataSourceService, IpcService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {class: "block"},
    template: `
        <ct-panel-toolbar>
            <span class="tc-name">Local Files</span>
        </ct-panel-toolbar>
        <div *ngIf="isLoading">
             <div class="text-xs-center"><small>Listing Local Files…</small></div>
            <progress class="progress progress-striped progress-animated" value="100" max="100"></progress>
        </div>
        <ct-tree-view [nodes]="nodes | async"></ct-tree-view>
    `
})
export class LocalFilesPanelComponent {

    @Input()
    private nodes = new BehaviorSubject([]);

    private isLoading = true;

    constructor(private fs: LocalDataSourceService,
                private detector: ChangeDetectorRef,
                private ipc: IpcService,
                private eventHub: EventHubService) {


        this.recursivelyMapChildrenToNodes(() => this.fs.load())().subscribe(nodes => {
            this.isLoading = false;
            this.nodes.next(nodes);
            this.detector.detectChanges();
        }, err => {
            this.isLoading = false;
            this.detector.detectChanges();
        });

    }

    private recursivelyMapChildrenToNodes(childrenProvider) {
        if (!childrenProvider) {
            return undefined;
        }

        return () => childrenProvider().flatMap(Observable.from).map(item => {
            return {
                name: item.name,
                icon: item.isDir ? "folder" : (item.type || "file"),
                isExpandable: item.isDir,

                childrenProvider: this.recursivelyMapChildrenToNodes(item.childrenProvider),
                openHandler: () => {
                    this.eventHub.publish(new OpenTabAction({
                        id: item.id,
                        title: Observable.of(item.name),
                        contentType: Observable.of(item.type || "Code"),
                        contentData: {
                            data: item,
                            isWritable: true,
                            content: item.content,
                            language: Observable.of(item.language)
                        }
                    }));
                }
            }
        }).reduce((acc, node) => acc.concat(node), []);
    }
}