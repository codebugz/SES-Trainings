'use strict'

var appServices = angular.module('appServices', []);
appServices.factory('AuthenticationService', function(Logger) {
    var auth = {
        username: null,
        isAuthenticated: false,
        isAdmin: false,
        checkPermission: checkPermission,
        setCurrentUser: setCurrentUser        
    }

    return auth;
    
    function setCurrentUser(userProfile) {
        auth.username = userProfile.username;
        auth.isAdmin = userProfile.is_admin;        
    }
    
    function checkPermission(authorizedRoles) {
        var userRole = auth.isAdmin ? USER_ROLES.admin : USER_ROLES.member;
        if (authorizedRoles.indexOf(userRole) !== -1 || authorizedRoles.indexOf(USER_ROLES.all) !== -1) {
            return true;    
        }
        
        Logger.logError("User attempted to access page for which he is not authorized", null, null, true);
        return false
        
    }
});

appServices.factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService, Logger) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function (response) {			
            if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {	
			
            if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
                delete $window.sessionStorage.token;
                AuthenticationService.isAuthenticated = false;																
				if(rejection.data == "UnauthorizedError: jwt expired") {
                    rejection.statusText = 'UnauthorizedError: token has expired.'
                }
                
				$location.path("/login");					
				
            }
						
            return $q.reject(rejection);
        }
    };
});

appServices.factory('UserService', function ($http) {
    return {
		findAll: function() {
            return $http.get(options.api.base_url + '/user/all');
        },
        
        signIn: function(username, password) {
            return $http.post(options.api.base_url + '/user/signin', {username: username, password: password});
        },

        logOut: function() {
            return $http.get(options.api.base_url + '/user/logout');
        },
		register: function(username, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/user/register', {username: username, password: password, passwordConfirmation: passwordConfirmation });
        },
        delete: function(id) {
            return $http.delete(options.api.base_url + '/user/' + id)
        }
    }
});