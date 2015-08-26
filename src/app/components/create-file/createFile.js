class CreateFileDirective {
	constructor () {
		this.restirct = 'A';
		this.scope = {
			createFileCb: '&createFile',
			workspace: '=ws'
		};
		this.controller = CreateFileController;
		this.controllerAs = 'cf';
		this.bindToController = true;

		this.link = function (scope, element, attr) {
			console.log('asomething?');

			angular.element(element).on('click', function(e) {
				console.log(element);
				
				scope.cf.openModal();
			});
		};
	}
}

class CreateFileController {
	constructor($modal, Api) {
		this.$modal = $modal;
		this.Api = Api;
	}

	openModal () {
		let modalInstance = this.$modal.open({
			templateUrl: 'app/components/create-file/create-file.html',
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
				this.createFileCb({file: file});
			}, (err) => {
				console.log(err);
			});
		}.bind(this));
	}
}

CreateFileController.$inject = ['$modal', 'Api'];

angular.module('cottontail').directive('createFile', () => new CreateFileDirective());