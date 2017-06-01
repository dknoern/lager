(function() {
  'use strict';

  var module = angular.module('singApp.returns', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.returns', {
        url: '/returns',
        templateUrl: 'app/modules/returns/returns.html',
        controller: 'ReturnsCtrl'
      })
  }
})();
