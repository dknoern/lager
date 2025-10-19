(function () {
  'use strict';

  angular
    .module('singApp.core')
    .controller('App', AppController)
    .factory('jQuery', jQueryService)
    .factory('$exceptionHandler', exceptionHandler)
    ;

  AppController.$inject = ['config', '$scope', '$localStorage', '$state', 'authService'];
  function AppController(config, $scope, $localStorage, $state, authService) {

    var vm = this;

    vm.title = config.appTitle;

    vm.auth = authService;
    vm.profile = null;

    // Initialize profile data
    function loadProfile() {
      var cachedProfile = authService.getCachedProfile();
      if (cachedProfile) {
        vm.profile = cachedProfile;
      } else if (authService.isAuthenticated()) {
        // Only try to load profile if user is authenticated
        authService.getProfile(function (err, profile) {
          if (!err && profile) {
            vm.profile = profile;
            $scope.$apply();
          }
        });
      }
    }

    // Load profile immediately
    loadProfile();

    // Watch for authentication state changes
    $scope.$watch(function() {
      return authService.isAuthenticated();
    }, function(isAuth) {
      if (isAuth && !vm.profile) {
        loadProfile();
      }
    });

    $scope.profile = vm.auth.profile;

    $scope.app = config;
    $scope.$state = $state;

    if (angular.isDefined($localStorage.state)) {
      $scope.app.state = $localStorage.state;
    } else {
      $localStorage.state = $scope.app.state;
    }
  }

  jQueryService.$inject = ['$window'];

  function jQueryService($window) {
    return $window.jQuery; // assumes jQuery has already been loaded on the page
  }

  exceptionHandler.$inject = ['$log', '$window', '$injector'];
  function exceptionHandler($log, $window, $injector) {
    return function (exception, cause) {
      var errors = $window.JSON.parse($window.localStorage.getItem('sing-2-angular-errors')) || {};
      errors[new Date().getTime()] = arguments;
      $window.localStorage.setItem('sing-2-angular-errors', $window.JSON.stringify(errors));
      if ($injector.get('config').debug) {
        $log.error.apply($log, arguments);
        console.error('Angular error caught:', exception, 'Cause:', cause);
      }
    };
  }
})();
