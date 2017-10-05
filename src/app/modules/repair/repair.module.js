

(function() {
  'use strict';

  var module = angular.module('singApp.repair', [
    'ui.router',
    'ui.jq',
    'ui.event',
    'ngResource',
    'singApp.components.dropzone',
    'singApp.components.switchery',
    'singApp.components.holderjs',
    'angular-bootstrap-select',
    'summernote'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.repair', {
        url: '/repair/:repairId',
        templateUrl: 'app/modules/repair/repair.html',
        controller: function($scope, $stateParams) {
          $scope.repairId = $stateParams.repairId;
        }
      })
  }
})();
