const MODAL_OPENED = 'modal-open';

class CreateFileDirective {
    constructor() {
        this.restirct = 'A';
        this.scope = {
            createFileCb: '&createFile',
            workspace: '=ws'
        };
        this.controller = CreateFileController;
        this.controllerAs = 'cf';
        this.bindToController = true;

        this.link = function(scope, element) {
            angular.element(element).on('click', function(e) {
                scope.cf.openModal();
            });

            scope.$on(scope.cf.Shortcuts.events.create, function() {

                // prevent multiple modals from being opened
                if (!angular.element('body').hasClass(MODAL_OPENED)) {
                    scope.cf.openModal();
                    angular.element('body').addClass(MODAL_OPENED);
                }
            });
        };
    }
}

class CreateFileController {
    constructor($modal, Api, Shortcuts) {
        this.$modal = $modal;
        this.Api = Api;
        this.Shortcuts = Shortcuts;
    }

    openModal() {
        let modalInstance = this.$modal.open({
            templateUrl: 'app/components/create-file/create-file.html',
            controller: ($scope, $modalInstance) => {

                $scope.actions = [{
                    id: 'import',
                    name: 'Import App from Description'
                }, {
                    id: 'tool',
                    name: 'Blank Command Line Tool'
                }, {
                    id: 'workflow',
                    name: 'Blank Workflow'
                }];

                $scope.view = {};
                $scope.view.action = 'tool';


                $scope.ok = function(name, action) {
                    $modalInstance.close({name: name + '.json', type: 'json', action: action});
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('close');
                };
            }
        });

        modalInstance.result.then(function(file) {
            this.Api.files.create({workspace: this.workspace, file: file.name}, () => {
                this.createFileCb({file: file});
            }, (err) => {
                console.log(err);
            });
        }.bind(this));
    }
}

CreateFileController.$inject = ['$modal', 'Api', 'Shortcuts'];

angular.module('cottontail').directive('createFile', () => new CreateFileDirective());