import BaseElement from "../control-element/controlElement.directive";

class TabsDirective extends BaseElement {
	constructor() {
		super();

		this.controller = TabsController;
		this.controllerAs = 'tabs';
		this.templateUrl = 'app/components/ui/tabs/tabs.html';
		this.transclude = true;
		this.replace = true;
		this.scope = {
			list: '=tabs',
			onActiveTab: '&',
			tabSrc: '@',
            switchActiveTab: '=',
			onCloseTab: '&'
		};

        this.link = function (scope, elem, attr) {
	        scope.tabs.attr = attr;
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
                    _.forEach(scope.tabs.list, function(tab) {
                        if (tab === n) {
                            scope.tabs.activateTab(tab);
                        }
                    });
                }
            });

        };
	}
}

class TabsController {
	constructor () {}

    activateTab (tab) {
        if (tab.slug === this.activeTab) {
            return;
        }

        this.activeTab = tab.slug;

        if (!_.isUndefined(this.attr.switchActiveTab)) {
            this.onActiveTab({tab: tab});
        }
    }

	closeTab (tab) {
		this.onCloseTab({tab: tab});
	}
}

angular.module('cottontail').directive('ctTabs', () => new TabsDirective());