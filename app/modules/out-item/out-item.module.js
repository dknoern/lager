(function () {
    'use strict';

    var module = angular.module('singApp.outitem', [
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
            .state('app.newoutitem', {
                url: '/outs/new',
                templateUrl: 'app/modules/out-item/out-item.html',
                controllerAs: 'vm'
            });

        $stateProvider
            .state('app.outitem', {
                url: '/outs/:itemId',
                templateUrl: 'app/modules/out-item/out-item.html',
                controller: function ($scope, $stateParams) {
                    $scope.itemId = $stateParams.itemId;

                }
            });
    }
})();
