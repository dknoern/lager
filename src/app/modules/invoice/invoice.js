var scopeHolder;

(function() {
    'use strict';

    angular.module('singApp.invoice')
        .controller('InvoiceCtrl', InvoiceCtrl);

    InvoiceCtrl.$inject = ['$scope', '$resource', '$http', '$window', '$location', '$state', 'jQuery', 'authService', 'refdataService'];

    function InvoiceCtrl($scope, $resource, $http, $window, $location, $state, jQuery, authService, refdataService) {

        var vm = this;

        scopeHolder = $scope;

        $scope.states = refdataService.states();

        $scope.email = function() {


            $http({
                method: "POST",
                url: "api/invoices/email",
                data: {
                    emailAddresses: document.getElementById('emailAddresses').value,
                    invoiceId: $scope.data._id,
                    note: document.getElementById('note').value
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.statusText);

                Messenger().post({
                    message: 'invoice emailed to '+ document.getElementById('emailAddresses').value,
                    type: "success",
                });

            }, function errorCallback(response) {


                Messenger().post({
                    message: "unable to email invoice: " + response.data.error,
                    type: "error",
                });

            });

        }



        $scope.copyAddress = function() {

            var copying = document.getElementById('copyAddress').checked;

            if(copying) {
                $scope.data.billingAddress1 = $scope.data.shipAddress1;
                $scope.data.billingAddress2 = $scope.data.shipAddress2;
                $scope.data.billingAddress3 = $scope.data.shipAddress3;
                $scope.data.billingCity = $scope.data.shipCity;
                $scope.data.billingState = $scope.data.shipState;
                $scope.data.billingZip = $scope.data.shipZip;
                $scope.data.billingCountry = $scope.data.shipCountry;
            }
        }

        $scope.addItem = function(itemId) {

            console.log('addItem, itemId = ' + itemId);
            $http.get("api/products/" + itemId)
                .then(function(response) {

                    var lineItem = {
                        name: response.data.title,
                        productId: response.data._id,
                        itemNumber: response.data.itemNumber,
                        amount: response.data.sellingPrice,
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
            if ($scope.data.shipState == "TX" && $scope.data.taxExempt == false)
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


                $scope.printableUrl = '/api/invoices/' + $scope.invoiceId + '/print?t='+ new Date().getTime();


                if ("new" == $scope.invoiceId) {
                var customerId = $location.search().customerId;


                if(authService!=null && authService.getCachedProfile() !=null && authService.getCachedProfile().name != null){
                var salesPerson = authService.getCachedProfile().name;
                if (salesPerson != null && salesPerson.length > 0 && salesPerson.indexOf("@") > 0) {
                    salesPerson = salesPerson.substring(0, salesPerson.indexOf("@"));
                }

                    if("ryan" == salesPerson)  salesPerson = "Ryan Ables";
                    else if("marijo" == salesPerson) salesPerson = "Mari Jo Bueno";
                    else if("colby" == salesPerson) salesPerson = "Colby Vick";
                    else if("janet" == salesPerson) salesPerson = "Janet Gary";
                    else if("david" == salesPerson) salesPerson = "David Knoernschild";

                }

                console.log("new invoice, setting base data....");

                $scope.data = {
                    salesPerson: salesPerson,
                    date: Date.now(),
                    shipping: 45.00,
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
                    $scope.data.shipCountry = customer.country;
                    $scope.data.customerEmail = customer.email;
                    $scope.data.copyAddress = customer.copyAddress;
                    $scope.data.billingAddress1 = customer.billingAddress1;
                    $scope.data.billingAddress2 = customer.billingAddress2;
                    $scope.data.billingAddress2 = customer.billingAddress3;
                    $scope.data.billingCity = customer.billingCity;
                    $scope.data.billingState = customer.billingState;
                    $scope.data.billingZip = customer.billingZip;
                    $scope.data.billingCountry = customer.billingCountry;
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


            // partner invoice... find invoice by type and lineItem productID;

            $http.get('api/invoices/partner/'+$scope.productId).
            success(function(invoice) {
                $scope.data = invoice;
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

                var accessToken = localStorage.getItem('access_token');

                jQuery('#productTable').dataTable({
                    "processing": true,
                    "serverSide": true,
                    "ordering": true,
                    "ajax": {
                        "url": "/api/products",
                        "data": {
                            "status": "Available" // will trigger backend query for In Stock and Partnership
                        },
                        "headers": {
                            "Authorization": "Bearer " + accessToken
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
