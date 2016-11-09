import {Component, Input, Output, ElementRef, Renderer, ViewChild} from "@angular/core";
import {FormGroup, FormControl} from "@angular/forms";
import {ReplaySubject} from "rxjs";
import {ComponentBase} from "../common/component-base";
import {ContenteditableDirective} from "./directive/contenteditable.directive";

require("./compact-list.component.scss");

@Component({
    selector: "compact-list",
    directives: [
        ContenteditableDirective
    ],
    template: `
       <form [formGroup]="formGroup" class="compact-list-form">
            <div class="compact-list-wrapper" (click)="onListWrapperClick()">
                
                <div class="input-tag-list">
                    <span *ngFor="let tag of tagList"
                          class="tag tag-pill tag-default">{{tag}}</span>
                                              
                    <span #tagInput 
                          contenteditable="true"
                          class="tag-input"
                          *ngIf="formGroup.controls['compactListControl']"
                          [formControl]="formGroup.controls['compactListControl']"
                          (keydown)="updateTagList($event)"></span>
                </div>
            </div>
       </form>
    `
})
export class CompactListComponent extends ComponentBase {

    /** The parent forms control group */
    @Input()
    public formGroup: FormGroup;

    /**
     * Key codes
     * Tab: 9
     * Enter: 13
     * Space: 32
     * */
    @Input()
    public addKeyCode: number;

    @Output()
    public onUpdate = new ReplaySubject<string[]>(1);

    @ViewChild("tagInput")
    private tagInputElement: ElementRef;

    private tagList: string[] = ["asdasd.txt"];

    constructor(private renderer: Renderer) {
        super();
    }

    ngOnInit(): void {
        this.formGroup.addControl(
            "compactListControl", new FormControl("")
        );
    }

    private onListWrapperClick(): void {
        this.renderer.invokeElementMethod(this.tagInputElement.nativeElement, 'focus', []);
    }

    private updateTagList(event): void {
        const tabKeyCode = 9;
        if (event.keyCode === this.addKeyCode) {
            if (this.addKeyCode === tabKeyCode) {
                event.preventDefault();
            }

            this.addTagToList(this.formGroup.controls["compactListControl"].value);
        }
    }

    private addTagToList(tag: string): void {
        const trimmedValue: string = tag.trim();

        //make sure value was not a sequence of white spaces
        if (!!trimmedValue) {
            this.tagList.push(trimmedValue);
            this.onUpdate.next(this.tagList);

            this.formGroup.controls["compactListControl"].setValue("");
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
