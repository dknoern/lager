(function () {
  'use strict';

  angular.module('singApp.return')
    .controller('ReturnCtrl', ReturnCtrl)
    ;

  ReturnCtrl.$inject = ['$scope', '$resource', '$http', '$window', '$location', '$state', 'jQuery'];
  function ReturnCtrl($scope, $resource, $http, $window, $location, $state, jQuery) {
    if ($scope.returnId) {

      if ("new" == $scope.returnId) {

        var invoiceId = $location.search().invoiceId;

        $http.get('api/invoices/' + invoiceId).
          success(function (invoice) {
            $scope.invoice = invoice;

            var returnItems = new Array();

            for (var i = 0; i < invoice.lineItems.length; i++) {
              var returnItem = {
                itemNumber: invoice.lineItems[i].itemNumber,
                productId: invoice.lineItems[i].productId,
                name: invoice.lineItems[i].name,
                amount: invoice.lineItems[i].amount,
                itemNo: invoice.lineItems[i].itemNo,
                serialNo: invoice.lineItems[i].serialNumber,
                longDesc: invoice.lineItems[i].longDesc,
                included: true
              }
              returnItems.push(returnItem);

            }


            $scope.data = {
              invoiceId: invoice._id,
              customerName: invoice.customerFirstName + " " + invoice.customerLastName,
              customerId: invoice.customerId,
              salesPerson: invoice.salesPerson,
              returnDate: Date.now(),
              shipping: 0,
              subTotal: invoice.subtotal,
              totalReturnAmount: invoice.total,
              taxable: "TX" == invoice.shipState && !invoice.taxExempt,
              salesTax: invoice.tax,
              lineItems: returnItems
            }
          });

      } else {
        $scope.data = $resource('api/returns/:id').get({ id: $scope.returnId });
      }
    }

    $scope.includeItem = function (i, included) {
      $scope.data.lineItems[i].included = included;
      $scope.computeTotals();
    }

    $scope.computeTotals = function () {
      var total = 0.0;
      $scope.data.lineItems.forEach(function (item) {
        if (item.included) {
          total += item.amount;
        }
      });

      $scope.data.subTotal = total;

      var taxRate = 0.00;
      if ($scope.data.taxable)
        taxRate = 0.0825;
      $scope.data.salesTax = taxRate * total;

      $scope.data.totalReturnAmount = $scope.data.subTotal + $scope.data.salesTax + $scope.data.shipping;
    }

    $scope.go = function () {

      $http({
        method: "POST",
        url: "api/returns/",
        data: angular.toJson($scope.data),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        $state.go('app.returns');
      }, function errorCallback(response) {
        // Error handled by UI
      });
    }

    jQuery('#datetimepicker2').datetimepicker();
  }
})();
