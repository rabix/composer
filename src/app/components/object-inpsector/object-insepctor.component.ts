import {Component} from "@angular/core";

require ("./object-inpsector.component.scss");

/** TODO: make this switch between an expression editor and an object inspector*/
@Component({
    selector: "object-inspector",
    template: `
            <form class="object-inspector-component">
                <div class="formHead">
                     <span class="edit-text">Edit</span>
                    <i class="fa fa-info-circle info-icon"></i>
                </div>
            
                <div class="form-group">
                    <label for="inputId">ID</label>
                    <input type="text" id="inputId" class="form-control">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    <select class="form-control">
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="inputValue">Value</label>
                    <input type="text" id="inputValue" class="form-control">
                </div>
            </form>
    `
})
export class ObjectInspectorComponent {

}
