

(function() {
  'use strict';

  var module = angular.module('singApp.return', [
    'ui.router',
    'ui.event',
    'ngResource',
    'singApp.components.dropzone',
    'ui.select',
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    // Order matters: more specific routes must come first
    $stateProvider
      .state('app.newreturn', {
        url: '/returns/new',
        templateUrl: 'app/modules/return/return.html',
        controller: function($scope, $location) {
          $scope.returnId = 'new';
          // Handle invoiceId from query params
          var invoiceId = $location.search().invoiceId;
          if (invoiceId) {
            $scope.invoiceId = invoiceId;
          }
        }
      });

    $stateProvider
      .state('app.return', {
        url: '/returns/:returnId',
        templateUrl: 'app/modules/return/return.html',
        controller: function($scope, $stateParams) {
          $scope.returnId = $stateParams.returnId;
        }
      })
  }
})();
