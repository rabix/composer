/**
 * Created by Maya on 5.8.15.
 */

class UIController {
	constructor() {
		'ngInject';
		this.input = 'input';
		this.search = 'search';

		this.disabled = true;
	}
}

angular.module('cottontail').controller('UIController', UIController);

export default UIController;