(function () {
    'use strict';

    angular.module('singApp.out')
        .controller('OutCtrl', OutCtrl)
    ;

    OutCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', 'jQuery', 'authService', '$window'];

    function OutCtrl($scope, $resource, DTOptionsBuilder, jQuery, authService, $window) {

        var vm = this;
        vm.auth = authService;

        var d = new Date();
        $scope.year = d.getFullYear();
        $scope.month = d.getMonth() + 1;
        $scope.day = d.getDate();

        var accessToken = localStorage.getItem('access_token');
        jQuery('#example').DataTable({
            "processing": true,
            "serverSide": true,
            "ordering": false,
            "pageLength": 10,
            "ajax": {
                "url": "/api/outs",
                "headers": {
                    "Authorization": "Bearer " + accessToken
                }
            },
            "dom": 'Bfrtip',
            stateSave: true,
            "buttons": [
                {
                    extend: 'excel',
                    title: 'Log-Out Record',
                    text: 'Excel <i class="fa fa-file-excel-o"></i>'
                }
                , {
                    extend: 'pdf',
                    title: 'Out-In Record',
                    text: 'PDF <i class="fa fa-file-pdf-o"></i>'
                }, {
                    extend: 'print',
                    title: 'Out-In Record',
                    text: 'Print <i class="fa fa-print"></i>'
                }
            ]
        });

        $scope.print = function() {
            $window.print();
        };
    }
})();
