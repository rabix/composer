angular.module('registryApp.common')
    .directive('selectAll', ['$document', 'lodash', '$timeout', function($document, _, $timeout) {
        'use strict';
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                var keyMap = {
                    17: false,
                    91: false
                };
                var selected = false;

                element.on('click.selectAll', function(e) {
                    // element was 'selected'
                    if (!selected) {
                        selected = true;

                        $document.on('keydown.selectAll', function(e) {
                            // set access keys to true
                            keyMap[e.keyCode] = true;

                            // check if cmd + a or ctrl + a were pressed
                            if (keyMap[17] || keyMap[91] && e.keyCode === 65) {
                                e.preventDefault();
                                e.stopPropagation();

                                // select range
                                var selection = window.getSelection();
                                if (selection.rangeCount > 0) {
                                    selection.removeAllRanges();
                                }
                                // get range of element
                                var range = document.createRange();
                                range.selectNode(element[0]);
                                selection.addRange(range);
                            }
                        });

                        // set all access keys to false
                        $document.on('keyup.selectAll', function(e) {
                            _.forIn(keyMap, function(value, key) {
                                keyMap[key] = false
                            });
                        });

                        $document.on('click.selectAll', function(e) {
                            // if element is 'deselected'

                            // find the target that should listen for click
                            var target = _findTarget();

                            // if element isn't target or one of its children
                            if (e.target !== target && angular.element(e.target).parents('[select-all]').length === 0) {
                                selected = false;

                                // deselect element and unregister listeners
                                $document.off('keydown.selectAll');
                                $document.off('keyup.selectAll');
                                $document.off('click.selectAll');
                            }
                        });
                    }
                });

                element.on('remove', function(e) {
                    element.off('click.selectAll');
                });


                if (!_.isUndefined(attr.triggerOnOpen)) {
                    $timeout(function() {
                        // open in next tick after all other user events have fired
                        angular.element(_findTarget()).trigger('click.selectAll');
                    });
                }

                /**
                 * Finds desired target for selection as described by the select-all attribute
                 *
                 * @returns {Element} target
                 * @private
                 */
                function _findTarget() {
                    var target = attr.selectAll !== '' ? element.find(attr.selectAll)[0] : element[0];
                    return _.isUndefined(target) ? element[0] : target;
                }
            }
        }
    }]);