// Prefer CoreJS over the polyfills above
import "core-js/es6";
import "core-js/es7/reflect";
import "ts-helpers";
require('zone.js/dist/zone');

if ('production' === ENV) {
    // Production


} else {
    // Development

    Error.stackTraceLimit = Infinity;

    require('zone.js/dist/long-stack-trace-zone');

}
