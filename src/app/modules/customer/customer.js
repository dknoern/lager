(function() {
    'use strict';

    angular.module('singApp.customer')
        .controller('CustomerCtrl', CustomerCtrl);

    CustomerCtrl.$inject = ['$scope', '$resource', '$http', '$window', '$location', '$state', 'jQuery'];

    function CustomerCtrl($scope, $resource, $http, $window, $location, $state, jQuery) {
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
        }



        $scope.copyAddress = function() {
           var copying = document.getElementById('copyAddress').checked;
          alert('copy address ' + copying);
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
