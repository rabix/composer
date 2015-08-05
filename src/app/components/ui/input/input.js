/**
 * Created by Maya on 4.8.15.
 */

import ControlElement from '../control-element/controlElement.directive.js';

class InputDirective extends ControlElement {
	constructor(type) {
		super();
		this.templateUrl = 'app/components/ui/input/' + (type || 'input') + '.html';
		this.controller = InputController;
		this.controllerAs = 'input';
		this.scope = {
			model: '=ngModel',
			id: '=?'
		};
	}
}

class InputController {
	constructor ($log) {
		this.id = this.id || _.uniqueId('input-');
	}


}

angular.module('cottontail').directive('ctSearch', () => new InputDirective('search'));
angular.module('cottontail').directive('ctInput', () => new InputDirective());