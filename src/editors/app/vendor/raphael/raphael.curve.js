/**
 * Created by filip on 3.6.14..
 */

'use strict';

/**
 * Helper element for drawing Bezier Curves for terminal connections
 *
 * @param {object} config
 * @param {number} config.x1
 * @param {number} config.x2
 * @param {number} config.y1
 * @param {number} config.y2
 *
 * @param {object} attributes
 * @returns {*}
 */
Raphael.fn.curve = function (config, attributes) {
    var r = this,
        defaults = {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0
        };

    config = config || defaults;
    attributes = attributes || {};

    var endCoords = {
        x2: config.x2,
        y2: config.y2
    };

    function Curve(conf, attr) {

        var pub, path = r.group(),
            pathInner, pathOutter, glow;


        function initialize(conf) {
            var string = generatePathString(conf);

            pathOutter = r.path(string);
            pathOutter.attr({
                stroke : '#868686',
                'stroke-width' : attr['stroke-width'] + 1
            }).toBack();


            pathInner = r.path(string);
            pathInner.attr(attr);

            path.push(pathInner).push(pathOutter);

        }

        function switchCoords (coords) {
            var temp;

            if (coords.x1 > coords.x2 && coords.y1 > coords.y2) {
                temp = coords.x1;
                coords.x1 = coords.x2;
                coords.x2 = temp;

                temp = coords.y1;
                coords.y1 = coords.y2;
                coords.y2 = temp;
            }

            if (coords.y1 < coords.y2 && coords.x1 > coords.x2 ) {
                temp = coords.x1;
                coords.x1 = coords.x2;
                coords.x2 = temp;

                temp = coords.y1;
                coords.y1 = coords.y2;
                coords.y2 = temp;
            }

            endCoords = coords;
            return coords;

        }

        function generatePathString (coords) {

            var string, control, beginString, endString, controlString;


            coords = switchCoords(coords);

            control = calculateControlPoints(coords);

            beginString = "M" + coords.x1 + "," + coords.y1 + " ";
            controlString = "C" + control.x1 + "," + control.y1 + " " + control.x2 + "," + control.y2 + " ";
            endString = coords.x2 + "," + coords.y2;

            var c = Math.floor(coords.y1) === Math.floor(coords.y2) ? "L " : controlString;

            string = beginString + c + endString;


            return string;
        }

        function calculateControlPoints(coords) {
            var control = {},
                diffX = (coords.x1 < coords.x2 ? coords.x2 - coords.x1 : coords.x1 - coords.x2);

            control.x1 = Math.floor(coords.x1 + diffX);
            control.y1 = coords.y1;
            control.x2 = Math.floor(coords.x2 - diffX);
            control.y2 = coords.y2;

            return control;
        }

        initialize(conf);

        /**
         * Exposed public methods of element
         *
         * @type {{redraw: redraw, glow: glow, toBack: toBack}}
         */
        pub = {

            redraw: function (coords, strokeWidth) {
                var string = generatePathString(coords);

                pathOutter.attr({
                    path: string,
                    'stroke-width': strokeWidth + 1
                }).toBack();

                pathInner.attr({
                    path: string,
                    'stroke-width': strokeWidth
                });

                endCoords.x2 = coords.x2;
                endCoords.y2 = coords.y2;

                if (glow) {
                    this.unGlow();
                    this.glow();
                }
                
                return this;
            },

            glow: function () {
                var attr = {
                    opacity: 0.3
                };

                if (!glow) {
                    glow = pathOutter.glow(attr);
                }

                return this;
            },
            
            unGlow: function () {
                if (glow) {
                    glow.remove();
                    glow = null;
                }
            },

            remove: function () {
                if (pathInner && pathOutter) {

                    if (glow) {
                        this.unGlow();
                    }

                    pathInner.remove();
                    pathOutter.remove();
                    path.remove();
                }
            },

            mouseover: function (func,scope) {
                pathInner.mouseover(func,scope);
            },

            mouseout: function (func, scope) {
                path.mouseout(func, scope);
            },

            click: function (func, scope) {
                scope = scope || this;

                path.click(func, scope);

            },

            unclick: function () {
                path.unclick();
            },

            toBack: function () {
                pathInner.toBack();
                pathOutter.toBack();

                path.toBack();
            },

            getPath: function () {
                return path;
            },
            
            getBBox: function () {
                return path.getBBox();
            },
            
            getEndPointCoords: function () {
                return endCoords;
            }

        };

        return pub;
    }

    return new Curve(config, attributes);
};
