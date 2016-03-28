/**
 * Created by filip on 4.6.14..
 */

'use strict';

Raphael.fn.button = function (config, cb) {
    var r = this,
        callbacks = {};

    config.border = config.border || 4;

    callbacks.onClick = (cb && typeof cb.onClick === 'function') ? cb.onClick : null;
    callbacks.scope = (typeof cb.scope !== 'undefined') ? cb.scope : this;

    function Button(conf, callbacks) {

        var pub, button, click = callbacks.onClick, disabled = false;

        function initialize() {
            var group = r.group(),
                outer, inner;

            outer = r.circle(0, 0, conf.radius);
            outer.attr({
                fill: conf.borderFill || '#EBEBEB',
                stroke: conf.borderStroke || '#C8C8C8'
            });

            inner = r.circle(0, 0, conf.radius - conf.border);
            inner.attr({
                fill: conf.fill,
                stroke: 'none'
            });

            if (typeof conf.image !== 'undefined') {

                var x, y, img, fake, width, height;

                fake = new Image();
                fake.src = conf.image.url;

                $(fake).load(function () {
                    if (group) {
                        width = conf.image.width || fake.width;
                        height = conf.image.height ||  fake.height;

                        x = - width / 2;
                        y =  - height / 2;

//                        x = - conf.image.width / 2;
//                        y =  - conf.image.height / 2;

                        img = r.image(conf.image.url, x, y, width, height);
                        group.push(img)
                    }
                })

            }

            group.push(outer).push(inner);

            group.translate(conf.x, conf.y);

            group.node.setAttribute('class', 'svg-buttons');

            button = group;

            initHandlers();
        }

        function initHandlers() {
            if (callbacks.onClick) {
                button.click(callbacks.onClick, callbacks.scope);
            }
        }

        initialize();

        pub = {

            remove: function() {
                if (click) {
                    button.unclick();
                }
                button.remove();
            },

            translateX: function (x) {
                button.setTranslation(x, button.getTranslation().y);
            },

            getEl: function () {
                return button;
            },

            disable: function (shouldDisable) {
                disabled = shouldDisable;
            },

            isDisabled: function () {
                return disabled;
            }

        };

        return pub;
    }

    return new Button(config, callbacks);
};
