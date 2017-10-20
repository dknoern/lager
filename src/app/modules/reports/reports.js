(function() {
  'use strict';

  angular.module('singApp.reports')
    .controller('ReportsCtrl', ReportsCtrl)
  ;

  ReportsCtrl.$inject = ['$scope', '$resource', '$window','DTOptionsBuilder', 'jQuery'];
  function ReportsCtrl ($scope, $resource, $window, DTOptionsBuilder, jQuery) {

    $scope.print = function(){
      $window.print();
    };

    var reportId = $scope.reportId;

    if(reportId!=null){



    jQuery('#example').DataTable( {
            "processing": true,
            "serverSide": true,
            "ordering": false,
            "paging": false,
            "searching": false,
            "info": false,
            "pageLength": 200,
            "ajax": "/api/reports/"+reportId
        } );
      }


  }


})();
