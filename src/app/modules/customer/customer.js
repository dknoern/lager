(function() {
    'use strict';

    angular.module('singApp.customer')
        .controller('CustomerCtrl', CustomerCtrl);

    CustomerCtrl.$inject = ['$scope', '$resource', '$http', '$window', '$location', '$state', 'jQuery', 'refdataService'];

    function CustomerCtrl($scope, $resource, $http, $window, $location, $state, jQuery, refdataService) {

        $scope.states = refdataService.states();
        
        $scope.dtChanged = function(dt) {
            $window.alert('Angular model changed to: ' + dt);
        };

        if ($scope.customerId) {
            $http.get('api/customers/' + $scope.customerId).
            success(function(data) {
                $scope.data = data;
            });

            $http.get('api/customers/'+$scope.customerId +'/invoices').
            success(function(invoices) {
                $scope.invoices = invoices;
            });

            $http.get('api/customers/'+$scope.customerId + '/returns').
            success(function(returns) {
                $scope.returns = returns;
            });
        }else{
            $scope.data = {
                copyAddress: true
            };
        }


        $scope.copyAddress = function() {
            var copying = document.getElementById('copyAddress').checked;

            if(copying) {

                $scope.data.billingAddress1 = $scope.data.address1;
                $scope.data.billingAddress2 = $scope.data.address2;
                $scope.data.billingAddress3 = $scope.data.address3;
                $scope.data.billingCity = $scope.data.city;
                $scope.data.billingState = $scope.data.state;
                $scope.data.billingZip = $scope.data.zip;
                $scope.data.billingCountry = $scope.data.country;
            }
        }

            $scope.go = function() {

            $http({
                method: "POST",
                url: "api/customers/",
                data: angular.toJson($scope.data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);

                $state.go('app.customers');

            }, function errorCallback(response) {
                console.log(response.statusText);
            });

        }

        $scope.getLongDescritpion = function() {
            return 'this is a long description';
        }

        jQuery('#datetimepicker2').datetimepicker();
    }

})();
