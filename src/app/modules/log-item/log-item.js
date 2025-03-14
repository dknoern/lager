var scopeHolder;

(function () {
    'use strict';

    angular.module('singApp.logitem')
        .controller('LogItemCtrl', LogItemCtrl);

    LogItemCtrl.$inject = ['$scope', '$resource', '$http', '$location','$window', '$state', 'jQuery', 'authService'];

    function LogItemCtrl($scope, $resource, $http, $location, $window, $state, jQuery, authService, $upload) {
        $scope.dtChanged = function (dt) {
            $window.alert('Angular model changed to: ' + dt);
        };

        scopeHolder = $scope;

        $scope.print = function () {
            $window.print();
        };

        var receivedBy = "";

        if (authService != null && authService.getCachedProfile() != null && authService.getCachedProfile().name != null) {
            var receivedBy = authService.getCachedProfile().name;
            if (receivedBy != null && receivedBy.length > 0 && receivedBy.indexOf("@") > 0) {
                receivedBy = receivedBy.substring(0, receivedBy.indexOf("@")).toLowerCase();
            }
        }

        if ($scope.itemId) {
            $resource('api/logs/:id').get({
                id: $scope.itemId
            }).$promise.then(function (thedata) {
                $scope.data = thedata;


                if(thedata.itemNumber!=null){
                    console.log('itemNumber=',thedata.itemNumber);
                }else{
                    console.log('no itemNumber=');
                }

                const logRedoDate = new Date('2023-01-07');
                const logDate = new Date(thedata.date);

                console.log('logRedoDate',logRedoDate);
                console.log('logDate',new Date(thedata.date));

                var imagesKey = thedata._id; // newer log or older log with no itemNumbers

                if(logDate < logRedoDate){
                    console.log('pre-dates log redo');
                    $scope.data.oldLog=true;

                    if(thedata.lineItems!=null&&thedata.lineItems.length==1&&thedata.lineItems[0].itemNumber!=null){
                        imagesKey = thedata.lineItems[0].productId;
                        console.log("using productId for images");
                    }
                }else{
                    $scope.data.oldLog=false;
                }

                $http.get('api/upload/' + imagesKey).
                    success(function (images) {
                        $scope.images = images;
                    });
            })

        }else{
            $scope.data = {
                "user": receivedBy
            };
        }

        // pre-fill single item if comming from repair screen.
        if ($location.search().itemNumber != null || $location.search().repairNumber != null || $location.search().itemReceived) {

            $scope.data.lineItems =
                [
                    {
                        itemNumber: $location.search().itemNumber,
                        repairNumber: $location.search().repairNumber,
                        name: $location.search().itemReceived,
                        repairId: $location.search().repairId
                    }
                ]
        }

        $scope.go = function (data, form) {

            $http({
                method: "POST",
                url: "api/logs/",
                data: angular.toJson($scope.data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);
                $state.go('app.log');
            }, function errorCallback(response) {
                console.log(response.statusText);
            });
        }

        $scope.imagesAdded = function () {
            $http.get('api/upload/' + $scope.data._id).
                success(function (images) {
                    $scope.images = images;
                });
        }

        $scope.uploadFile = function () {
            alert('uploading file');
            console.log('uploading file');

            $scope.fileSelected = function (files) {
                if (files && files.length) {
                    $scope.file = files[0];
                    console.log('file is ' + $scope.file);
                }

                $upload.upload({
                    url: '/api/upload', //node.js route
                    file: $scope.file
                })
                    .success(function (data) {
                        console.log(data, 'uploaded');
                    });
            };
        };


        $scope.delete = function(url){
            $scope.selectedImage = url;
        }

        $scope.conFirmDelete = function() {

            var filenameFull = $scope.selectedImage;

            var filename = filenameFull.split("/")[2];


            if (filename.indexOf("?") > 0) {
                filename = filename.split("?")[0];
            }

            $http.delete('api/upload/delete/' + filename).success(function () {

                $http.get('api/upload/' + $scope.itemId).success(function (images) {
                    $scope.images = images;
                });

                Messenger().post({
                    message: "Image deleted.",
                    type: "success"
                });
            });

        }

        $scope.getLongDescritpion = function () {
            return 'this is a long description';
        }

        jQuery('#datetimepicker2').datetimepicker();

        $scope.rotate = function (url, direction) {

            var filename = url.split("/")[2];
            if (filename.indexOf("?") > 0) {
                filename = filename.split("?")[0];
            }

            $http.get('api/upload/rotate/' + filename + '/' + direction).
                success(function (images) {

                    $http.get('api/upload/' + $scope.data._id).
                        success(function (images) {
                            $scope.images = images;
                        });
                });
        }

        $scope.addItem = function (itemId) {

            console.log('addItem, itemId = ' + itemId);
            $http.get("api/products/" + itemId)
                .then(function (response) {

                    var lineItem = {
                        name: response.data.title,
                        itemNumber: response.data.itemNumber,
                        productId: response.data._id
                    }

                    console.log('adding item', response.data.title);
                    console.log('itemNumber', response.data.itemNumber);

                    if ($scope.data.lineItems == null) {
                        $scope.data.lineItems = new Array();
                    }
                    $scope.data.lineItems.push(lineItem);

                });

            $('#productModal').modal('hide');
        }

        $scope.addMisc = function () {
            console.log('adding misc item');
            var lineItem = {
                name: ""
            }
            console.log('adding misc item');
            if ($scope.data.lineItems == null) {
                $scope.data.lineItems = new Array();
            }
            $scope.data.lineItems.push(lineItem);
        }

        $scope.addRepair = function (repairId) {
            $http.get("api/repairs/" + repairId)
                .then(function (response) {

                    var lineItem = {
                        name: response.data.description,
                        itemNumber: response.data.itemNumber,
                        repairNumber: response.data.repairNumber,
                        repairId: response.data._id,
                        productId: response.data.itemId,
                        repairCost: 0
                    }

                    if($scope.data.customerName == null) {
                        $scope.data.customerName = response.data.customerFirstName + ' ' + response.data.customerLastName;
                    }
                    console.log('adding repair', response.data.title);

                    if ($scope.data.lineItems == null) {
                        $scope.data.lineItems = new Array();
                    }
                    $scope.data.lineItems.push(lineItem);

                });

            $('#repairModal').modal('hide');
        }

        $scope.removeItem = function(index) {
            $scope.data.lineItems.splice(index, 1);
        }

        var productTableShown = false;
        $('#productModal').on('show.bs.modal', function (e) {
            if (productTableShown == false) {
                var accessToken = localStorage.getItem('access_token');
                jQuery('#productTable').dataTable({
                    "processing": true,
                    "serverSide": true,
                    "ordering": true,
                    "ajax": {
                        "url": "/api/products",
                        "data": {
                            "status": "Out" 
                        },
                        "headers": {
                            "Authorization": "Bearer " + accessToken
                        }
                    },
                    "order": [[5, 'desc']]
                });
                productTableShown = true;
            }
        })

        var repairTableShown = false;
        $('#repairModal').on('show.bs.modal', function (e) {
            if (repairTableShown == false) {
                var accessToken = localStorage.getItem('access_token');
                jQuery('#repairTable').dataTable({
                    "processing": true,
                    "serverSide": true,
                    "ordering": true,
                    "ajax": {
                        "url": "/api/repairs?filter=outstanding",
                        "headers": {
                            "Authorization": "Bearer " + accessToken
                        }
                    },
                    "order": [[5, 'desc']]
                });
                repairTableShown = true;
            }
        })
    }
})();
