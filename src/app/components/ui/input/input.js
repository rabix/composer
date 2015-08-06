/**
 * Created by Maya on 4.8.15.
 */

import ControlElement from '../control-element/controlElement.directive';

class InputDirective extends ControlElement {
	constructor(type) {
		super();

		this.templateUrl = 'app/components/ui/input/' + (type || 'input') + '.html';
		this.controller = InputController;
		this.controllerAs = 'input';
		this.scope = {
			model: '=ngModel',
			disabled: '=?ngDisabled',
			id: '@'
		};

		this.link = function (scope, element, attr) {
			element.find('input').bind('focus', function() {
				element.find('.ct-input').addClass('ct-focus')
			});

			element.find('input').bind('blur', function() {
				element.find('.ct-input').removeClass('ct-focus');
			});
		}
	}
}

class InputController {
	constructor ($log) {
		this.$log = $log;
		this.id = this.id ||  _.uniqueId('input-');
	}
}

InputController.$inject = ['$log'];

angular.module('cottontail').directive('ctSearch', () => new InputDirective('search'));
angular.module('cottontail').directive('ctEmail', () => new InputDirective('email'));
angular.module('cottontail').directive('ctInput', () => new InputDirective());