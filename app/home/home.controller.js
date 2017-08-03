(function () {

  'use strict';

  angular
    .module('singApp')
    .controller('HomeController', homeController);

  homeController.$inject = ['authService'];

  function homeController(authService) {

    var vm = this;
    vm.auth = authService;

  }

})();
