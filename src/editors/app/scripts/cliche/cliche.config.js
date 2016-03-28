/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 2:57 PM
 */

'use strict';

angular.module('registryApp.cliche', [
        'ui.bootstrap',
        'registryApp.common',
        'registryApp.app',
        'registryApp.util',
        'ngPrettyJson',
        'markdown',
        'ngTagsInput',
        'ngAnimate'])
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
                delay: 6000
            });
        }
    ]);
