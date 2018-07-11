(function() {
  'use strict';

  angular.module('singApp.inventory')
    .controller('AngularWayCtrl', AngularWayCtrl)
  ;

  AngularWayCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery','authService'];
  function AngularWayCtrl ($scope, $resource, DTOptionsBuilder, jQuery,authService) {

    var vm = this;
    vm.auth = authService;

    var accessToken = localStorage.getItem('access_token');

  jQuery('#example').DataTable( {
          "processing": true,
          "serverSide": true,
          "ordering": true,
          "pageLength": 50,
          "ajax": {
              url: "/api/products",
              headers: {
                  "Authorization": "Bearer " + accessToken
              }
              },
          "order": [[ 5, 'desc' ]]
      } );
  }

})();
