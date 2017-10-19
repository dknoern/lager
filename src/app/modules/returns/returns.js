(function() {
  'use strict';

  angular.module('singApp.returns')
    .controller('ReturnsCtrl', ReturnsCtrl)
  ;

  ReturnsCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery'];
  function ReturnsCtrl ($scope, $resource, DTOptionsBuilder, jQuery) {

    jQuery('#example').DataTable( {
            "processing": true,
            "serverSide": true,
            "ordering": false,
            "ajax": "/api/returns"
        } );

  }

})();
