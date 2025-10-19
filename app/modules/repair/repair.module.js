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

        $stateProvider
            .state('app.repairnew', {
                url: '/repair/new',
                templateUrl: 'app/modules/repair/edit-repair.html',
                controller: function ($scope, $stateParams) {
                    $scope.repairId = "new";
                }
            });

        $stateProvider
            .state('app.repair', {
                url: '/repair/:repairId',
                templateUrl: 'app/modules/repair/repair.html',
                controller: function ($scope, $stateParams) {
                    $scope.repairId = $stateParams.repairId;
                }
            });

        $stateProvider
            .state('app.repairedit', {
                url: '/repair/edit/:repairId',
                templateUrl: 'app/modules/repair/edit-repair.html',
                controller: function ($scope, $stateParams) {
                    $scope.repairId = $stateParams.repairId;
                }
            });
    }
})();
