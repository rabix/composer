class WorkspaceController {
    constructor(Api, $modal, $state) {
        this.$modal = $modal;
        this.Api = Api;
        this.$state = $state;
        Api.workspaces.query({}, (res) => {
            this.workspaces = res.workspaces;
        });
    }

    goToWorkspace(ws) {
        this.$state.go('main.editor', {workspace: ws});
    }

    createNewWorkspace() {
        console.log('clicking button!!');
        let modalInstance = this.$modal.open({
            template:
            `<div class="modal-body">
                <ct-input type="text" ng-model="view.name">Enter workspace name</ct-input>
            </div>
            <div class="modal-footer">
                <ct-button intention="default" ng-click="cancel()">Cancel</ct-button>
                <ct-button intention="primary" ng-click="ok(view.name)">Create</ct-button>
            </div>`,
            controller: ($scope, $modalInstance) => {
                $scope.ok = function (name) {
                    $modalInstance.close(name);
                };

                $scope.cancel = function() {
                    $modalInstance.dismiss('close');
                };
            }
        });

        modalInstance.result.then(function(name) {
            this.Api.workspaces.create({workspace: name}, (workspace) => {
                this.$state.go('main.editor', {workspace: name});
            });
        }.bind(this));

    }
}

export default WorkspaceController;

WorkspaceController.$inject = ['Api', '$modal', '$state'];

angular.module('cottontail').controller('WorkspaceController', WorkspaceController);