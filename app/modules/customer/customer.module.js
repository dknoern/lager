

(function() {
  'use strict';

  var module = angular.module('singApp.customer', [
    'ui.router',
    'ui.event',
    'ngResource',
    'singApp.components.dropzone',
    'ui.select',
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.customer', {
        url: '/customers/:customerId',
        templateUrl: 'app/modules/customer/customer.html',
        controller: function($scope, $stateParams) {
          $scope.customerId = $stateParams.customerId;

        }
      });

      $stateProvider
        .state('app.newcustomer', {
          url: '/customers/new',
          templateUrl: 'app/modules/customer/customer.html'
        })
  }

})();
