

(function() {
  'use strict';

  var module = angular.module('singApp.invoice', [
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
      .state('app.invoice', {
        url: '/invoice/edit/:invoiceId',
        templateUrl: 'app/modules/invoice/invoice.html',
        controller: function($scope, $stateParams) {
          $scope.invoiceId = $stateParams.invoiceId;

        }
      });


        $stateProvider
          .state('app.bro2', {
            url: '/invoice/:invoiceId',
            templateUrl: 'app/modules/invoice/extra-invoice.html',
            controller: function($scope, $stateParams) {
              $scope.invoiceId = $stateParams.invoiceId;
            }
          });



  }
})();
