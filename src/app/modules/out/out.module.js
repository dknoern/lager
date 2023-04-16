(function () {
  'use strict';

  var module = angular.module('singApp.out', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.out', {
        url: '/out',
        templateUrl: 'app/modules/out/out.html',
        controller: 'OutCtrl',
        controllerAs: 'vm'
      })
  }
})();
