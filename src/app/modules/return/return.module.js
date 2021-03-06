

(function() {
  'use strict';

  var module = angular.module('singApp.return', [
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
      .state('app.return', {
        url: '/return/:returnId',
        templateUrl: 'app/modules/return/return.html',
        controller: function($scope, $stateParams) {
          $scope.returnId = $stateParams.returnId;
        }
      })
  }
})();
