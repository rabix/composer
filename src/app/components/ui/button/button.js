/**
 * Created by Maya on 4.8.15.
 */

import ControlElement from '../control-element/controlElement.directive.js';

class ButtonDirective extends ControlElement {
	constructor(template) {
		super();

		this.transclude = true;
		this.templateUrl = template || 'app/components/ui/button/button.html';
		this.controller = ButtonController;
		this.controllerAs = 'btn';

		this.scope = {
			intention: '@',
			size: '@'
		};
	}
}

class LinkDirective extends ButtonDirective {
	constructor() {
		super('app/components/ui/button/link.html');
	}
}

class ButtonController {
	constructor() {
		this.intention = this.intention ? 'btn-' + this.intention : null;
		this.size = this.size ? 'btn-' + this.size : null;
	}
}

angular.module('cottontail').directive('ctButton', () => new ButtonDirective());
angular.module('cottontail').directive('ctLink', () => new LinkDirective());

export default ButtonDirective;