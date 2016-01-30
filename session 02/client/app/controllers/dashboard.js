'use strict';

angular.module('app')
  .controller('DashboardCtrl', function($scope, $location, $state, Logger) {
              
    $scope.$state = $state;
    
    $scope.pageLoaded = function() {
        Logger.logSuccess($state.current.name + " page loaded!", null, null, true)
    }	
});