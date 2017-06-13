(function() {
  'use strict';

  var module = angular.module('singApp.reports', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.reports', {
        url: '/reports',
        templateUrl: 'app/modules/reports/reports.html',
        controller: 'ReportsCtrl'
      })
  }
})();
