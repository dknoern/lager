(function() {
  'use strict';

  var module = angular.module('singApp.inventory', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.inventory', {
        url: '/inventory',
        templateUrl: 'app/modules/inventory/inventory.html',
        controller: 'AngularWayCtrl',
        controllerAs: 'vm'
      })
  }
})();
