module client {
    'use strict';

    interface IProjectsScope extends ng.IScope {
        extraValues: any[];
    }

    /** @ngInject */
    export function flip($templateCache: ng.ITemplateCacheService): ng.IDirective {

        return {
            restrict: 'E',
            scope: {
                extraValues: '='
            },
            template: '<div>{{ vm.name }}</div>',
            link: linkFunc,
            controller: FlipController,
            controllerAs: 'vm'
        };

    }

    function linkFunc($scope: IProjectsScope, el: JQuery, attr: any, vm: FlipController) {

        el.addClass('flip-flip');
    }

    interface IContributor {
        id: number;
        login: string;
    }

    /** @ngInject */
    class FlipController {
        public contributors: any[];
        public name: string;

        private $log: ng.ILogService;


        constructor($log: ng.ILogService) {

            this.$log = $log;
            this.$log.debug('Flip directive initiated');

            this.name = 'Wogoo';
        }
    }

    angular.module('client').
        directive('flip', flip);
}
