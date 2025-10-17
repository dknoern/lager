(function () {
    'use strict';

    var module = angular.module('singApp.outitem', [
        'ui.router',
        'ui.jq',
        'ui.event',
        'ngResource',
        'singApp.components.dropzone',
        'angular-bootstrap-select',
    ]);

    module.config(appConfig);

    appConfig.$inject = ['$stateProvider'];

    function appConfig($stateProvider) {

        $stateProvider
            .state('app.newoutitem', {
                url: '/out-item',
                templateUrl: 'app/modules/out-item/out-item.html',
                controllerAs: 'vm'
            });

        $stateProvider
            .state('app.outitem', {
                url: '/out-item/:itemId',
                templateUrl: 'app/modules/out-item/out-item.html',
                controller: function ($scope, $stateParams) {
                    $scope.itemId = $stateParams.itemId;

                }
            });
    }
})();
