(function() {
    'use strict';

    angular.module('singApp.item')
        .controller('ItemCtrl', ItemCtrl);

    ItemCtrl.$inject = ['$scope', '$rootScope','$sce','$resource', '$http', '$window', '$location', '$state', 'jQuery'];

    function ItemCtrl($scope, $rootScope, $sce, $resource, $http, $window, $location, $state, jQuery,$upload) {
        $scope.dtChanged = function(dt) {
            $window.alert('Angular model changed to: ' + dt);
        };

        if ($scope.itemId) {
                    $http.get('api/upload/'+$scope.itemId).
                    success(function(images) {
                        $scope.images = images;
                    });


            $http.get('api/products/'+$scope.itemId).
            success(function(result) {
                $scope.data = result;
                console.log('status:',$scope.data.status);

                $http.get('api/repairs/products/'+$scope.itemId).
                success(function(images) {
                    $scope.repairs = images;
                    $scope.totalRepairCost = 0;
    
                    for( var i =0;i<$scope.repairs.length;i++){
                        if( typeof $scope.repairs[i].repairCost== 'number')
                        {
                            $scope.totalRepairCost += $scope.repairs[i].repairCost;
                        }

                        // vendor may have changed, get current vendor for repair history item
                        try {
                            for (var j = 0; j < $scope.data.history.length; j++) {
                                if ($scope.data.history[j].refDoc == $scope.repairs[i]._id) {
                                    if ($scope.data.history[j].action.startsWith('in repair -')) {
                                        $scope.data.history[j].action = 'in repair - ' + $scope.repairs[i].vendor;
                                    }
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                });
            });

        }else{
            $scope.data = {"status":"In Stock"};
        }

        $scope.getPartnerInvoice = function() {
            alert('getting partner invoice');
            $window.location = "/#/app/partnerinvoice/" + $scope.data._id;
        }

        $scope.cloneItem = function() {
          $scope.data.paymentAmount = 0.0;
          $scope.data._id=null;
          $scope.data.seller=null;
          $scope.data.status="In Stock";
          $scope.data.itemNumber=null;
          $scope.data.history = null;
          $scope.data.serialNo = null;
          $scope.data.cost = null;
          $scope.data.totalRepairCost = null;
          $scope.repairs = null;

          Messenger().post({
            message: "Item cloned. Enter new seller, serial number, and cost then save.",
            type: "success"
          });
        }


        $scope.toggleStatus = function(status1, status2) {

          var newStatus = "";
          var statusChanged = false;

          if($scope.data.status == status1){
            newStatus =status2;
            statusChanged = true;
          }

          else if($scope.data.status == status2){
            newStatus = status1;
              statusChanged = true;
          }


          if(statusChanged) {


              var statusData = {
                  "status": newStatus
              }

              $http.put('api/products/' + $scope.itemId + '/status', statusData).then(function successCallback(response) {
                  console.log(response.statusText);

                  $scope.data = $resource('api/products/:id').get({
                      id: $scope.itemId
                  });


              }, function errorCallback(response) {
                  console.log(response.statusText);
              });




              Messenger().post({
                  message: "setting item status to <i>" + newStatus + "</i>",
                  type: "success"
              });
          }

      }

        $scope.addNote = function() {
            var itemId = document.getElementById('itemId').value;
            var noteText = document.getElementById('noteText').value;

            $http({
                method: "POST",
                url: "api/products/"+itemId+"/notes",
                data: {
                    noteText: noteText
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);

                $scope.data.history =  $resource('api/products/:id/notes').query({
                    id: $scope.itemId
                });


            }, function errorCallback(response) {
                console.log(response.statusText);
            });

            Messenger().post({
                message: "Note added.",
                type: "success"
            });

            document.getElementById('noteText').value = "";

        }

        $scope.go = function() {

            $http({
                method: "POST",
                url: "api/products/",
                data: angular.toJson($scope.data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);
                $state.go('app.inventory');

                Messenger().post({
                    message: 'item saved',
                    type: "success",
                });

            }, function errorCallback(response) {


                if(response.status==409 && response.data.error.includes('already exists')){
                    // undelete?
                    $('#itemUndeleteModal').modal('toggle')
                }
                else{
                    Messenger().post({
                        message: response.data.error,
                        type: "danger",
                    });
                }

            });
        }

        $scope.deleteItem = function () {

            var itemId = document.getElementById('itemId').value;
            var itemNumber = document.getElementById('itemNumber').value;

            $http({
                method: "DELETE",
                url: "api/products/" + itemId,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);
                $state.go('app.inventory');

                Messenger().post({
                        message: 'Deleted item ' + itemNumber,
                        type: "success",
                        showCloseButton: true
                    }
                );

            }, function errorCallback(response) {
                console.log(response.statusText);
            });
        }
        $scope.undelete = function() {
            var itemNumber = document.getElementById('itemNumber').value;
        
                $http.put('api/products/' + itemNumber + '/undelete').then(function successCallback(response) {
                    $scope.data = $resource('api/products/:id').get({
                        id: response.data._id
                    });

                }, function errorCallback(response) {
                    console.log(response.statusText);
                });
  
                Messenger().post({
                    message: "undeleted item " + itemNumber,
                    type: "success"
                });
        }
  

        $scope.imagesAdded = function(){
            $http.get('api/upload/'+$scope.itemId).
            success(function(images) {
                $scope.images = images;
            });
        }

        $scope.uploadFile = function(){

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


        $scope.rotate = function(url, direction){

            var filename = url.split("/")[2];

            if(filename.indexOf("?")>0){
                filename = filename.split("?")[0];
            }

            $http.get('api/upload/rotate/'+filename +'/'+direction).
            success(function(images) {

                $http.get('api/upload/'+$scope.itemId).
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




        jQuery('#datetimepicker2').datetimepicker();

        var customerTableShown = false;

            $('#customerModal').on('show.bs.modal', function (e) {

              if(customerTableShown==false){

                  jQuery('#customerTable').DataTable( {
                      "processing": true,
                      "serverSide": true,
                      "ordering": false,
                      "ajax": {
                          url: "/api/customers",
                          headers: {
                              "Authorization": "Bearer " + localStorage.getItem('access_token')
                          }
                      }
                  } );
                  customerTableShown = true;
                }
            })
    }
})();
