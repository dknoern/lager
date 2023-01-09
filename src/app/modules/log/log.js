(function () {
    'use strict';

    angular.module('singApp.log')
        .controller('LogCtrl', LogCtrl)
    ;

    LogCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery', 'authService', '$window'];

    function LogCtrl($scope, $resource, DTOptionsBuilder, jQuery, authService, $window) {

        var vm = this;
        vm.auth = authService;

        var d = new Date();
        $scope.year = d.getFullYear();
        $scope.month = d.getMonth() + 1;
        $scope.day = d.getDate();


        jQuery('#example').DataTable({
            "processing": true,
            "serverSide": true,
            "ordering": false,
            "pageLength": 50,
            "ajax": "/api/logs",
            "dom": 'Bfrtip',
            stateSave: true,
            "buttons": [
                {
                    extend: 'excel',
                    title: 'Log-In Record',
                    text: 'Excel <i class="fa fa-file-excel-o"></i>'
                    //,className: "btn btn-inverse"
                }
                , {
                    extend: 'pdf',
                    title: 'Log-In Record',
                    text: 'PDF <i class="fa fa-file-pdf-o"></i>'
                }, {
                    extend: 'print',
                    title: 'Log-In Record',
                    text: 'Print <i class="fa fa-print"></i>'
                }
            ]

        });



        $scope.print = function() {
            $window.print();
        };
    }

})();
