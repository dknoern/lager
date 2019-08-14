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
                        $scope.vendor= "all";
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
                       $scope.day =0;
                       $scope.month=0;
                       $scope.year = 0;
                    }
                });

            $stateProvider
                .state('app.reports4', {
                    url: '/reports/4',
                    templateUrl: 'app/modules/reports/returns-summary.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "returns-summary";
                        $scope.month=0;
                        $scope.year = 0;
                    }
                });

            $stateProvider
                .state('app.reports5', {
                    url: '/reports/5',
                    templateUrl: 'app/modules/reports/partnership-items.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "items/sellertype/Partner";
                    }
                });



            $stateProvider
                .state('app.reports5b', {
                    url: '/reports/5b',
                    templateUrl: 'app/modules/reports/consignment-items.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "items/sellertype/Consignment";
                    }
                });

            $stateProvider
                .state('app.reports6', {
                    url: '/reports/6',
                    templateUrl: 'app/modules/reports/monthly-sales.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "monthly-sales";
                        $scope.month=0;
                        $scope.year = 0;
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

            $stateProvider
                .state('app.reports9', {
                    url: '/reports/9',
                    templateUrl: 'app/modules/reports/in-stock.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "in-stock";
                    }
                });
                $stateProvider
                .state('app.reports10', {
                    url: '/reports/10',
                    templateUrl: 'app/modules/reports/customers.html',
                    controller: function($scope, $stateParams) {
                        $scope.reportId = "customers";
                    }
                });
        }
})();
