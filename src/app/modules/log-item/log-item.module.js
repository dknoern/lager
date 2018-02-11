

(function() {
  'use strict';

  var module = angular.module('singApp.logitem', [
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
          .state('app.mewlogitem', {
              url: '/log-item',
              templateUrl: 'app/modules/log-item/log-new.html'
          });

      $stateProvider
          .state('app.logitem', {
              url: '/log-item/:itemId',
              templateUrl: 'app/modules/log-item/log-new.html',
              controller: function($scope, $stateParams) {
                  $scope.itemId = $stateParams.itemId;

              }
          });
  }


 function submitForm(){
   alert('saving item!');
 }


})();
