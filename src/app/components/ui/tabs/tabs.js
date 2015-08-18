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
            switchActiveTab: '='
		};

        this.link = function (scope) {
            scope.tabs.list = _.isArray(scope.tabs.list) ? scope.tabs.list : [scope.tabs.list];

            if (_.isString(scope.tabs.list[0])) {
            	scope.tabs.list = _.map(scope.tabs.list, function(tab) {
            		return {
            			name: tab,
            			slug: _.kebabCase(tab)
            		};
            	});
            }

            scope.$watch('tabs.switchActiveTab', function (n, o) {
                if (n !== o) {
                    console.log('switching');
                    _.forEach(scope.tabs.list, function(tab) {
                        if (tab === n) {
                            scope.tabs.activateTab(tab);
                        }
                    });
                }
            });

        }.bind(this);
	}
}

class TabsController {
	constructor () {}

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