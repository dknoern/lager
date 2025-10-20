(function () {
    'use strict';

    var module = angular.module('singApp.logitem', [
        'ui.router',
        'ui.event',
        'ngResource',
        'singApp.components.dropzone',
        'ui.select',
    ]);

    module.config(appConfig);

    appConfig.$inject = ['$stateProvider'];

    function appConfig($stateProvider) {
        // Order matters: more specific routes must come first
        $stateProvider
            .state('app.mewlogitem', {
                url: '/logs/new',
                templateUrl: 'app/modules/log-item/log-new.html',
                controllerAs: 'vm'
            });

        $stateProvider
            .state('app.logitem', {
                url: '/logs/:itemId',
                templateUrl: 'app/modules/log-item/log-new.html',
                controller: function ($scope, $stateParams) {
                    $scope.itemId = $stateParams.itemId;

                }
            });
    }
})();
