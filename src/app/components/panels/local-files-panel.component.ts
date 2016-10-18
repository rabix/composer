import {Component, ChangeDetectorRef, ChangeDetectionStrategy, Input} from "@angular/core";
import {TreeViewComponent} from "../tree-view";
import {PanelToolbarComponent} from "./panel-toolbar.component";
import {LocalDataSourceService} from "../../sources/local/local.source.service";
import {Observable, BehaviorSubject} from "rxjs";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {OpenTabAction} from "../../action-events";

@Component({
    selector: "ct-local-files-panel",
    directives: [TreeViewComponent, PanelToolbarComponent],
    providers: [LocalDataSourceService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {class: "block"},
    template: `
        <ct-panel-toolbar>
            <name>Local Files</name>
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

        return () => childrenProvider().flatMap(Observable.from)
            .map(item => {

                    const mapped = {
                        name: item.name,
                        icon: item.isDir ? "folder": (item.type || "file") ,
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
                    };

                    return mapped;
                }
            )
            .reduce((acc, node) => acc.concat(node), []);
    }

    ngOnInit() {

        const sortingMethod = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());


        // this.fs.load().flatMap(Observable.from as any)
        //     .map(item => ({
        //         name: item.name,
        //         icon: item.isDir ? "folder" : "file",
        //         isExpandable: item.isDir,
        //         childrenProvider: this.recursivelyMapChildrenToNodes(item.childrenProvider),
        //
        //     }))
        //     .reduce((acc, node) => acc.concat(node), [])


        //
        // this.settings.platformConfiguration
        //     .do(_ => this.isLoading = true)
        //     .flatMap(_ => this.platform.getPublicApps().map(apps => {
        //
        //
        //         const categorized = apps.map(app => {
        //             return {
        //                 name: app.label,
        //                 icon: app.class || "file",
        //                 isExpandable: false,
        //                 toolkit: app["sbg:toolkit"],
        //                 openHandler: _ => {
        //                     this.eventHub.publish(new OpenTabAction({
        //                         id: app.id,
        //                         title: Observable.of(app.label),
        //                         contentType: Observable.of(app.class),
        //                         contentData: {
        //                             data: app,
        //                             isWritable: false,
        //                             content: this.platform.getAppCWL(app).switchMap(cwl => new BehaviorSubject(cwl)),
        //                             language: Observable.of("json")
        //                         }
        //                     }));
        //                 }
        //             };
        //
        //         }).reduce((acc, app: PlatformAppEntry) => {
        //             //noinspection TypeScriptUnresolvedVariable
        //             acc[app.toolkit] = [].concat.apply(acc[app.toolkit] || [], [app]);
        //             return acc;
        //         }, {});
        //
        //         const noToolkits = (categorized["undefined"] || []).sort(sortingMethod);
        //         delete categorized["undefined"];
        //
        //
        //         return Object.keys(categorized).map(key => ({
        //             name: key,
        //             icon: "caret",
        //             isExpandable: true,
        //             childrenProvider: _ => Observable.of(categorized[key])
        //         })).sort(sortingMethod).concat(noToolkits.sort(sortingMethod));
        //
        //     })).subscribe(categories => {
        //     this.isLoading = false;
        //     this.nodes     = categories;
        // }, err => {
        //     this.isLoading = false;
        // });
    }

}