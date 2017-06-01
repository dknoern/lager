

(function() {
  'use strict';

  var module = angular.module('singApp.customer', [
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
      .state('app.customer', {
        url: '/customer',
        templateUrl: 'app/modules/customer/customer.html'
      })
  }
})();
