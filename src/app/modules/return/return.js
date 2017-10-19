(function() {
  'use strict';

  angular.module('singApp.return')
    .controller('ReturnCtrl', ReturnCtrl)
  ;

  ReturnCtrl.$inject = ['$scope', '$resource','$http', '$window', '$location','$state', 'jQuery'];
  function ReturnCtrl ($scope, $resource, $http,$window, $location, $state, jQuery) {
    $scope.dtChanged = function(dt){
      $window.alert('Angular model changed to: ' + dt);
    };

    if ($scope.returnId) {

      if("new" == $scope.returnId){

        var invoiceId = $location.search().invoiceId;

        $http.get('api/invoices/' + invoiceId).
          success(function (invoice) {
            $scope.invoice = invoice;

            var returnItems = new Array();

            for(var i=0;i<invoice.lineItems.length;i++)
            {
              var returnItem = {
                lineItemId: invoice.lineItems[i].lineItemId,
                productId: invoice.lineItems[i].productId,
                name: invoice.lineItems[i].name,
                amount: invoice.lineItems[i].amount,
                itemNo: invoice.lineItems[i].itemNo,
                serialNo: invoice.lineItems[i].serialNo,
                modelNumber: invoice.lineItems[i].modelNumber,
                longDesc: invoice.lineItems[i].longDesc,
                included: true
              }
              returnItems.push(returnItem);
            }

            $scope.data = {
              invoiceNumber: invoice.invoiceNumber,
              customer: invoice.customer,
              customerId: invoice.customerId,
              salesPerson: invoice.salesPerson,
              date: Date.now(),
              lineItems: returnItems
            }
          });

      }else{
      $scope.data = $resource('api/returns/:id').get({id: $scope.returnId});

      }


    }


    $scope.includeItem = function(i,included)
    {
        $scope.data.lineItems[i].included = included;
        $scope.computeTotals();
    }

    //function computeTotals()
    $scope.computeTotals = function()
    {
      var total = 0.0;
      $scope.data.lineItems.forEach(function(item) {
        if(item.included)
        {
         total += item.amount;
        }
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
            url: "api/returns/",
            data: angular.toJson($scope.data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function successCallback(response) {
            console.log(response.statusText);
            $state.go('app.returns');
        }, function errorCallback(response) {
            console.log(response.statusText);
        });
    }

    jQuery('#datetimepicker2').datetimepicker();
  }
})();
