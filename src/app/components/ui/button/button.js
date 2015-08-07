/**
 * Created by Maya on 4.8.15.
 */

import ControlElement from '../control-element/controlElement.directive';

class ButtonDirective extends ControlElement {
	constructor(template) {
		super();

		this.templateUrl = template || 'app/components/ui/button/button.html';
		this.controller = ButtonController;
		this.controllerAs = 'btn';
		this.bindToController = true;

		this.link = function (scope, element, attr) {
			const btn = angular.element(element).find('button');
			btn.addClass(scope.btn.prependBtn(attr.intention));
			btn.addClass(scope.btn.prependBtn(attr.size));
		}.bind(this);
	}
}

class LinkDirective extends ButtonDirective {
	constructor() {
		super('app/components/ui/button/link.html');
	}
}

class ButtonController {
	constructor() {
	}

	prependBtn(attr) {
		return !_.isEmpty(attr) ? 'btn-' + attr : '';
	}
}

angular.module('cottontail').directive('ctButton', () => new ButtonDirective());
angular.module('cottontail').directive('ctLink', () => new LinkDirective());

export default ButtonDirective;