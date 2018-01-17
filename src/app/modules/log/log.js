(function() {
  'use strict';

  angular.module('singApp.log')
    .controller('LogCtrl', LogCtrl)
  ;

  LogCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery','authService'];
  function LogCtrl ($scope, $resource, DTOptionsBuilder, jQuery,authService) {

    var vm = this;
    vm.auth = authService;



      var d = new Date();
      $scope.year = d.getFullYear();
      $scope.month = d.getMonth() + 1;
      $scope.day = d.getDate();

/*

  jQuery('#example').DataTable( {
          "processing": true,
          "serverSide": true,
          "ordering": false,
          "pageLength": 50,
          "ajax": "/api/products"
      } );

*/



  }


})();
