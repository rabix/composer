/**
 * Created by Maya on 7.8.15.
 */

import ControlElement from '../control-element/controlElement.directive';

class CheckboxDirective extends ControlElement {
	constructor() {
		super();

		this.templateUrl = 'app/components/ui/checkbox/checkbox.html';
		this.controller = CheckboxController;
		this.controllerAs = 'cb';
		this.scope = {
			model: '=ngModel',
			name: '@',
			disabled: '=ngDisabled',
			error: '=hasError',
			success: '=hasSuccess',
			warning: '=hasWarning'
		};
	}
}

class CheckboxController {
	constructor() {

	}
}

angular.module('cottontail').directive('ctCheckbox', () => new CheckboxDirective());