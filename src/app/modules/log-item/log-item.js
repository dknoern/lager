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
                    if(response!=null&& response.data!=null)
                        $scope.data.history.itemReceived = response.data.title;
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
        }

        $scope.addToInventory = function(){
            document.location.href = "/#/app/item/"+$scope.data._id;
        }

        $scope.go = function() {

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
