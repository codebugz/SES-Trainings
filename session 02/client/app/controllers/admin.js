'use strict';

var controllerId = 'Admin';
angular.module('app')
  .controller('AdminUserCtrl', function($scope, $sce, $window, $location, UserService, AuthenticationService, Logger) {
	$scope.users = [];
	   	

	$scope.isAuthenticated = function() {
		$scope.isLogin = AuthenticationService.isAuthenticated;
        $scope.currentuser = AuthenticationService.isAuthenticated ? AuthenticationService.username : null;        
	},
	       
	$scope.allUsers = function() {										
		UserService.findAll().then(function successCallback(response) {
			
			var data = response.data;
			for (var uKey in data) {
				data[uKey].content = $sce.trustAsHtml(data[uKey].content);
			}					
			
            Logger.logSuccess("Admin control panel loaded!", null, null, true)			
			$scope.users = data;
		}, function errorCallback(error) {
            Logger.logError(error.statusText, null, null, true)
		});
				
	},
	
    $scope.submit = function(username, password) {
		  //var log = Logger.getLogFn(controllerId, 'success');										
		  if(username != null && password != null) {			  
			  UserService.signIn(username, password).then(function successCallback(response) {				  
				    
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = response.data.token;
                    $window.sessionStorage.currentuser = response.data.profile.username;
                    $window.sessionStorage.isAdmin = response.data.profile.is_admin;
                    AuthenticationService.setCurrentUser(response.data.profile);                    	
					Logger.logSuccess("You have Logged in successfully!", null, null, true)                    				
                    $location.path('/dashboard');				  
			  }, function errorCallback(error) {
                    Logger.logError(error.statusText, null, null, true)
              });
			  
		  }
		  
	 }
	 
	 $scope.logOut = function logOut() {
			
            if (AuthenticationService.isAuthenticated) {                
                UserService.logOut().then(function successCallback(data) {
                    AuthenticationService.isAuthenticated = false;
                    delete $window.sessionStorage.token;
                    delete $window.sessionStorage.currentuser;
                    delete $window.sessionStorage.isAdmin;
                    Logger.logSuccess("Logout successfull!", null, null, true);
                    $location.path("/login");
                }, function errorCallback(error) {
                    Logger.logError(error.statusText, null, null, true);                    
                });
            }
            else {
                $location.path("/login");				
            }
        }
		
		$scope.register = function register(username, password, passwordConfirm) {
            if (AuthenticationService.isAuthenticated) {
                UserService.register(username, password, passwordConfirm).then(function successCallback(data) {
                    Logger.logSuccess("New user was created!", null, null, true);
                    $location.path("/admin");
                }, function errorCallback(error) {
                    Logger.logError(error.statusText, null, null, true);
                });
            }
            else {
                $location.path("/login");
            }
        }
        
        $scope.deleteUser = function(id) {
             if (AuthenticationService.isAuthenticated) {                
                UserService.delete(id).then(function successCallback() {
                    var users = $scope.users;
                    for (var userKey in users) {
                        if (users[userKey]._id == id) {
                            $scope.users.splice(userKey, 1);
                            break;
                        }
                    }
                    Logger.logSuccess("Delete succeeded!", null, null, true);                    
                }, function errorCallback(error) {
                    Logger.logError(error.statusText, null, null, true);                    
                });
            }
            else {
                $location.path("/login");				
            }
        }
      
     return false;

  });
