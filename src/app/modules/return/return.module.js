

(function() {
  'use strict';

  var module = angular.module('singApp.return', [
    'ui.router',
    'ui.jq',
    'ui.event',
    'ngResource',
    'singApp.components.dropzone',
    'angular-bootstrap-select',
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.return', {
        url: '/return/:returnId',
        templateUrl: 'app/modules/return/return.html',
        controller: function($scope, $stateParams) {
          $scope.returnId = $stateParams.returnId;
        }
      })
  }
})();
