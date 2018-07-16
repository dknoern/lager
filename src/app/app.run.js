(function () {

  'use strict';

  angular
    .module('singApp')
    .run(run);

  run.$inject = ['authService'];

  function run(authService) {
    // Handle the authentication
    // result in the hash
    authService.handleAuthentication();

    // schedule renewal if page is refreshed
    authService.scheduleRenewal();
  }

})();
