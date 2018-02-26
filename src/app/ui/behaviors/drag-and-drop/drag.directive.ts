import {Directive, ElementRef, Input} from "@angular/core";
import {DomEventService} from "../../../services/dom/dom-event.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {take, skip, last} from "rxjs/operators";

@Directive({selector: "[ct-drag-enabled]"})
export class DragDirective extends DirectiveBase {

    @Input("ct-drag-enabled")
    private dragEnabled = false;

    @Input("ct-drag-image-class")
    private dragImageClass: string;

    @Input("ct-drag-transfer-data")
    dragTransferData: any;

    @Input("ct-drag-image-caption")
    dragImageCaption: string;

    el: Element;

    constructor(el: ElementRef, private domEvents: DomEventService) {
        super();
        this.el = el.nativeElement;
    }

    ngOnInit() {
        if (this.dragEnabled) {

            this.domEvents.onDrag(this.el, "", {
                dragImage: null,
                preHoveredElement: null,
                preEnteredDropZones: [],
                preDragEntered: null,
            }).subscribe(drag => {

                // On Drag Start
                const first = drag.pipe(
                    take(1)
                ).subscribe((ev: any) => {
                    // Create drag image
                    ev.ctData.dragImage = this.createDragImage(this.dragImageClass, this.dragImageCaption);
                    document.body.appendChild(ev.ctData.dragImage);
                });

                // On Drag (Mouse Move)
                // Skip first 6 mouse move events in order to distinguish mouse click and drag
                const mid = drag.pipe(
                    skip(6)
                ).subscribe((ev: any) => {

                    const dragImage           = ev.ctData.dragImage;
                    const preEnteredDropZones = ev.ctData.preEnteredDropZones;
                    const preHoveredElement   = ev.ctData.preHoveredElement;
                    const preDragEntered      = ev.ctData.preDragEntered;

                    // Reposition of drag image
                    dragImage.style.top  =
                        ev.clientY - (1 / 2) * dragImage.offsetHeight + "px";
                    dragImage.style.left =
                        (ev.clientX - (1 / 2) * dragImage.offsetWidth) + "px";

                    // Get element behind drag image at following mouse coordinates
                    dragImage.style.visibility = "hidden";
                    const curHoveredElement    = document.elementFromPoint(ev.clientX, ev.clientY);
                    dragImage.style.visibility = "visible";

                    // If current hovered element is different than previous one
                    if (curHoveredElement !== preHoveredElement) {

                        const curEnteredDropZones = [];
                        let parent                = curHoveredElement;

                        let curDragEntered = null;

                        // Find all matching drop zones starting from the hovered element all up to the root node
                        while (parent != null) {
                            if (this.isDropEnabledOnElement(parent) && this.matchDragAndDropZones(this.el, parent)) {
                                curEnteredDropZones.push(parent);
                            }

                            // Find first element that is listening to drag over events
                            if (!curDragEntered && parent.hasAttribute("ct-drag-over")) {
                                curDragEntered = parent;
                            }

                            parent = parent.parentElement;
                        }

                        // Trigger dragOverEnter/dragOverLeave when you leave/enter previous/new element that is listening to drag over events
                        if (curDragEntered != preDragEntered) {
                            curDragEntered && this.domEvents.triggerCustomEventOnElements([curDragEntered],
                                this.domEvents.ON_DRAG_ENTER_EVENT);
                            preDragEntered && this.domEvents.triggerCustomEventOnElements([preDragEntered],
                                this.domEvents.ON_DRAG_LEAVE_EVENT);
                        }

                        // Find differences between previous and current matched drop zones (entered ones)
                        const enteredDropZones = this.diffArray(curEnteredDropZones, preEnteredDropZones);
                        const leavedDropZones  = this.diffArray(preEnteredDropZones, curEnteredDropZones);

                        // Trigger Drag Enter event on elements
                        this.domEvents.triggerCustomEventOnElements(enteredDropZones, this.domEvents.ON_DRAG_ENTER_ZONE_EVENT);

                        // Trigger Drag Leave event on elements
                        this.domEvents.triggerCustomEventOnElements(leavedDropZones, this.domEvents.ON_DRAG_LEAVE_ZONE_EVENT);


                        ev.ctData.preDragEntered      = curDragEntered;
                        ev.ctData.preEnteredDropZones = curEnteredDropZones;
                    }

                    ev.ctData.preHoveredElement = curHoveredElement;
                });

                // On Drag End
                drag.pipe(last()).subscribe((ev: any) => {

                    // Remove drag image from DOM
                    try {
                        if (ev.ctData.dragImage) {
                            document.body.removeChild(ev.ctData.dragImage);
                        }
                    } catch (ex) {
                        console.warn("Tried to remove drag image, but it's not a child of document");
                    }

                    // Trigger Drag Over Leave event on previously entered (onDragOverEnter) element
                    ev.ctData.preDragEntered && this.domEvents.triggerCustomEventOnElements([ev.ctData.preDragEntered],
                        this.domEvents.ON_DRAG_LEAVE_EVENT);

                    // Trigger Drag Leave event for all previously entered dropZones
                    ev.ctData.preEnteredDropZones.forEach((dropZone) => {
                        this.domEvents.triggerCustomEventOnElements([dropZone], this.domEvents.ON_DRAG_LEAVE_ZONE_EVENT);
                    });

                    // Get current hovered element (where to drop)
                    let curHoveredElement = document.elementFromPoint(ev.clientX, ev.clientY);

                    // If current element is not a drop zone, find the nearest parent that is a drop zone
                    while (curHoveredElement != null && !this.isDropEnabledOnElement(curHoveredElement)) {
                        curHoveredElement = curHoveredElement.parentElement;
                    }

                    // Check if current element has the matching drop zones
                    if (curHoveredElement != null && this.matchDragAndDropZones(this.el, curHoveredElement)) {
                        this.domEvents.triggerCustomEventOnElements([curHoveredElement],
                            this.domEvents.ON_DROP_SUCCESS_EVENT,
                            Object.assign({}, {transfer_data: this.dragTransferData}, {event: ev}));
                    }

                    first.unsubscribe();
                    mid.unsubscribe();
                });
            });
        }
    }

    /**
     * Create drag image with caption text under
     */
    private createDragImage(imageClass: string, caption: string): Element {
        const container     = document.createElement("div");
        container.className = "drag-container";

        const image     = document.createElement("div");
        image.className = "drag-image ";
        image.className += imageClass;

        const text       = document.createElement("div");
        text.className   = "drag-text";
        text.textContent = caption;

        container.appendChild(image);
        container.appendChild(text);

        return container;
    }

    /**
     * Returns true if particular element can be a drop zone
     */
    private isDropEnabledOnElement(element: Element): boolean {
        return element.hasAttribute("ct-drop-enabled");
    }

    /**
     * Returns true if dropElement contains any of dragElement zones
     */
    private matchDragAndDropZones(dragElement: Element, dropElement: Element): boolean {
        return this.arrayContains(this.getElementDropZones(dragElement), this.getElementDropZones(dropElement));
    }

    /**
     * Returns array of strings that specifies available drag/drop zones (['zone1',['zone2']]) for particular element
     */
    private getElementDropZones(element: Element): string [] {
        return element.getAttribute("ct-drop-zones") ? element.getAttribute("ct-drop-zones").split(",") : [];
    }

    /**
     * Checks if array2 contains any one of the array1 elements
     */
    private arrayContains(array1: any [], array2: any []): boolean {
        return array2.some(value => array1.indexOf(value) >= 0);
    }

    /**
     * Find difference between array1 and array 2 (array1 - array2)
     */
    private diffArray(array1: any [], array2: any []): any [] {
        return array1.filter(val => {
            return array2.indexOf(val) < 0;
        });
    }
}
