

(function() {
  'use strict';

  var module = angular.module('singApp.item', [
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
      .state('app.item', {
        url: '/item',
        templateUrl: 'app/modules/item/item.html'
      });
      $stateProvider
        .state('app.new', {
          url: '/new',
          templateUrl: 'app/modules/item/new.html'
        })



  }
})();
