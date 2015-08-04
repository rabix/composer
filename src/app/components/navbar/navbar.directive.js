import NavbarController from './navbar.controller';

class NavbarDirective {
    constructor() {
        'ngInject';

        let directive = {
            restrict: 'E',
            templateUrl: 'app/components/navbar/navbar.html',
            scope: {
                creationDate: '='
            },
            controller: NavbarController,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;
    }
}

angular.module('cottontail')
    .directive('navigation', () => new NavbarDirective());
