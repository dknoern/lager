(function () {
  'use strict';

  var module = angular.module('singApp.log', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.log', {
        url: '/log',
        templateUrl: 'app/modules/log/log.html',
        controller: 'LogCtrl',
        controllerAs: 'vm'
      })
  }
})();
