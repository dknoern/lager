(function() {
  'use strict';

  angular.module('singApp.repairs')
    .controller('RepairsCtrl', RepairsCtrl)
  ;

  RepairsCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery'];
  function RepairsCtrl ($scope, $resource, DTOptionsBuilder, jQuery) {

    jQuery('#example').DataTable( {
            "processing": true,
            "serverSide": true,
            "ordering": false,
            "ajax": "http://localhost:3000/api/repairs"
        } );

  }

})();
