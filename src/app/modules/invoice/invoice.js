(function() {
  'use strict';

  angular.module('singApp.invoice')
    .controller('InvoiceCtrl', InvoiceCtrl)
  ;

  InvoiceCtrl.$inject = ['$scope', '$resource','$http', '$window', '$location','$state', 'jQuery'];
  function InvoiceCtrl ($scope, $resource, $http,$window, $location, $state, jQuery) {
    $scope.dtChanged = function(dt){
      $window.alert('Angular model changed to: ' + dt);
    };

    if ($scope.invoiceId) {

      if("new" == $scope.invoiceId){

        var customerId = $location.search().customerId;

        $http.get('api/customers/' + customerId).
          success(function (customer) {
            $scope.customer = customer;

            var fullName = customer.firstName + ' ' + customer.lastName;


            $scope.data = {
              customer: fullName,
              customerId: customerId,
              salesPerson: "Ke",
              date: new Date(),
              shipToName: fullName,
              shipAddress1: customer.address1,
              shipAddress2: customer.address2,
              shipAddress3: customer.address3,
              shipCity: customer.city,
              shipState: customer.state,
              shipZip: customer.zip
            }
          });

      }else{
      $scope.data = $resource('api/invoices/:id').get({id: $scope.invoiceId});

      }

      $scope.products = $resource('api/products').query();

    }


    $scope.addItem = function(itemId)
    {
      $http.get("api/products/"+itemId)
      .then(function(response) {

        var lineItem = {
          name: response.data.title,
          id: response.data._id,
          itemNo: response.data.itemNo,
          amount: response.data.listPrice
        }

        $scope.data.lineItems.push(lineItem);


        computeTotals();
      });
    }

    $scope.removeItem = function(index)
    {
      var arr = $scope.data.lineItems;
      $scope.data.lineItems.splice(index,1);
      computeTotals();
    }

    function computeTotals()
    {
      var total = 0.0;
      $scope.data.lineItems.forEach(function(item) {
         total += item.amount;
       });

      $scope.data.subtotal = total;
      $scope.data.tax = 0.09 * total;
      $scope.data.shipping = 0.0;
      $scope.data.total = $scope.data.subtotal + $scope.data.tax + $scope.data.shipping;
    }

    $scope.go = function() {

        $http({
            method: "POST",
            url: "api/invoices/",
            data: angular.toJson($scope.data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            console.log(response.statusText);
            $state.go('app.invoices');
        }, function errorCallback(response) {
            console.log(response.statusText);
        });
    }

    jQuery('#datetimepicker2').datetimepicker();
  }
})();
