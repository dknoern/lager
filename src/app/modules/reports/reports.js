(function() {
    'use strict';

    var theDataTable = null;

    angular.module('singApp.reports')
        .controller('ReportsCtrl', ReportsCtrl);

    ReportsCtrl.$inject = ['$scope', '$resource', '$http', '$window', 'DTOptionsBuilder', 'jQuery'];

    function ReportsCtrl($scope, $resource, $http, $window, DTOptionsBuilder, jQuery) {

        function isDailyReport(reportId) {
            return "daily-sales" == reportId;
        }

        function isMonthlyReport(reportId) {
            return "returns-summary" == reportId || "monthly-sales" == reportId;
        }





        // check date string to see if format is mm/dd/yyyy
        function isValidMMDDYYYY(dateString) {
            var isValid = true;
        console.log('checking MMDDYYYY');
            var fields = dateString.split("/");
            var month = parseInt(fields[0]);
            var day = parseInt(fields[1]);
            var year = parseInt(fields[2]);

            if (month < 1 || month > 12 || isNaN(month)) isValid = false;
            if (day < 1 || day > 31 || isNaN(day)) isValid = false;
            if (year < 1900 || year > 2100 || isNaN(year)) isValid = false;

            return isValid;
        }

        // check date string to see if format is mm/dd/yyyy
        function isValidMMYYYY(dateString) {

          console.log('checking MMYYYY');
            var isValid = true;

            var fields = dateString.split("/");
            var month = parseInt(fields[0]);
            var year = parseInt(fields[1]);

            if (month < 1 || month > 12 || isNaN(month)) isValid = false;
            if (year < 1900 || year > 2100 || isNaN(year)) isValid = false;

            return isValid;
        }

        $scope.checkDate = function() {

          console.log('checking date '+ $scope.selectedDate);
          var valid = false;
          if(isMonthlyReport($scope.reportId)) valid = isValidMMYYYY($scope.selectedDate);
          else valid = isValidMMDDYYYY($scope.selectedDate);
          document.getElementById("dateChangeButton").disabled = !valid;
        }

        $scope.selectDate = function() {
            $scope.selectedDate = document.getElementById('selectedDate').value;
            Messenger().post({
                message: 'setting date to ' + $scope.selectedDate,
                type: "success"
            });

            var fields = $scope.selectedDate.split('/');

            if(isDailyReport($scope.reportId)){

              $scope.month = fields[0];
              $scope.day = fields[1];
              $scope.year = fields[2];
              reportUrl = "/api/reports/" + $scope.reportId + "/" + $scope.year + "/" + $scope.month + "/" + $scope.day;

            }else{
              $scope.month = fields[0];
              $scope.year = fields[1];
              reportUrl = "/api/reports/" + $scope.reportId + "/" + $scope.year + "/" + $scope.month;
            }

            theDataTable.ajax.url(reportUrl).load();
        }

        $scope.print = function() {
            $window.print();
        };

        var reportId = $scope.reportId;

        if (reportId != null) {

            var reportUrl = "/api/reports/" + reportId;

            if ($scope.year == 0) {
                var d = new Date();
                $scope.year = d.getFullYear();
                $scope.month = d.getMonth() + 1;
                $scope.day = d.getDate();
            }

            if ("daily-sales" == reportId) {
                $scope.selectedDate = $scope.month + "/" + $scope.day + "/" + $scope.year;
                reportUrl += "/" + $scope.year + "/" + $scope.month + "/" + $scope.day;
            } else if ("returns-summary" == reportId || "monthly-sales" == reportId) {
                $scope.selectedDate = $scope.month + "/" + $scope.year;
                reportUrl += "/" + $scope.year + "/" + $scope.month;
            }

            theDataTable = jQuery('#example').DataTable({
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
