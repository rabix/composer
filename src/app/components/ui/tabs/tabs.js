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
			tabSrc: '@',
            activeObj: '=active'
		};

        this.link = function (scope, element, attr) {
            scope.list = _.isArray(scope.list) ? scope.list : [scope.list];

            if (_.isString(scope.list[0])) {
            	scope.list = _.map(scope.list, function(tab) {
            		return {
            			name: tab,
            			slug: _.kebabCase(tab)
            		};
            	});
            }

        }.bind(this);
	}
}

class TabsController {
	constructor () {}

    /* @TODO: make tab activation work two way (from controller to directive, and directive to controller) */
    activateTab (tab) {
        console.log('activating tab');
        if (tab.slug === this.activeTab) {
            return;
        }

        this.activeTab = tab.slug;

        if (typeof this.callback === 'function') {
            this.callback({tab: tab.slug});
        }
    }
}

angular.module('cottontail').directive('ctTabs', () => new TabsDirective());