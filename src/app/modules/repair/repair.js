(function() {
    'use strict';

    angular.module('singApp.repair')
        .controller('RepairCtrl', RepairCtrl);

    RepairCtrl.$inject = ['$scope', '$resource', '$http', '$window', '$location', '$state', 'jQuery'];

    function RepairCtrl($scope, $resource, $http, $window, $location, $state, jQuery) {
        $scope.dtChanged = function(dt) {
            $window.alert('Angular model changed to: ' + dt);
        };

        $scope.print = function() {
            $window.print();
        };
        
        $scope.email = function() {

            $http({
                method: "POST",
                url: "api/repairs/email",
                data: {
                    emailAddresses: document.getElementById('emailAddresses').value,
                    repairId: $scope.data._id,
                    note: document.getElementById('note').value
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);

                Messenger().post({
                    message: 'repair emailed to '+ document.getElementById('emailAddresses').value,
                    type: "success",
                });

            }, function errorCallback(response) {

                Messenger().post({
                    message: "unable to email repair: " + response.data.error,
                    type: "error",
                });

            });
        }

        $scope.addItem = function(itemId) {
            console.log('setting item id to ' + itemId);

            $http.get("api/products/" + itemId)
                .then(function(response) {
                    $scope.data.itemId = itemId;
                    $scope.data.itemNumber = response.data.itemNumber;
                    $scope.data.repairNumber = response.data.itemNumber;
                    $scope.data.description = response.data.title;

                    $http.get('api/upload/' + $scope.data.itemId).
                    success(function(images) {
                        $scope.images = images;
                    });
                });
        }

        if ($scope.repairId) {

            $scope.printableUrl = '/api/repairs/' + $scope.repairId + '/print?t='+ new Date().getTime();

            if ("new" == $scope.repairId) {
                var dateOut = Date.now();
                var expectedReturnDate = new Date();
                expectedReturnDate.setDate(expectedReturnDate.getDate() + 21);

                $scope.data = {
                    dateOut: Date.now(),
                    expectedReturnDate: expectedReturnDate
                };

                var customerId = $location.search().customerId;
                if (customerId != "new") {

                    console.log("existing invoice, copying customer data");

                    $http.get('api/customers/' + customerId).
                    success(function(customer) {
                        $scope.customer = customer;
                        var fullName = customer.firstName + ' ' + customer.lastName;

                        // fill in invoice data from existing customer
                        $scope.data.customerFirstName = customer.firstName;
                        $scope.data.customerLastName = customer.lastName;
                        $scope.data.email = customer.email;
                        $scope.data.phone = customer.phone;
                        $scope.data.customerId = customer._id;
                    });
                }

            } else {
                $http.get('api/repairs/' + $scope.repairId).
                success(function(data) {
                    $scope.data = data;
                    if ($scope.data.itemId != null) {
                        $http.get('api/upload/' + $scope.data.itemId).
                        success(function(images) {
                            $scope.images = images;
                        });
                    }

                });
            }

            var productId = $location.search().productId;
            if (productId != null) {
                $scope.addItem(productId);
            }
        }

        $scope.go = function() {

            $http({
                method: "POST",
                url: "api/repairs/",
                data: angular.toJson($scope.data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);
                $state.go('app.repairs');
            }, function errorCallback(response) {
                console.log(response.statusText);
                Messenger().post({
                    message: response.data.error,
                    type: "success"
                });
            });
        }

        $scope.toggleOutForRepair = function() {

            var itemNumber =  $scope.data.itemNumber || '';
            var repairNumber =  $scope.data.repairNumber || '';
            var itemReceived =  $scope.data.description || '';

            var logItemUrl = "/#/app/log-item"
            + "?itemNumber=" + itemNumber
            + "&repairNumber=" + repairNumber
            + "&itemReceived=" + itemReceived;

            $window.location=logItemUrl;
        }

        var productTableShown = false;

        $('#productModal').on('show.bs.modal', function(e) {
            if (productTableShown == false) {

                var accessToken = localStorage.getItem('access_token');

                jQuery('#productTable').dataTable({
                    "processing": true,
                    "serverSide": true,
                    "ordering": false,
                    "ajax": {
                        "url": "/api/products",
                        headers: {
                            "Authorization": "Bearer " + accessToken
                        },
                        "data": {
                            "status": "In Stock",
                        }
                    }
                });
                productTableShown = true;
            }
        })

        jQuery('#datetimepicker2').datetimepicker();
    }
})();
