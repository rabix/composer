/**
 * Author: Milica Kadic
 * Date: 12/22/14
 * Time: 6:18 PM
 */

'use strict';

angular.module('registryApp.common', ['ngSanitize', 'cfp.hotkeys', 'Chronicle', 'ui-notification', 'markdown'])
    .config(['markdownConfig', function(markdownConfig) {
        markdownConfig.escapeHtml = true;
    }]);

