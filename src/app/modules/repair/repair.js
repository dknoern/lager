(function() {
  'use strict';

  angular.module('singApp.repair')
    .controller('RepairCtrl', RepairCtrl)
  ;

  RepairCtrl.$inject = ['$scope', '$resource','$http', '$window', '$location','$state', 'jQuery'];
  function RepairCtrl ($scope, $resource, $http,$window, $location, $state, jQuery) {
    $scope.dtChanged = function(dt){
      $window.alert('Angular model changed to: ' + dt);
    };

    if ($scope.repairId) {

      if("new" == $scope.repairId){
        $scope.data = {
          dateOut: Date.now()
        };

      }else{
      $scope.data = $resource('api/repairs/:id').get({id: $scope.repairId});

      }
      $scope.products = $resource('api/products').query();
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
        });
    }



    $scope.selectItem = function(itemId)
    {
      $http.get("api/products/"+itemId)
      .then(function(response) {

        $scope.data.productId = response.data._id;
        $scope.data.itemNumber = response.data.itemNo;
        $scope.data.description = response.data.title




      });
    }




    jQuery('#datetimepicker2').datetimepicker();
  }
})();
