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

            console.log('calling toggleOutForRepair');

            if ($scope.data.returnDate == null) {
                console.log('return date is null');

                Messenger().post({
                    message: "flagging item <i>back from repair</i>",
                    type: "success"
                });

                // so its shown updating just before dissapearing
                $scope.data.returnDate = new Date();

                $http({
                    method: "PUT",
                    url: "api/repairs/"+$scope.data._id+"/return"
                }).then(function successCallback(response) {
                    console.log(response.statusText);
                    document.location.href = "/#/app/repairs";
                }, function errorCallback(response) {
                    console.log(response.statusText);
                });
            } else {
                console.log('return date is ' + $scope.data.returnDate);
            }
        }


        var productTableShown = false;

        $('#productModal').on('show.bs.modal', function(e) {
            if (productTableShown == false) {
                jQuery('#productTable').dataTable({
                    "processing": true,
                    "serverSide": true,
                    "ordering": false,
                    "ajax": {
                        "url": "/api/products",
                        "data": {
                            "status": "In Stock"
                        }
                    }
                });
                productTableShown = true;
            }
        })


        jQuery('#datetimepicker2').datetimepicker();
    }
})();
