/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.dyole', [
        'registryApp.app',
        'ui.bootstrap',
        'ui.sortable',
        'registryApp.common',
        'registryApp.util',
        'ngPrettyJson',
        'markdown',
        'ngTagsInput'])
    .constant('Const', {
        exposedSeparator: '$',
        generalSeparator: '.'
    })
    .config([
        '$uibModalProvider',
        'NotificationProvider',
        '$uibTooltipProvider',
        function($uibModalProvider, NotificationProvider, $uibTooltipProvider) {
            $uibTooltipProvider.options({
                popupDelay: 100,
                animation: true,
                appendToBody: true
            });


            $uibModalProvider.options = {
                backdrop: 'static',
                animation: true
            };


            NotificationProvider.setOptions({
                delay: 6000,
                startTop: 55
            });
        }
    ]);
