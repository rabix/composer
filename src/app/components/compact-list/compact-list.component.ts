import {Component, Input, Output, ElementRef, Renderer, ViewChild} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {ReplaySubject} from "rxjs";
import {ComponentBase} from "../common/component-base";
import {ContenteditableDirective} from "./directives/contenteditable.directive";
import {TagModel} from "./tag.model";

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
                    <span *ngFor="let tag of tagList; let i = index; trackBy:trackByIndex"
                          class="tag tag-pill tag-default">
                          
                          <span *ngIf="tag.validation?.errors?.length > 0"
                                title="tag.validation.errorText"
                                class="icon-wrapper">
                                <i class="fa fa-times-circle error">
                                </i>
                          </span>
                          
                          <span *ngIf="tag.validation?.warnings?.length > 0"
                                class="icon-wrapper">
                                <i class="fa fa-warning warning">
                                </i>
                          </span>
                          
                          {{tag.value}}
                          <i class="fa fa-times remove-tag-icon"
                             (click)="removeTag(i, $event)"></i>
                    </span>
                   
                   
                    <!-- Not using the <input>, 
                         so that the width can adjust to the text length,
                         and break into a new line if its long -->
                    <span #tagInput 
                          contenteditable="true"
                          class="tag-input"
                          *ngIf="formGroup.controls['compactListControl']"
                          [formControl]="formGroup.controls['compactListControl']"
                          (keydown)="onTagInputKeyDown($event)"></span>
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

    /** TODO: Tag type */
    @Input()
    public tagType: string;

    @Output()
    public onUpdate = new ReplaySubject<TagModel[]>(1);

    //TODO: re-factor once we have the actual tag model
    @Input()
    public tagList: TagModel[];

    @ViewChild("tagInput")
    private tagInputElement: ElementRef;

    constructor(private renderer: Renderer) {
        super();
    }

    ngOnInit(): void {
        this.formGroup.addControl(
            "compactListControl", new FormControl("", Validators.compose([Validators.required, Validators.minLength(1)]))
        );
    }

    private trackByIndex(index: number): number {
        return index;
    }

    private onListWrapperClick(): void {
        this.renderer.invokeElementMethod(this.tagInputElement.nativeElement, 'focus', []);
    }

    private onTagInputKeyDown(event): void {
        const tabKeyCode = 9;
        const backSpaceCode = 8;
        const tagInputValue: string = this.formGroup.controls["compactListControl"].value;

        if (tagInputValue.length === 0 && event.keyCode === backSpaceCode) {
            this.removeTag(this.tagList.length - 1);
            return;
        }

        if (event.keyCode === this.addKeyCode) {
            if (this.addKeyCode === tabKeyCode) {
                event.preventDefault();
            }

            if (this.formGroup.controls["compactListControl"].valid) {
                this.addTag(tagInputValue);
            }
        }
    }

    private addTag(tag: string): void {
        const trimmedValue: string = tag.trim();

        //make sure value was not a sequence of white spaces
        if (!!trimmedValue) {
            //TODO: re-factor once we have the actual tag model
            this.tagList.push({
                value: trimmedValue,
                validation: {
                    errors: [],
                    warnings: [],
                    errorText: ""
                }
            });

            this.onUpdate.next(this.tagList);
            this.formGroup.controls["compactListControl"].setValue("");
        }
    }

    private removeTag(index: number, event?: Event): void {
        if (!!event) {
            event.stopPropagation();
        }

        this.tagList.splice(index, 1);
        this.onUpdate.next(this.tagList);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
