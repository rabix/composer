// JSandbox async.js Module
// Usage: var result = yield [[JSandbox]].async().A_SANDBOX_METHOD(data [, input]);

JSandbox.prototype.async = function () {
	var sandbox = this;
	return {
		__noSuchMethod__: function (method, args) {
			return [function ([code, input], callback) {
				sandbox[method](code, callback, input);
			}, args];
		}
	};
};
