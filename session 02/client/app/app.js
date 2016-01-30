'use strict';

var app = angular.module('app', ['ui.router','ngAnimate','ngRoute',	'appServices']);
    
  var options = {};
	options.api = {};
	options.api.base_url = "http://localhost:3001";    
    
 var USER_ROLES = {
        superUser: 1,
        admin: 2,
        member: 3,
        all:4
    };
  
  var AUTH_EVENTS = {
      notAuthorized : 'UnAuthorized',
      authorized : 'Authorized'
  }

  app.config(['$logProvider', function ($logProvider) {        
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);
    
app.directive('confirmClick', function ($window) {
  var i = 0;
  return {
    restrict: 'A',
    priority:  1,
    compile: function (tElem, tAttrs) {
      var fn = '$$confirmClick' + i++,
          _ngClick = tAttrs.ngClick;
      tAttrs.ngClick = fn + '($event)';

      return function (scope, elem, attrs) {
        var confirmMsg = attrs.confirmClick || 'Are you sure?';

        scope[fn] = function (event) {
          if($window.confirm(confirmMsg)) {
            scope.$eval(_ngClick, {$event: event});
          }
        };
      };
    }
  };
});
	
  toastr.options.timeOut = 4000;
  toastr.options.positionClass = 'toast-bottom-right';

  
  app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/dashboard', '/dashboard/overview');
    $urlRouterProvider.otherwise('/dashboard');

    $stateProvider
      .state('base', {
        abstract: true,
        url: '',
        templateUrl: 'views/base.html'
      })
      .state('login', {
          url: '/login',
          parent: 'base',
          templateUrl: 'views/login.html',
          controller: 'AdminUserCtrl'
      })
        .state('dashboard', {
          url: '/dashboard',
          parent: 'base',
          templateUrl: 'views/dashboard.html',
          controller: 'DashboardCtrl'		  
        })
			.state('overview', {
            url: '/overview',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/overview.html'
          })
          .state('reports', {
            url: '/reports',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/reports.html',
			access: { requiredAuthentication: true, authorizedRoles: [USER_ROLES.all] }
          })
           .state('reports2', {
            url: '/reports2',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/reports2.html',
			access: { requiredAuthentication: true, authorizedRoles: [USER_ROLES.all] }
          })
		  .state('admin', {
            url: '/admin',
            parent: 'dashboard',
            templateUrl: 'views/admin/admin.html',		
			access: { requiredAuthentication: true, authorizedRoles: [USER_ROLES.admin] }			
          })		  
		  .state('register', {
            url: '/register',
            parent: 'admin',
            templateUrl: 'views/admin/register.html',
			controller: 'AdminUserCtrl',
			access: { requiredAuthentication: true, authorizedRoles: [USER_ROLES.admin] }
          });		  
  });
  
  app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
  });

  app.run(function($rootScope, $state, $location, $window, AuthenticationService) {
	
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {                
		if (toState != null && toState.access != null && toState.access.requiredAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {			
			event.preventDefault();
             $state.go("login");
             return;
        } else {
            if( $window.sessionStorage.token && !AuthenticationService.isAuthenticated )
            {                            
                AuthenticationService.isAuthenticated = true; 
                AuthenticationService.username = $window.sessionStorage.currentuser;
                AuthenticationService.isAdmin = $window.sessionStorage.isAdmin;
                return;
            }
        }
        
        if (toState != null && toState.access != null && toState.access.requiredAuthentication) {						
            var authorizedRoles = toState.access.authorizedRoles;        
            if (!AuthenticationService.checkPermission(authorizedRoles)) {
                    event.preventDefault();                                        
            }            
             
        }
    });
});
