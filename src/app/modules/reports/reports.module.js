(function() {
  'use strict';

  var module = angular.module('singApp.reports', [
    'ui.router',
    'ngResource',
    'datatables',
    'datatables.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.reports', {
        url: '/reports',
        templateUrl: 'app/modules/reports/reports.html',
        controller: 'ReportsCtrl'
      });

      $stateProvider
        .state('app.reports1', {
          url: '/reports/1',
          templateUrl: 'app/modules/reports/reports.html',
          controller: 'ReportsCtrl'
        });


      $stateProvider
        .state('app.reports2', {
          url: '/reports/2',
          templateUrl: 'app/modules/reports/reports.html',
          controller: 'ReportsCtrl'
        });
        $stateProvider
          .state('app.reports3', {
            url: '/reports/3',
            templateUrl: 'app/modules/reports/reports.html',
            controller: 'ReportsCtrl'
          });

          $stateProvider
            .state('app.reports4', {
              url: '/reports/4',
              templateUrl: 'app/modules/reports/reports.html',
              controller: 'ReportsCtrl'
            });

            $stateProvider
              .state('app.reports5', {
                url: '/reports/5',
                templateUrl: 'app/modules/reports/reports.html',
                controller: 'ReportsCtrl'
              });

              $stateProvider
                .state('app.reports6', {
                  url: '/reports/6',
                  templateUrl: 'app/modules/reports/reports.html',
                  controller: 'ReportsCtrl'
                });

                $stateProvider
                  .state('app.reports7', {
                    url: '/reports/7',
                    templateUrl: 'app/modules/reports/reports.html',
                    controller: 'ReportsCtrl'
                  });


                                  $stateProvider
                                    .state('app.reports8', {
                                      url: '/reports/8',
                                      templateUrl: 'app/modules/reports/reports.html',
                                      controller: 'ReportsCtrl'
                                    });


                                                    $stateProvider
                                                      .state('app.reports9', {
                                                        url: '/reports/9',
                                                        templateUrl: 'app/modules/reports/reports.html',
                                                        controller: 'ReportsCtrl'
                                                      });


                                                                      $stateProvider
                                                                        .state('app.reports10', {
                                                                          url: '/reports/10',
                                                                          templateUrl: 'app/modules/reports/reports.html',
                                                                          controller: 'ReportsCtrl'
                                                                        });




  }
})();
