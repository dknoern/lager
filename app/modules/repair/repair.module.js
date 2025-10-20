(function () {
    'use strict';

    var module = angular.module('singApp.repair', [
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
            .state('app.repairnew', {
                url: '/repairs/new',
                templateUrl: 'app/modules/repair/edit-repair.html',
                controller: function ($scope, $stateParams) {
                    $scope.repairId = "new";
                }
            });

        $stateProvider
            .state('app.repairedit', {
                url: '/repairs/:repairId/edit',
                templateUrl: 'app/modules/repair/edit-repair.html',
                controller: function ($scope, $stateParams) {
                    $scope.repairId = $stateParams.repairId;
                }
            });

        $stateProvider
            .state('app.repair', {
                url: '/repairs/:repairId',
                templateUrl: 'app/modules/repair/repair.html',
                controller: function ($scope, $stateParams) {
                    $scope.repairId = $stateParams.repairId;
                }
            });
    }
})();
