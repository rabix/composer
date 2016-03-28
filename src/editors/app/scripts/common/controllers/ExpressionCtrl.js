/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

/* globals angular */

angular.module('registryApp.common')
    .controller('ExpressionCtrl', ['$scope', '$uibModalInstance', 'options', 'Cliche', function($scope, $modalInstance, options, Cliche) {
        'use strict';

        $scope.view = {};

        $scope.view.expr = options.expr || '';
        $scope.view.self = options.self;

        $scope.view.exampleText = 'enter $self value, example: "string" or 100 or [1, 2, 3] or {"key": "value"}';

        $scope.view.defaultSelf = _.find(Cliche.getJob().inputs, function(input, key) {
            return key === options.propId.substring(1);
        });

        /**
         * On modal confirm set the appropriate expression and close the modal
         *
         * @param expr
         */
        $scope.ok = function(expr) {

            $modalInstance.close(expr);
        };

        /**
         * On cancel close the modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        /**
         * On cancel close the modal and clear expression
         */
        $scope.clear = function() {
            $modalInstance.close('');
        };

    }]);
