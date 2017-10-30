(function() {
    'use strict';

    angular.module('singApp.reports')
        .controller('ReportsCtrl', ReportsCtrl);

    ReportsCtrl.$inject = ['$scope', '$resource', '$http', '$window', 'DTOptionsBuilder', 'jQuery'];

    function ReportsCtrl($scope, $resource, $http, $window, DTOptionsBuilder, jQuery) {


        var month = $scope.month;
        var day = $scope.day;
        var year = $scope.year;

        $scope.print = function() {
            $window.print();
        };

        var reportId = $scope.reportId;

        if (reportId != null) {

            var reportUrl = "/api/reports/" + reportId;

            if ("daily-sales" == reportId) {

                if (year == 0) {

                    /*
                    $http.get('api/reports/last-sale-date').
                    success(function(lastSaleDate) {
                        var dateFields = lastSaleDate.split("/");
                        $scope.year = dateFields[0];
                        $scope.month = dateFields[1];
                        $scope.day = dateFields[2];
                        $scope.lastSaleDate = lastSaleDate;

                    });
                    */

                    var d = new Date();
                    $scope.year = d.getFullYear();
                    $scope.month = d.getMonth()+ 1;
                    $scope.day = d.getDate();
                }
                reportUrl += "/" + $scope.year + "/" + $scope.month + "/" + $scope.day;
            }


            jQuery('#example').DataTable({
                "processing": true,
                "serverSide": true,
                "ordering": false,
                "paging": false,
                "searching": false,
                "info": false,
                "pageLength": 200,
                "ajax": reportUrl
            });
        }

    }

})();
