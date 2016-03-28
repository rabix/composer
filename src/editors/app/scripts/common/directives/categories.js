/**
 * created by maya on 06.10.2015.
 */

'use strict';

angular.module('registryApp.common')
    .controller('CategoriesCtrl', ['$scope', 'lodash', function($scope, _) {
        var categories = [
            'DNA',
            'WGS',
            'WES (WXS)',
            'RNA',
            'Targeted sequencing',
            'Assembly',
            'Alignment',
            'Annotation',
            'BED Processing',
            'Converters',
            'Differential Expression',
            'FASTA Processing',
            'FASTQ Processing',
            'Indexing',
            'Other',
            'Plotting and Rendering',
            'Prioritization',
            'SAM/BAM Processing',
            'Text Processing',
            'VCF Processing',
            'Variant Calling',
            'Quality Control',
            'Quantification'
        ];

        categories = _.map(categories, function(cat) {
            return {text: cat};
        });

        $scope.loadCategories = function($query) {
            var regex = new RegExp($query.toLowerCase().split('').join('.*'));

            return _(categories).filter(function(cat) {
                var score = cat.text.toLowerCase().search(regex);

                if (score !== -1) {
                    cat.score = score;
                    return cat;
                }
            }).sortBy('score').value().slice(0, 6);
        };
    }])
    .directive('categories', ['$templateCache', function($templateCache) {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=',
                onUpdate: '&'
            },
            template: $templateCache.get('views/partials/categories.html'),
            controller: 'CategoriesCtrl'
        };
    }]);