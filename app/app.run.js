(function () {

  'use strict';

  angular
    .module('singApp')
    .run(run);

  run.$inject = ['authService'];

  function run(authService) {
    // Only schedule token renewal on app startup
    // Authentication handling is now done in CallbackController
    authService.scheduleRenewal();
  }

})();
