class FileTreeController {
	constructor ($modal, $state, Api) {
        this.$modal = $modal;
        this.$state = $state;
        this.Api = Api;
	}

    createFile () {
        let modalInstance = this.$modal.open({
            template:
                `<div class="modal-body">
                    <ct-input type="text" ng-model="view.name">Enter file name</ct-input>
                    <select class="form-control" ng-options="type.id as type.name for type in types" ng-model="view.type"></select>
                </div>
                <div class="modal-footer">
                    <ct-button intention="default" ng-click="cancel()">Cancel</ct-button>
                    <ct-button intention="primary" ng-click="ok(view.name, view.type)">Create</ct-button>
                </div>`,
            controller: ($scope, $modalInstance) => {
                $scope.types = [{
                    id: 'json',
                    name: 'JSON'
                }, {
                    id: 'yaml',
                    name: 'YAML'
                }, {
                    id: 'js',
                    name: 'JavaScript'
                }];
                $scope.view = {};
                $scope.view.type = 'json';


                $scope.ok = function (name, type) {
                    $modalInstance.close({name: name + '.' + type, type: type});
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('close');
                };
            }
        });

        modalInstance.result.then(function(file) {
            this.Api.files.create({workspace: this.workspace, file: file.name}, () => {
                this.fileAddedCb({file: file});
            }, (err) => {
                console.log(err);
            });
        }.bind(this));

    }

    openFile(file) {
        this.fileOpenedCb({file: file});
    }
}

FileTreeController.$inject = ['$modal', '$state', 'Api'];


angular.module('cottontail').controller('FileTreeController', FileTreeController);

export default FileTreeController;