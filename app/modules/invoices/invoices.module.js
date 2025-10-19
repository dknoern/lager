(function () {
  'use strict';

  var module = angular.module('singApp.invoices', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.invoices', {
        url: '/invoices',
        templateUrl: 'app/modules/invoices/invoices.html',
        controller: 'InvoicesCtrl'
      })
  }
})();
