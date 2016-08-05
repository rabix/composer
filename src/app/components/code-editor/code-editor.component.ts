import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {CodeEditor} from "./code-editor";
import {Component, OnInit, ElementRef, ViewChild, Input} from "@angular/core";
import {FileModel} from "../../store/models/fs.models";
import {FileRegistry} from "../../services/file-registry.service";
import {Subscription} from "rxjs/Rx";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {UpdateFileAction} from "../../action-events/index";
import Editor = AceAjax.Editor;
import TextMode = AceAjax.TextMode;

require('./code-editor.component.scss');

@Component({
    selector: 'code-editor',
    directives: [BlockLoaderComponent],
    template: `
        <div class="code-editor-container">
             <block-loader *ngIf="!isLoaded"></block-loader>
             <div #ace class="editor"></div>
        </div>`,
})
export class CodeEditorComponent implements OnInit {
    /** Provided file that we should open in the editor */
    @Input() file: FileModel;

    /** Holds the reference to the CodeEditor service/component */
    private editor: CodeEditor;

    /** Flag that determines if the spinner should be shown */
    private isLoaded: boolean;

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[];

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    constructor(private fileRegistry: FileRegistry,
                private eventHub: EventHubService) {
        this.subs     = [];
        this.isLoaded = false;
    }

    ngOnInit(): any {
        // This file that we need to show, check it out from the file repository
        const fileStream = this.fileRegistry.getFile(this.file);

        // Instantiate the editor and give it the stream through which the file will come through
        this.editor = new CodeEditor(ace.edit(this.aceContainer.nativeElement), fileStream);

        // Also, we want to turn off the loading spinner and might as well bring our own file up to date
        this.subs.push(fileStream.subscribe(file => {
            this.isLoaded = true;
            this.file     = file;
        }));

        this.editor.contentChanges.skip(1).subscribe((file) => {
            this.eventHub.publish(new UpdateFileAction(file));
        })

    }

    ngOnDestroy(): void {
        this.editor.dispose();
        console.debug("Disposing code editor");
        this.subs.forEach(sub => sub.unsubscribe());
    }
    
}
