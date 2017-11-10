(function() {
  'use strict';

  angular.module('singApp.inventory')
    .controller('AngularWayCtrl', AngularWayCtrl)
  ;

  AngularWayCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery','authService'];
  function AngularWayCtrl ($scope, $resource, DTOptionsBuilder, jQuery,authService) {

    var vm = this;
    vm.auth = authService;

  jQuery('#example').DataTable( {
          "processing": true,
          "serverSide": true,
          "ordering": false,
          "pageLength": 50,
          "ajax": "/api/products"
      } );
  }

})();
