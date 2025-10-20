(function () {
    'use strict';

    angular.module('singApp.repair')
        .controller('RepairCtrl', RepairCtrl);

    RepairCtrl.$inject = ['$scope', '$resource', '$http', '$window', '$location', '$state', 'jQuery'];

    function RepairCtrl($scope, $resource, $http, $window, $location, $state, jQuery) {
        $scope.print = function () {
            $window.print();
        };

        $scope.email = function () {

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

                Messenger().post({
                    message: 'repair emailed to ' + document.getElementById('emailAddresses').value,
                    type: "success",
                });

            }, function errorCallback(response) {

                Messenger().post({
                    message: "unable to email repair: " + response.data.error,
                    type: "danger",
                });

            });
        }

        $scope.addItem = function (itemId) {

            $http.get("api/products/" + itemId)
                .then(function (response) {
                    $scope.data.itemId = itemId;
                    $scope.data.itemNumber = response.data.itemNumber;
                    $scope.data.repairNumber = response.data.itemNumber;
                    $scope.data.description = response.data.title;

                    $http.get('api/upload/' + $scope.data.itemId).
                        then(function (response) {
                            $scope.images = response.data;
                            $scope.data.images = response.data;
                        });
                });
        }

        if ($scope.repairId) {

            $scope.printableUrl = '/api/repairs/' + $scope.repairId + '/print?t=' + new Date().getTime();

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

                    $http.get('api/customers/' + customerId).
                        then(function (response) {
                            $scope.customer = response.data;
                            var fullName = response.data.firstName + ' ' + response.data.lastName;

                            // fill in invoice data from existing customer
                            $scope.data.customerFirstName = response.data.firstName;
                            $scope.data.customerLastName = response.data.lastName;
                            $scope.data.email = response.data.email;
                            $scope.data.phone = response.data.phone;
                            $scope.data.customerId = response.data._id;
                        });
                }

            } else {
                $http.get('api/repairs/' + $scope.repairId).
                    then(function (response) {
                        $scope.data = response.data;
                        $http.get('api/upload/' + $scope.repairId).
                            then(function (response) {
                                $scope.images = response.data;
                            });

                    });
            }

            var productId = $location.search().productId;
            if (productId != null) {
                $scope.addItem(productId);
            }
        }

        $scope.go = function () {

            $http({
                method: "POST",
                url: "api/repairs/",
                data: angular.toJson($scope.data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                $state.go('app.repairs');
            }, function errorCallback(response) {
                Messenger().post({
                    message: response.data.error,
                    type: "success"
                });
            });
        }

        $scope.customerApproved = function () {

            if ($scope.data.customerApprovedDate == null)
                $scope.data.customerApprovedDate = new Date();
            else
                $scope.data.customerApprovedDate = null
        }


        var productTableShown = false;

        $('#productModal').on('show.bs.modal', function (e) {
            if (productTableShown == false) {

                var accessToken = localStorage.getItem('access_token');

                jQuery('#productTable').dataTable({
                    "processing": true,
                    "serverSide": true,
                    "ordering": false,
                    "ajax": {
                        "url": "/api/products?modal=true",
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

        $scope.imagesAdded = function () {
            $http.get('api/upload/' + $scope.repairId).
                then(function (response) {
                    $scope.images = response.data;
                });
        }

        $scope.rotate = function (url, direction) {

            var filename = url.split("/")[2];

            if (filename.indexOf("?") > 0) {
                filename = filename.split("?")[0];
            }

            $http.get('api/upload/rotate/' + filename + '/' + direction).
                then(function (response) {

                    $http.get('api/upload/' + $scope.repairId).
                        then(function (response) {
                            $scope.images = response.data;
                        });
                });
        }

        $scope.delete = function (url) {
            $scope.selectedImage = url;
        }

        $scope.conFirmDelete = function () {

            var filenameFull = $scope.selectedImage;

            var filename = filenameFull.split("/")[2];

            if (filename.indexOf("?") > 0) {
                filename = filename.split("?")[0];
            }

            $http.delete('api/upload/delete/' + filename).then(function (response) {

                $http.get('api/upload/' + $scope.repairId).then(function (response) {
                    $scope.images = response.data;
                });

                Messenger().post({
                    message: "Image deleted.",
                    type: "success"
                });
            });
        }

    }
})();
