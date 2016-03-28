'use strict';

Raphael.fn.group = function () {

    var r = this,
        cfg = (arguments[0] instanceof Array) ? {} : arguments[0],
        items = (arguments[0] instanceof Array) ? arguments[0] : arguments[1];

    function Group(cfg, items) {
        var inst,
            set = r.set(items),
            group = r.raphael.vml ?
                document.createElement("group") :
                document.createElementNS("http://www.w3.org/2000/svg", "g");

        r.canvas.appendChild(group);

        function updateScale(transform, scaleX, scaleY) {
            var scaleString = 'scale(' + scaleX + ' ' + scaleY + ')';
            if (!transform) {
                return scaleString;
            }
            if (transform.indexOf('scale(') < 0) {
                return transform + ' ' + scaleString;
            }
            return transform.replace(/scale\(-?[0-9]*?\.?[0-9]*?\ -?[0-9]*?\.?[0-9]*?\)/, scaleString);
        }

        function updateRotation(transform, rotation) {
            var rotateString = 'rotate(' + rotation + ')';
            if (!transform) {
                return rotateString;
            }
            if (transform.indexOf('rotate(') < 0) {
                return transform + ' ' + rotateString;
            }
            return transform.replace(/rotate\(-?[0-9]+(\.[0-9][0-9]*)?\)/, rotateString);
        }

        function updateTranslation(transform, x, y) {
            var translateString = 'translate(' + x + ' ' + y + ')';
            if (transform.indexOf('translate(') < 0) {
                return transform + ' ' + translateString;
            }
            return transform.replace(/translate\(-?[0-9]*?\.?[0-9]*?\ -?[0-9]*?\.?[0-9]*?\)/, translateString);
        }

        inst = {
            scale: function (newScaleX, newScaleY) {
                var transform = group.getAttribute('transform') || '';
                group.setAttribute('transform', updateScale(transform, newScaleX, newScaleY));
                return this;
            },
            scaleAtPoint: function (newScaleFactor, point) {
                var trans = this.getTranslation(), scale =  1 - newScaleFactor;
                this.scale(newScaleFactor, newScaleFactor);
//                    this.translate( point.x * (1 - newScaleFactor ) + trans.x * scale,
//                            point.y * (1 - newScaleFactor ) + trans.y * scale );

            },
            getScale: function () {
                var numberPattern = /scale\((-?[0-9]*?\.?[0-9]*?)\ (-?[0-9]*?\.?[0-9]*?)\)/,
                    transform = group.getAttribute('transform'),
                    result = {}, match;

                if (transform && numberPattern.test(transform)) {
                    match = transform.match(numberPattern);

                    result.x = parseFloat(match[1]);
                    result.y = parseFloat(match[2]);

                } else {
                    result = {
                        x: 1,
                        y: 1
                    };
                }

                return result;
            },
            rotate: function (deg) {
                var transform = group.getAttribute('transform') || '';
                group.setAttribute('transform', updateRotation(transform, deg));
            },
            push: function (item) {
                function pushOneRaphaelVector(it) {
                    var i;
                    if (it.type === 'set') {
                        for (i = 0; i < it.length; i++) {
                            pushOneRaphaelVector(it[i]);
                        }
                    } else if (it.type === 'group') {
                        group.appendChild(it.node);

                        set.push(it.set);
                    } else {
                        group.appendChild(it.node);
                        set.push(it);
                    }
                }

                pushOneRaphaelVector(item);
                return this;
            },
            translate: function (newTranslateX, newTranslateY) {
                var transform = group.getAttribute('transform') || '';
                group.setAttribute('transform', updateTranslation(transform, newTranslateX, newTranslateY));
                return this;
            },

            setTranslation: function (x, y) {

                group.setAttribute('transform', 'translate(' + x + ' ' + y + ')');

                return this;
            },

            getTranslation: function () {
                var numberPattern = /translate\((-?[0-9]*?\.?[0-9]*?)\ (-?[0-9]*?\.?[0-9]*?)\)/,
                    transform = group.getAttribute('transform'),
                    result = {}, match;

                if (transform && numberPattern.test(transform)) {
                    match = transform.match(numberPattern);

                    result.x = parseFloat(match[1]);
                    result.y = parseFloat(match[2]);
                } else {
                    result = {
                        x: 0,
                        y: 0
                    };
                }

                return result;
            },

            getBBox: function () {
                return set.getBBox();
            },

            getElementBBox: function () {
                return this.node.getBBox();
            },

            toFront: function () {

                this.node.parentNode.appendChild(this.node);

                return this;
            },

            toBack: function () {

                $(this.node.parentNode).prepend(this.node);

                return this;
            },

            drag: function (onmove, onstart, onend, moveContext, startContext, endContext) {

                var start;

                function onMove(dx, dy, x, y, event) {

//                        this.translate(start.x + dx, start.y + dy);

                    if (onmove) {
                        [].push.call(arguments, start);
                        onmove.apply((moveContext ? moveContext : this), arguments);
                    }
                }

                function onStart(x, y, event) {

                    var elTransform = this.node.getCTM();

                    start = {
                        x: elTransform.e,
                        y: elTransform.f
                    };

                    if (onstart) {

                        // NOTE: 'hack' found here
                        // https://stackoverflow.com/questions/13610987/javascript-add-extra-argument
                        [].push.call(arguments, start);
                        onstart.apply((startContext ? startContext : this), arguments);
                    }
                }

                function onEnd(event) {
                    start = null;
                    if (onend) {
                        onend.apply((endContext ? endContext : this), arguments);
                    }
                }

                set.forEach(function (el) {
                    if (el.type === 'group') {
                        el.drag(onMove, onStart, onEnd, this, this, this);
                    }
                });

                set.drag(onMove, onStart, onEnd, this, this, this);
            },
            hover: function (functionIn, functionOut, scopeIn, scopeOut) {

                if (scopeIn) {
                    this.mouseover(functionIn, scopeIn);
                }

                if (scopeOut) {
                   this.mouseout(functionOut, scopeOut);
                }

                if (!scopeIn && !scopeOut) {
                    $(this.node).hover(functionIn, functionOut);
                }


                return this;
            },

            unhover: function () {
                $(this.node).unbind('mouseover').unbind('mouseout');

                return this;
            },

            mouseover: function (func, scope) {
                if (scope) {
                    $(this.node).mouseover(function () {
                        func.apply(scope, arguments);
                    });
                } else {
                    $(this.node).mouseover(func);
                }

                return this;
            },

            mouseout: function (func, scope) {
                if (scope) {
                    $(this.node).mouseout(function () {
                        func.apply(scope, arguments);
                    });
                } else {
                    $(this.node).mouseout(func);
                }

                return this;
            },

            mousedown: function (func, scope) {
                scope = scope || this;

                $(this.node).mousedown(function () {
                    func.apply(scope, arguments);
                });
            },

            mouseup: function (func, scope) {
                scope = scope || this;

                $(this.node).mouseup(function () {
                    func.apply(scope, arguments);
                });
            },

            unbindMouse: function () {
                $(this.node).unbind('mousedown mouseup');
                return this;
            },

            click: function (func, scope) {
                $(this.node).click(function () {
                    func.apply(scope ? scope : this, arguments);
                });
            },

            unclick: function () {
                $(this.node).unbind('click');
                return this;
            },

            keyup: function (func, scope) {
                scope = scope || this;

                $(this.node).bind('keypress',function () {
                    func.apply(scope, arguments);
                });
            },

            unkeyup: function () {
                $(this.node).unbind('click');
                return this;
            },

            remove: function () {
                $(this.node).unbind();
                set.remove();
            },

            set: set,
            type: 'group',
            node: group
        };

        return inst;
    }

    return new Group(cfg, items);
};
