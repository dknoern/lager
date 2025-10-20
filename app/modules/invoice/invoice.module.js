(function () {
    'use strict';

    var module = angular.module('singApp.invoice', [
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
            .state('app.newinvoice', {
                url: '/invoices/new/edit',
                templateUrl: 'app/modules/invoice/invoice.html',
                controller: function ($scope, $location) {
                    $scope.invoiceId = 'new';
                    // Handle customerId from query params
                    var customerId = $location.search().customerId;
                    if (customerId) {
                        $scope.customerId = customerId;
                    }
                }
            });

        $stateProvider
            .state('app.invoice', {
                url: '/invoices/:invoiceId/edit',
                templateUrl: 'app/modules/invoice/invoice.html',
                controller: function ($scope, $stateParams) {
                    $scope.invoiceId = $stateParams.invoiceId;

                }
            });

        $stateProvider
            .state('app.extrainvoice', {
                url: '/invoices/:invoiceId',
                templateUrl: 'app/modules/invoice/extra-invoice.html',
                controller: function ($scope, $stateParams) {
                    $scope.invoiceId = $stateParams.invoiceId;
                }
            });

        $stateProvider
            .state('app.partnerinvoice', {
                url: '/partnerinvoice/:productId',
                templateUrl: 'app/modules/invoice/extra-invoice.html',
                controller: function ($scope, $stateParams) {
                    $scope.productId = $stateParams.productId;
                }
            });

        $stateProvider
            .state('app.consignmentinvoice', {
                url: '/consignmentinvoice/:productId',
                templateUrl: 'app/modules/invoice/extra-invoice.html',
                controller: function ($scope, $stateParams) {
                    $scope.productId = $stateParams.productId;
                }
            });
    }
})();
