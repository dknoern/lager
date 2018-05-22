var scopeHolder;

(function() {
    'use strict';

    angular.module('singApp.repairs')
        .controller('RepairsCtrl', RepairsCtrl);

    RepairsCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery'];

    function RepairsCtrl($scope, $resource, DTOptionsBuilder, jQuery) {

        scopeHolder = $scope;

        var theDataTable = jQuery('#example').DataTable({
            "processing": true,
            "serverSide": true,
            "ordering": false,
            "ajax": "/api/repairs?filter=outstanding"
        });

        $scope.toggleRepairFilter = function() {
            var repairFilter = document.getElementById("repairFilter");
            theDataTable.ajax.url("/api/repairs?filter="+ repairFilter.value).load();
        };

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
