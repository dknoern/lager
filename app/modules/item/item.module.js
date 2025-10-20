(function () {
  'use strict';

  var module = angular.module('singApp.item', [
    'ui.router',
    'ui.event',
    'ngResource',
    'singApp.components.dropzone',
    'ui.select',
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.item', {
        url: '/products/:itemId',
        templateUrl: 'app/modules/item/item.html',
        controller: function ($scope, $stateParams) {
          $scope.itemId = $stateParams.itemId;

        }
      });

    $stateProvider
      .state('app.edititem', {
        url: '/products/:itemId/edit',
        templateUrl: 'app/modules/item/item.html',
        controller: function ($scope, $stateParams) {
          $scope.itemId = $stateParams.itemId;

        }
      });

    $stateProvider
      .state('app.newitem', {
        url: '/products/new',
        templateUrl: 'app/modules/item/item.html'
      })
  }
})();
