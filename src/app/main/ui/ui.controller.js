/**
 * Created by Maya on 5.8.15.
 */

class UIController {
	constructor() {
		'ngInject';
		this.input;
		this.search;
	}
}

angular.module('cottontail').controller('UIController', UIController);

export default UIController;