import BaseElement from "../control-element/controlElement.directive";

class TabsDirective extends BaseElement {
	constructor() {
		super();

		this.controller = TabsController;
		this.controllerAs = 'tabs';
		this.templateUrl = 'app/components/ui/tabs/tabs.html';
		this.replace = true;
		this.scope = {
			list: '=tabs',
			callback: '&',
			tabSrc: '@'
		};
	}
}

class TabsController {
	constructor () {

		this.list = _.isArray(this.list) ? this.list : [this.list];

		if (_.isString(this.list[0])) {
			this.list = _.map(this.list, function(tab) {
				return {
					name: tab,
					slug: _.kebabCase(tab)
				};
			});
		}

		this.activateTab(this.list[0]);
	}

	activateTab (tab) {
		this.activeTab = tab.slug;

		if (typeof this.callback === 'function') {
			this.callback({tab: tab.slug});
		}
	}
}

angular.module('cottontail').directive('ctTabs', () => new TabsDirective());