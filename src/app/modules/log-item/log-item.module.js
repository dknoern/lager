

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
        .state('app.logitem', {
          url: '/log-item',
          templateUrl: 'app/modules/log-item/log-new.html'
        });
  }


 function submitForm(){
   alert('saving item!');
 }


})();
