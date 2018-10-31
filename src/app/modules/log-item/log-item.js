var scopeHolder;

(function() {
    'use strict';

    angular.module('singApp.logitem')
        .controller('LogItemCtrl', LogItemCtrl);

    LogItemCtrl.$inject = ['$scope', '$rootScope','$sce','$resource', '$http', '$window', '$location', '$state', 'jQuery', 'authService'];

    function LogItemCtrl($scope, $rootScope, $sce, $resource, $http, $window, $location, $state, jQuery,$upload,authService) {
        $scope.dtChanged = function(dt) {
            $window.alert('Angular model changed to: ' + dt);
        };


        scopeHolder = $scope;

        $scope.print = function() {
            $window.print();
        };


        $scope.lookupItemByNumber = function(){


            $http.get("api/products?itemNumber=" + $scope.data.itemNumber)
                .then(function(response) {
                    if(response!=null&& response.data!=null) {
                        $scope.data.history.itemReceived = response.data.title;
                        if("Repair" == response.data.status){
                            $scope.data.history.repairNumber = $scope.data.itemNumber;
                        }else{
                            $scope.data.history.repairNumber = "";
                        }
                    }
                    else {
                        $scope.data.history.itemReceived = "";
                        $scope.data.history.repairNumber = "";
                    }
                });

        }





        var receivedBy = "Janet";

        if (authService && authService.getCachedProfile()) {
            receivedBy = authService.getCachedProfile().nickname;
        }

        if ($scope.itemId) {

            $resource('api/logitems/:id').get({
                 id: $scope.itemId
             }).$promise.then(function(thedata){
                 $scope.data = thedata;
                 $http.get('api/upload/'+thedata._id).
                 success(function(images) {
                     $scope.images = images;
                 });
             })

        }else{
            $scope.data = {
                history:{
                    user: receivedBy
                }
            };
        $scope.data.itemNumber = $location.search().itemNumber;
        $scope.data.history.repairNumber = $location.search().repairNumber;
        $scope.data.history.itemReceived =  $location.search().itemReceived;
        }


        $scope.addToInventory = function(){
            document.location.href = "/#/app/item/"+$scope.data._id;
        }

        $scope.go = function(data, form) {


            $http({
                method: "POST",
                url: "api/logitems/",
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

        $scope.imagesAdded = function(){
            $http.get('api/upload/'+$scope.data._id).
            success(function(images) {
                $scope.images = images;
            });
        }

        $scope.uploadFile = function(){
          alert('uploading file');
          console.log('uploading file');

         $scope.fileSelected = function(files) {
             if (files && files.length) {
                $scope.file = files[0];
                console.log('file is ' +   $scope.file);
             }

             $upload.upload({
               url: '/api/upload', //node.js route
               file: $scope.file
             })
             .success(function(data) {
               console.log(data, 'uploaded');
              });
            };
        };

        $scope.getLongDescritpion = function() {
            return 'this is a long description';
        }

        jQuery('#datetimepicker2').datetimepicker();


        $scope.rotate = function(url, direction){

            var filename = url.split("/")[2];
            if(filename.indexOf("?")>0){
                filename = filename.split("?")[0];
            }

            $http.get('api/upload/rotate/'+filename +'/'+direction).
            success(function(images) {

                $http.get('api/upload/'+$scope.data._id).
                success(function(images) {
                    $scope.images = images;
                });
            });
        }


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

        $scope.deleteLogItem = function () {

            console.log("deleting log item");

            $scope.data.history.action = "received-deleted";

            $http({
                method: "POST",
                url: "api/logitems/",
                data: angular.toJson($scope.data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {




                console.log(response.statusText);
                $state.go('app.log');


                Messenger().post({
                        message: 'Deleted log item',
                        type: "success",
                        showCloseButton: true
                    }
                );
            }, function errorCallback(response) {
                console.log(response.statusText);
            });


            /*


            $http({
                method: "DELETE",
                url: "api/logitems/" + $scope.data.history._id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {

                console.log("successful delete");


                console.log(response.statusText);
                $state.go('app.log');

                Messenger().post({
                        message: 'Deleted log item',
                        type: "success",
                        showCloseButton: true
                    }
                );

            }, function errorCallback(response) {

                console.log("failed delete");
                console.log(response.statusText);
                Messenger().post({
                        message: 'Failed to delete log item: ' +response.statusText,
                        type: "error",
                        showCloseButton: true
                    }
                );
            });
            */




        }



        var customerTableShown = false;

            $('#customerModal').on('show.bs.modal', function (e) {

              if(customerTableShown==false){

              jQuery('#customerTable').DataTable( {
                      "processing": true,
                      "serverSide": true,
                      "ordering": false,
                      "ajax": "/api/customers"
                  } );
                  customerTableShown = true;
                }
            })
    }
})();
