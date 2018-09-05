(function() {
  'use strict';

  angular.module('singApp.returns')
    .controller('ReturnsCtrl', ReturnsCtrl)
  ;

  ReturnsCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery'];
  function ReturnsCtrl ($scope, $resource, DTOptionsBuilder, jQuery) {

      var accessToken = localStorage.getItem('access_token');


    jQuery('#example').DataTable( {
            "processing": true,
            "serverSide": true,
            "ordering": false,
        stateSave: true,
        "ajax": {
            url: "/api/returns",
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        }

        } );

  }

})();
