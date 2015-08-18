import BaseElement from "../ui/control-element/controlElement.directive";
import FileTreeController from "./fileTree.controller";

class FileTreeDirective extends BaseElement{
	constructor () {
		super();

		this.templateUrl = 'app/components/file-tree/file-tree.html';
		this.restrict = 'E';
		this.controller = FileTreeController;
		this.controllerAs = 'tree';
        this.scope = {
            files: '=',
            workspace: '@',
            fileAddedCb: '&onAdd',
            fileOpenedCb: '&onOpen'
        };
		this.replace = true;

	}
}


angular.module('cottontail').directive('fileTree', () => new FileTreeDirective());
