(function() {
    'use strict';

    angular
        .module('singApp', [
        'auth0.auth0',
        'angular-jwt',
        'ui.router',
        'angularFileUpload',
        'singApp.core',
        'singApp.customers',
        'singApp.customer',
        'singApp.components.dropzone',
        'singApp.inventory',
        'singApp.item',
        'singApp.invoices',
        'singApp.invoice',
        'singApp.returns',
        'singApp.return',
        'singApp.repair',
        'singApp.repairs',
        'singApp.reports',
        'singApp.out',
        'singApp.outitem',
        'singApp.log',
        'singApp.logitem'

  ]).config(config);

        config.$inject = [
          '$stateProvider',
          '$locationProvider',
          '$urlRouterProvider',
          'angularAuth0Provider',
          '$httpProvider',
          'jwtOptionsProvider'
        ];

        function config(
          $stateProvider,
          $locationProvider,
          $urlRouterProvider
         , angularAuth0Provider,
         $httpProvider,
         jwtOptionsProvider
        ) {


            $stateProvider
            .state('callback', {
              url: '/callback',
              controller: 'CallbackController',
              templateUrl: 'app/callback/callback.html',
                controllerAs: 'vm'
              });

          angularAuth0Provider.init({
            clientID: AUTH0_CLIENT_ID,
            domain: AUTH0_DOMAIN,
            responseType: 'token id_token',
            audience: AUTH0_AUDIENCE,
            redirectUri: AUTH0_CALLBACK_URL,
            scope: 'openid profile',
            icon: 'https://www.demesy.com/media/wysiwyg/footer-logo.png'
          });

          $locationProvider.hashPrefix('');

          jwtOptionsProvider.config({
               tokenGetter: function() {
                 return localStorage.getItem('access_token');
               },
               //whiteListedDomains: ['localhost']
             });

             $httpProvider.interceptors.push('jwtInterceptor');


          /// Comment out the line below to run the app
          // without HTML5 mode (will use hashes in routes)
        //  $locationProvider.html5Mode(true);
        }

      })();
