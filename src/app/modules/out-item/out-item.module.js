(function () {
    'use strict';

    var module = angular.module('singApp.outitem', [
        'ui.router',
        'ui.jq',
        'ui.event',
        'ngResource',
        'singApp.components.dropzone',
        'singApp.components.switchery',
        'singApp.components.holderjs',
        'angular-bootstrap-select',
        'summernote'
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
