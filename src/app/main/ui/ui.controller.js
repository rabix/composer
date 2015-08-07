/**
 * Created by Maya on 5.8.15.
 */

class UIController {
	constructor() {
		'ngInject';
		this.input = 'input';
		this.search = 'search';

		this.disabled = true;

		this.error = true;
		this.success = true;
		this.warning = true;

		this.toggleError = function() {
			this.error = !this.error;
		};

		this.toggleSuccess = function() {
			this.success = !this.success;
		};

		this.toggleWarning = function() {
			this.warning = !this.warning;
		};

	}
}

angular.module('cottontail').controller('UIController', UIController);

export default UIController;