(function() {
  'use strict';

  angular.module('singApp.invoices')
    .controller('InvoicesCtrl', InvoicesCtrl)
  ;

  InvoicesCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery'];
  function InvoicesCtrl ($scope, $resource, DTOptionsBuilder, jQuery) {

    jQuery('#example').DataTable( {
            "processing": true,
            "serverSide": true,
            "ordering": false,
            "ajax": "/api/invoices"
        } );


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
