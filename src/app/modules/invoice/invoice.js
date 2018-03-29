var scopeHolder;

(function() {
    'use strict';



    angular.module('singApp.invoice')
        .controller('InvoiceCtrl', InvoiceCtrl);

    InvoiceCtrl.$inject = ['$scope', '$resource', '$http', '$window', '$location', '$state', 'jQuery', 'authService'];

    function InvoiceCtrl($scope, $resource, $http, $window, $location, $state, jQuery, authService) {

        var vm = this;

        scopeHolder = $scope;


        //$scope.selectProduct = function(id){
        //    console.log("=======>>>> selected product "+ id);
        //}

        $scope.addItem = function(itemId) {

            console.log('addItem, itemId = ' + itemId);
            $http.get("api/products/" + itemId)
                .then(function(response) {

                    var lineItem = {
                        name: response.data.title,
                        productId: response.data._id,
                        itemNumber: response.data.itemNumber,
                        amount: response.data.listPrice,
                        serialNumber: response.data.serialNo,
                        modelNumber: response.data.modelNumber,
                        longDesc: response.data.longDesc
                    }

                    if ($scope.data.lineItems == null) {
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

            $('#productModal').modal('hide');
        }


        $scope.addMisc = function() {

                    var lineItem = {
                        name: '',
                        productId: '',
                        itemNumber: '',
                        amount: 0.0,
                        serialNumber: '',
                        modelNumber: '',
                        longDesc: ''
                    }

                    if ($scope.data.lineItems == null) {
                        $scope.data.lineItems = new Array();
                    }
                    $scope.data.lineItems.push(lineItem);

            $('#productModal').modal('hide');
        }

        $scope.removeItem = function(index) {
            var arr = $scope.data.lineItems;
            $scope.data.lineItems.splice(index, 1);
            $scope.computeTotals();
        }

        //function computeTotals()
        $scope.computeTotals = function() {
            var total = 0.0;
            $scope.data.lineItems.forEach(function(item) {
                total += item.amount;
            });

            $scope.data.subtotal = total;

            var taxRate = 0.00;
            if ($scope.data.shipState == "TX")
                taxRate = 0.0825;
            $scope.data.tax = taxRate * total;
            $scope.data.total = $scope.data.subtotal + $scope.data.tax + $scope.data.shipping;
        }



        $scope.dtChanged = function(dt) {
            $window.alert('Angular model changed to: ' + dt);
        };

        $scope.print = function() {
            $window.print();
        };

        if ($scope.invoiceId) {

            if ("new" == $scope.invoiceId) {
                var customerId = $location.search().customerId;


                if(authService!=null && authService.getCachedProfile() !=null && authService.getCachedProfile().name != null){
                var salesPerson = authService.getCachedProfile().name;
                if (salesPerson != null && salesPerson.length > 0 && salesPerson.indexOf("@") > 0) {
                    salesPerson = salesPerson.substring(0, salesPerson.indexOf("@"));
                }
              }

                console.log("new invoice, setting base data");

                $scope.data = {
                    salesPerson: salesPerson,
                    date: Date.now(),
                    shipping: 5.95,
                    lineItems: new Array()
                }

                if(customerId != "new"){

                console.log("existing invoice, copying customer data");

                $http.get('api/customers/' + customerId).
                success(function(customer) {
                    $scope.customer = customer;
                    var fullName = customer.firstName + ' ' + customer.lastName;

                    // fill in invoice data from existing customer
                    $scope.data.customerFirstName = customer.firstName;
                    $scope.data.customerLastName = customer.lastName;
                    $scope.data.customerId = customerId;
                    $scope.data.shipToName = fullName;
                    $scope.data.shipAddress1 = customer.address1;
                    $scope.data.shipAddress2 = customer.address2;
                    $scope.data.shipAddress3 = customer.address3;
                    $scope.data.shipCity = customer.city;
                    $scope.data.shipState = customer.state;
                    $scope.data.shipZip = customer.zip;
                });
              }

            } else {
                $scope.data = $resource('api/invoices/:id').get({
                    id: $scope.invoiceId
                });
            }

            var productId = $location.search().productId;
            if (productId != null) {
                $scope.addItem(productId);
            }

        } else if ($scope.productId) {

            $scope.invoiceType = "Partner";

            //var product = $resource('api/products/:id').get({id: $scope.productId});
            //alert('product is ' + JSON.stringify(product));
            $scope.data = {
                date: Date.now(),
                shipping: 0.00,
                tax: 0.00,
                lineItems: []
            }

            var product = $resource('api/products/:id', {
                id: '@id'
            });
            product.get({
                    id: $scope.productId
                })
                .$promise.then(function(product) {

                    $scope.data.customer = product.seller;
                    $scope.data.shipToName = product.seller;
                    $scope.data.invoiceNumber = product._id;

                    var invoiceAmount = product.cost / 2.0;

                    $scope.data.subtotal = invoiceAmount;
                    $scope.data.total = invoiceAmount;

                    alert('pushing product to array- id is '+ product._id);

                    $scope.data.lineItems.push({
                        name: product.title,
                        longDesc: product.longDesc,
                        serialNumber: product.serialNo,
                        modelNumber: product.modelNumber,
                        amount: invoiceAmount,
                        productId: product._id,
                        itemNumber: product.itemNumber
                    });

                });
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

        var productTableShown = false;

        $('#productModal').on('show.bs.modal', function(e) {
            if (productTableShown == false) {

                jQuery('#productTable').dataTable({
                    "processing": true,
                    "serverSide": true,
                    "ordering": true,
                    "ajax": {
                        "url": "/api/products",
                        "data": {
                            "status": "In Stock"
                        }
                      },
                    "order": [[ 5, 'desc' ]]
                });
                productTableShown = true;
            }
        })

        jQuery('#datetimepicker2').datetimepicker();


    }
})();
