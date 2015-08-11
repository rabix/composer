/**
 * Created by Maya on 10.8.15.
 */

class LoginController {
	constructor($http) {
		this.$http = $http;
	}

	me () {
        this.$http.get('/api/users/me').then(function (s) {
	        console.log(s);
        });
	}
}

angular.module('cottontail').controller('LoginController', LoginController);


export default LoginController;
