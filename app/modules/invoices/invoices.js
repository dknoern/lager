(function () {
  'use strict';

  angular.module('singApp.invoices')
    .controller('InvoicesCtrl', InvoicesCtrl)
    ;

  InvoicesCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery'];
  function InvoicesCtrl($scope, $resource, DTOptionsBuilder, jQuery) {

    var accessToken = localStorage.getItem('access_token');

    jQuery('#example').DataTable({
      "processing": true,
      "serverSide": true,
      "ordering": false,
      stateSave: true,
      "ajax": {
        url: "/api/invoices",
        headers: {
          "Authorization": "Bearer " + accessToken
        }
      }
    });

    var customerTableShown = false;

    $('#customerModal').on('show.bs.modal', function (e) {

      if (customerTableShown == false) {

        jQuery('#customerTable').DataTable({
          "processing": true,
          "serverSide": true,
          "ordering": false,
          "ajax": {
            url: "/api/customers?modal=true",
            headers: {
              "Authorization": "Bearer " + accessToken
            }
          }
        });
        customerTableShown = true;
      }
    })
  }
})();
