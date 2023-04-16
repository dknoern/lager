var scopeHolder;

(function () {
    'use strict';

    angular.module('singApp.outitem')
        .controller('OutItemCtrl', OutItemCtrl);

    OutItemCtrl.$inject = ['$scope', '$resource', '$http', '$location', '$window', '$state', 'jQuery', 'authService'];

    function OutItemCtrl($scope, $resource, $http, $location, $window, $state, jQuery, authService, $upload) {
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
            $resource('api/outs/:id').get({
                id: $scope.itemId
            }).$promise.then(function (thedata) {
                $scope.data = thedata;

                if (thedata.itemNumber != null) {
                    console.log('itemNumber=', thedata.itemNumber);
                } else {
                    console.log('no itemNumber=');
                }

                var imagesKey = thedata._id; // newer log or older log with no itemNumbers

                $http.get('api/upload/' + imagesKey).
                    success(function (images) {
                        $scope.images = images;
                    });
            })

        } else {
            $scope.data = {
                "user": receivedBy
            };
        }

        $scope.go = function (data, form) {

            $http({
                method: "POST",
                url: "api/outs/",
                data: angular.toJson($scope.data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);
                $state.go('app.out');
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


        $scope.delete = function (url) {
            $scope.selectedImage = url;
        }

        $scope.conFirmDelete = function () {

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
    }
})();
