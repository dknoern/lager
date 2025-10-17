

(function() {
  'use strict';

  var module = angular.module('singApp.item', [
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
      .state('app.item', {
        url: '/item/:itemId',
        templateUrl: 'app/modules/item/item.html',
        controller: function($scope, $stateParams) {
          $scope.itemId = $stateParams.itemId;

        }
      });

      $stateProvider
        .state('app.edititem', {
          url: '/item/:itemId/edit',
          templateUrl: 'app/modules/item/item.html',
          controller: function($scope, $stateParams) {
            $scope.itemId = $stateParams.itemId;

          }
        });


      $stateProvider
        .state('app.newitem', {
          url: '/item',
          templateUrl: 'app/modules/item/item.html'
        })

  }


 function submitForm(){
   alert('saving item!');
 }


})();
