/*
 * JSandbox worker v0.2.0.4
 * 2010-01-25
 * By Elijah Grey, http://eligrey.com
 * Licensed under the X11/MIT License
 *   See LICENSE.md
 */

// This file is requested every time a new sandbox is created.
// Make sure to include a Cache-Control header when serving this over HTTP.

/*global self */

/*jslint evil: true, undef: true, eqeqeq: true, immed: true */

/*! @source http://purl.eligrey.com/github/jsandbox/blob/master/src/jsandbox-worker.js*/

(function (self, globalEval) {
    var postMessage   = self.postMessage,
        importScripts = self.importScripts,
        messageEventType  = 'message',

        messageHandler = function (event) {
            var request = event.data,
                response = {};

            response.id = request.id;

            var data = request.data;
            self.input = request.input;

            if (typeof self.input === 'object') {
                for (var key in self.input) {
                    self[key] = self.input[key];
                }
            }

            try {
                switch (request.method) {
                case 'eval': // JSLint has something against indenting cases
                    response.results = globalEval(data);
                    break;
                case 'exec':
                    importScripts('data:application/javascript,' + encodeURIComponent(data));
                    break;
                case 'load':
                    importScripts.apply(self, data);
                    break;

                }
            } catch (e) {
                response.error = {
                    name: e.name,
                    message: e.message,
                    stack: e.stack
                };
            }

            delete self.input;
            if (self.onmessage) {
                delete self.onmessage; // in case the code defined it
            }

            postMessage(response);
        };

    if (self.addEventListener) {
        self.addEventListener(messageEventType, messageHandler, false);
    } else if (self.attachEvent) { // for future compatibility with IE
        self.attachEvent('on' + messageEventType, messageHandler);
    }

    self.window = self; // provide a window object for scripts

    // dereference unsafe functions
    // some might not be dereferenced: https://bugzilla.mozilla.org/show_bug.cgi?id=512464
    self.Worker              =
        self.addEventListener    =
            self.removeEventListener =
                self.importScripts       =
                    self.XMLHttpRequest      =
                        self.postMessage         =
                            //self.dispatchEvent       =
                            // in case IE implements web workers
                            self.attachEvent         =
                                self.detachEvent         =
                                    self.ActiveXObject       =

                                        undefined;

}(self, eval));
