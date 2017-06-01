(function() {
  'use strict';

  var module = angular.module('singApp.repairs', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.repairs', {
        url: '/repairs',
        templateUrl: 'app/modules/repairs/repairs.html',
        controller: 'RepairsCtrl'
      })
  }
})();
