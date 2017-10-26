(function() {
        'use strict';

        var module = angular.module('singApp.reports', [
            'ui.router',
            'ngResource',
            'datatables',
            'datatables.bootstrap'
        ]);

        module.config(appConfig);

        appConfig.$inject = ['$stateProvider'];

        function appConfig($stateProvider) {
            $stateProvider
                .state('app.reports1', {
                    url: '/reports/1',
                    templateUrl: 'app/modules/reports/outstanding-repairs.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "outstanding-repairs";
                    }
                });

            $stateProvider
                .state('app.reports2', {
                    url: '/reports/2',
                    templateUrl: 'app/modules/reports/products-memo.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "products-memo";
                    }
                });

            $stateProvider
                .state('app.reports3', {
                    url: '/reports/3',
                    templateUrl: 'app/modules/reports/daily-sales.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "daily-sales";
                    }
                });

            $stateProvider
                .state('app.reports4', {
                    url: '/reports/4',
                    templateUrl: 'app/modules/reports/returns-summary.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "returns-summary";
                    }
                });

            $stateProvider
                .state('app.reports5', {
                    url: '/reports/5',
                    templateUrl: 'app/modules/reports/partnership-items.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "partnership-items";
                    }
                });

            $stateProvider
                .state('app.reports6', {
                    url: '/reports/6',
                    templateUrl: 'app/modules/reports/monthly-sales.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "monthly-sales";
                    }
                });

            $stateProvider
                .state('app.reports7', {
                    url: '/reports/7',
                    templateUrl: 'app/modules/reports/out-at-show.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "out-at-show";
                    }
                });


            $stateProvider
                .state('app.reports8', {
                    url: '/reports/8',
                    templateUrl: 'app/modules/reports/show-report.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "show-report";
                    }
                });




}
})();
