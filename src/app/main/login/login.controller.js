/**
 * Created by Maya on 10.8.15.
 */

class LoginController {
	constructor($http) {
		this.$http = $http;
	}

	gitHub () {
		this.$http.get('http://localhost:9000/auth/github', function(success) {
			console.log(success);
		}, function(err) {
			console.log(err);
		})
	}
}

angular.module('cottontail').controller('LoginController', LoginController);


export default LoginController;
