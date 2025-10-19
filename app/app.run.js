(function () {

  'use strict';

  angular
    .module('singApp')
    .run(run);

  run.$inject = ['authService'];

  function run(authService) {
    authService.handleAuthentication();
    authService.scheduleRenewal();
  }

})();
