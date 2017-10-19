(function() {
  'use strict';

  angular.module('singApp.invoice')
    .controller('InvoiceCtrl', InvoiceCtrl)
  ;

  InvoiceCtrl.$inject = ['$scope', '$resource','$http', '$window', '$location','$state', 'jQuery','authService'];
  function InvoiceCtrl ($scope, $resource, $http,$window, $location, $state, jQuery,authService) {

    var vm = this;

    $scope.dtChanged = function(dt){
      $window.alert('Angular model changed to: ' + dt);
    };

    $scope.print = function(){
      $window.print();
    };

    if ($scope.invoiceId) {

      if("new" == $scope.invoiceId){
        var customerId = $location.search().customerId;
        $http.get('api/customers/' + customerId).
          success(function (customer) {
            $scope.customer = customer;
            var fullName = customer.firstName + ' ' + customer.lastName;
            var salesPerson = authService.getCachedProfile().name;
            if(salesPerson!=null&&salesPerson.length>0&&salesPerson.indexOf("@")>0)
            {
              salesPerson = salesPerson.substring(0,salesPerson.indexOf("@"));
            }

            $scope.data = {
              customer: fullName,
              customerId: customerId,
              salesPerson: salesPerson,
              date: Date.now(),
              shipToName: fullName,
              shipping: 5.95,
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

      $scope.products = $resource('api/instock').query();

    }else if ($scope.productId) {

      $scope.invoiceType ="Partner";

      //var product = $resource('api/products/:id').get({id: $scope.productId});
      //alert('product is ' + JSON.stringify(product));
      $scope.data = {
        date: Date.now(),
        shipping: 0.00,
        tax: 0.00,
        lineItems: []
      }

      var product = $resource('api/products/:id', {id:'@id'});
      product.get({id:$scope.productId})
     .$promise.then(function(product) {

       $scope.data.customer = product.seller;
       $scope.data.shipToName = product.seller;
       $scope.data.invoiceNumber = product._id;

       var invoiceAmount = product.cost / 2.0;

       $scope.data.subtotal = invoiceAmount;
       $scope.data.total = invoiceAmount;

       $scope.data.lineItems.push({
         name: product.title,
         longDesc: product.longDesc,
         serialNo: product.serialNo,
         modelNumber: product.modelNumber,
         amount: invoiceAmount
       });

    });

      //$scope.data.lineItems.push($resource('api/instock').query());

    }

    $scope.addItem = function(itemId)
    {
      $http.get("api/products/"+itemId)
      .then(function(response) {

        var lineItem = {
          name: response.data.title,
          productId: response.data._id,
          itemNo: response.data.itemNo,
          amount: response.data.listPrice,
          serialNo: response.data.serialNo,
          modelNumber: response.data.modelNumber,
          longDesc: response.data.longDesc
        }

        if($scope.data.lineItems==null){
          $scope.data.lineItems = new Array();
        }
        $scope.data.lineItems.push(lineItem);
        $scope.computeTotals();


        // remove selected item from list
        /*
        for(var i=0;i<$scope.products;i++){
          if($scope.products[i]._id == itemId){
            $scope.products.splice(i,1);
          }
        }
        */


      });
    }

    $scope.removeItem = function(index)
    {
      var arr = $scope.data.lineItems;
      $scope.data.lineItems.splice(index,1);
      $scope.computeTotals();
    }

    //function computeTotals()
    $scope.computeTotals = function()
    {
      var total = 0.0;
      $scope.data.lineItems.forEach(function(item) {
         total += item.amount;
       });

      $scope.data.subtotal = total;

      var taxRate = 0.00;
      if($scope.data.shipState == "TX")
        taxRate = 0.0825;
      $scope.data.tax = taxRate * total;
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
