(function() {
  'use strict';

  var module = angular.module('singApp.customers', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.customers', {
        url: '/customers',
        templateUrl: 'app/modules/customers/customers.html',
        controller: 'CustomersCtrl'
      })
  }
})();
