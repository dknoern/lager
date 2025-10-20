(function () {

  'use strict';

  angular
    .module('singApp')
    .controller('CallbackController', callbackController);

  callbackController.$inject = ['authService'];

  function callbackController(authService) {
    // Handle Auth0 callback authentication
    authService.handleAuthentication();
  }

})();
